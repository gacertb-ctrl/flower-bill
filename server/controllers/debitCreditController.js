const db = require('../db/connection');

// Get Debit Entries for a specific date
exports.getDebitEntries = async (req, res) => {
    try {
        const { date } = req.query;
        const sql = `
            SELECT de.*, cs.customer_supplier_name 
            FROM debit de 
            INNER JOIN customer_supplier cs ON cs.customer_supplier_code = de.customer_supplier_code
            WHERE de.debit_date = ? AND cs.supplier = 'Y'
        `;
        const [rows] = await db.query(sql, [date]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching debit entries" });
    }
};

// Get Credit Entries for a specific date
exports.getCreditEntries = async (req, res) => {
    try {
        const { date } = req.query;
        const sql = `
            SELECT cr.*, cs.customer_supplier_name 
            FROM credit cr 
            INNER JOIN customer_supplier cs ON cs.customer_supplier_code = cr.customer_supplier_code
            WHERE cr.credit_date = ? AND cs.customer = 'Y'
        `;
        const [rows] = await db.query(sql, [date]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching credit entries" });
    }
};

// Create Debit Entry
exports.createDebitEntry = async (req, res) => {
    try {
        const { customer_supplier_code, amount, date } = req.body;
        // Assuming 'debit_quality' and 'debit_total' might be used for remarks or similar in your schema, 
        // but based on standard ledger logic, we focus on amount.
        const sql = `
            INSERT INTO debit (customer_supplier_code, debit_amount, debit_date) 
            VALUES (?, ?, ?)
        `;
        // mapped amount to total as well just in case structure requires it
        await db.query(sql, [customer_supplier_code, amount, date]);
        res.status(201).json({ message: "Debit entry created" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating debit entry" });
    }
};

// Create Credit Entry
exports.createCreditEntry = async (req, res) => {
    try {
        const { customer_supplier_code, amount, date } = req.body;
        const sql = `
            INSERT INTO credit (customer_supplier_code, credit_amount, credit_date) 
            VALUES (?, ?, ? )
        `;
        await db.query(sql, [customer_supplier_code, amount, date]);
        res.status(201).json({ message: "Credit entry created" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating credit entry" });
    }
};

// Delete Debit Entry
exports.deleteDebitEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM debit WHERE debit_id = ?", [id]);
        res.json({ message: "Debit entry deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting debit entry" });
    }
};

// Delete Credit Entry
exports.deleteCreditEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM credit WHERE credit_id = ?", [id]);
        res.json({ message: "Credit entry deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting credit entry" });
    }
};

// Update Debit Entry
exports.updateDebitEntry = async (req, res) => {
    const { id, amount } = req.body;
    try {
        await db.query("UPDATE debit_entries SET amount = ? WHERE id = ?", [amount, id]);
        res.status(200).json({ message: "Debit entry updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update debit entry" });
    }
};

// Update Credit Entry
exports.updateCreditEntry = async (req, res) => {
    const { id, amount } = req.body;
    try {
        await db.query("UPDATE credit_entries SET amount = ? WHERE id = ?", [amount, id]);
        res.status(200).json({ message: "Credit entry updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update credit entry" });
    }
};