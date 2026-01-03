const Supplier = require('../models/Supplier');
const { getTableData } = require('../utils/tableGenerator'); // Utility for table data

const addSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.conn, req.conn1);
        await supplier.addSupplier(req.body);
        res.status(200).json({ data: "success", status: 200 });
    } catch (error) {
        console.error('Error adding supplier:', error);
        res.status(500).send('Error adding supplier');
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.conn, req.conn1);
        await supplier.updateSupplier(req.body);
        res.status(200).json({ data: "success", status: 200 });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).send('Error updating supplier');
    }
};

const getAllSuppliers = async (req, res) => {
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
        WHERE cs.supplier = 'Y' AND cs.customer_supplier_is_active = 'Y' AND cs.organization_id = ?
        ORDER BY cs.S_no
      `, [req.user.organization_id]);
      
      res.json(rows.map(row => ({
        S_no: row.S_no,
        code: row.customer_supplier_code,
        name: row.customer_supplier_name,
        contact: row.customer_supplier_contact_no,
        address: row.customer_supplier_address,
        debit_amount: row.debit_amount,
        credit_amount: row.credit_amount,
        commission: row.supplier_commission
      })));
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).send('Error fetching suppliers');
    }
};

const getLastSupplierTransactions = async (req, res) => {
    try {
        const [rows] = await req.conn.execute("SELECT credit_amount as total, credit_date as date, 'purchase' as type, customer_supplier_code FROM credit WHERE customer_supplier_code = ? ORDER BY credit_id DESC LIMIT 5", [req.params.code]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching last supplier transactions:', error);
        res.status(500).send('Error fetching last supplier transactions');
    }
};


const deleteSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.conn, req.conn1);
        await supplier.deleteSupplier(req.params.code);
        res.status(200).json({ data: "success", status: 200 });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).send('Error deleting supplier');
    }
};

module.exports = {
    addSupplier,
    updateSupplier,
    getAllSuppliers,
    getLastSupplierTransactions,
    deleteSupplier
};