const Stock = require('../models/Stock');
const db = require('../db/connection'); // Assuming this is how you get the database connection

async function getStock(req, res) {
    const { date } = req.query; // Get the date from the query parameters
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const stockModel = new Stock(db);
        const stockDetails = await stockModel.getStockDetails(date, req.user.organization_id);
        res.json(stockDetails);
    } catch (error) {
        console.error('Error fetching stock details:', error);
        if (error.sql) {
            console.error('SQL Query:', error.sql);
            console.error('SQL Values:', error.values);
        }
        res.status(500).json({ error: 'Failed to fetch stock details', details: error.message });
    }
}

module.exports = {
    getStock,
};
