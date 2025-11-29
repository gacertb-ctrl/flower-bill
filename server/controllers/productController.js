const Product = require('../models/Product');
const { getTableData } = require('../utils/tableGenerator'); // Utility for table data

exports.addProduct = async (req, res) => {
    try {
        const product = new Product(req.conn, req.conn1);
        await product.addProduct(req.body);
        const tableHtml = await getTableData(req.conn, 'product'); // Get data for 'product' table
        res.json({ message: global.lang['product added'], table: tableHtml });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log(req.body);
        const product = new Product(req.conn, req.conn1);
        await product.updateProduct(req.body);
        // const tableHtml = await getTableData(req.conn, 'product'); // Get data for 'product' table
        res.status(200).json({ data: "success", status: 200 });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { code, name, price, quality, unit } = req.body;

        await req.conn.execute(
            `INSERT INTO product 
          (product_code, product_name, product_price, product_quality, product_unit) 
         VALUES (?, ?, ?, ?, ?)`,
            [code, name, price, quality || null, unit || null]
        );

        res.status(201).json({ message: 'Product created successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Product code already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productCode = req.params.code;
        const { name, price, quality, unit } = req.body;

        await req.conn.execute(
            `UPDATE product SET 
          product_name = ?,
          product_price = ?,
          product_quality = ?,
          product_unit = ?
         WHERE product_code = ?`,
            [name, price, quality || null, unit || null, productCode]
        );

        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        const [rows] = await req.conn.execute('SELECT * FROM product');
        
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