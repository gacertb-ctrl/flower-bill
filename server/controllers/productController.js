const Product = require('../models/Product');
const { getTableData } = require('../utils/tableGenerator'); // Utility for table data

exports.addProduct = async (req, res) => {
    try {
        const product = new Product(req.conn, req.conn1);
        req.body.organization_id = req.user.organization_id; // Ensure organization_id is included
        await product.addProduct(req.body);
        res.json({ message: 'success', status: 200 });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log(req.body);
        const product = new Product(req.conn, req.conn1);
        req.body.organization_id = req.user.organization_id;
        await product.updateProduct(req.body);
        // const tableHtml = await getTableData(req.conn, 'product'); // Get data for 'product' table
        res.status(200).json({ message: "success", status: 200 });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
};

exports.getProduct = async (req, res) => {
    try {
        const [rows] = await req.conn.execute(
            'SELECT * FROM product WHERE product_code = ?',
            [req.params.code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        console.log(req.user);
        const [rows] = await req.conn.execute('SELECT * FROM product WHERE organization_id = ?', [req.user.organization_id]);
        
        res.json(rows.map(row => ({
            code: row.product_code,
            name: row.product_name,
            price: row.product_price,
            quality: row.product_quality,
            unit: row.product_unit,
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  };

exports.deleteProduct = async (req, res) => {
    const { code } = req.params;
    try {
        const product = new Product(req.conn);
        await product.deleteProduct(code, req.user.organization_id);
        res.json({ message: 'Product deleted successfully', status: 200 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}