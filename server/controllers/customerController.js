const Customer = require('../models/Customer');
const { getTableData } = require('../utils/tableGenerator'); // Utility for table data

const addCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.conn, req.conn1);
        var params = req.body;
        params.organization_id = req.user.organization_id;

        await customer.addCustomer(params);
        // const tableHtml = await getTableData(req.conn, 'customer'); // Get data for 'customer' table
        res.status(200).json({ data: "success", status: 200 });
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).send('Error adding customer');
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.conn, req.conn1);
        var params = req.body;
        params.organization_id = req.user.organization_id;

        await customer.updateCustomer(params);
        // const tableHtml = await getTableData(req.conn, 'customer'); // Get data for 'customer' table
        res.json({ message: global.lang['customer updated'] });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).send('Error updating customer');
    }
};

const getLastCustomerTransactions = async (req, res) => {
    try {
        const { cus_sup_code } = req.body;
        if (!cus_sup_code) {
            return res.status(400).json({ error: 'cus_sup_code is required' });
        }
        const [rows] = await req.conn.execute("SELECT debit_amount as total, debit_date as date, 'sales' as type, customer_supplier_code FROM debit WHERE customer_supplier_code = ? AND organization_id = ? ORDER BY date DESC LIMIT 5", [cus_sup_code, req.user.organization_id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching last customer transactions:', error);
        res.status(500).send('Error fetching last customer transactions');
    }
};


const getAllCustomers = async (req, res) => {
    try {
      const [rows] = await req.conn.execute(`
        SELECT 
          cs.*, 
          COALESCE(de.debit_amount, 0) AS debit_amount,
          COALESCE(cr.credit_amount, 0) AS credit_amount
        FROM customer_supplier cs 
        LEFT JOIN (
          SELECT customer_supplier_code, SUM(debit_amount) AS debit_amount 
          FROM debit 
          GROUP BY customer_supplier_code
        ) de ON de.customer_supplier_code = cs.customer_supplier_code 
        LEFT JOIN (
          SELECT customer_supplier_code, SUM(credit_amount) AS credit_amount 
          FROM credit 
          GROUP BY customer_supplier_code
        ) cr ON cr.customer_supplier_code = cs.customer_supplier_code 
        WHERE cs.customer = 'Y' AND cs.customer_supplier_is_active = 'Y' AND cs.organization_id = ?
        ORDER BY cs.S_no
      `, [req.user.organization_id]);
      
      res.json(rows.map(row => ({
        S_no: row.S_no,
        code: row.customer_supplier_code,
        name: row.customer_supplier_name,
        contact: row.customer_supplier_contact_no,
        address: row.customer_supplier_address,
        debit_amount: row.debit_amount,
        credit_amount: row.credit_amount
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const deleteCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.conn, req.conn1);
        await customer.deleteCustomer(req.params.code);
        res.json({ message: global.lang['customer deleted'] });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).send('Error deleting customer');
    }
};

module.exports = {
    addCustomer,
    updateCustomer,
    getLastCustomerTransactions,
    getAllCustomers,
    deleteCustomer
};
