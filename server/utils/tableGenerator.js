// This file would contain logic to fetch data and potentially format it for a table.
// In a real Node.js application serving a frontend, you'd likely just send JSON data.
// For the purpose of mimicking the PHP's `echo require 'table.php'`,
// this function will fetch data and return it as JSON, or a simple string if you intend to
// render HTML directly on the server (less common with modern frontends).

async function getTableData(conn, page) {
    let sql = '';
    let tableName = '';
    let columns = []; // Define columns for the table

    switch (page) {
        case 'customer':
            tableName = 'customer_supplier';
            sql = "SELECT * FROM `customer_supplier` WHERE `customer` = 'Y'";
            columns = ['customer_supplier_name', 'customer_supplier_contact_no', 'customer_supplier_code', 'customer_supplier_address'];
            break;
        case 'supplier':
            tableName = 'customer_supplier';
            sql = "SELECT * FROM `customer_supplier` WHERE `supplier` = 'Y'";
            columns = ['customer_supplier_name', 'customer_supplier_contact_no', 'customer_supplier_code', 'customer_supplier_address', 'supplier_commission'];
            break;
        case 'product':
            tableName = 'product';
            sql = "SELECT * FROM `product`";
            columns = ['product_name', 'product_code', 'product_price', 'product_quality', 'product_unit'];
            break;
        // Add cases for 'purchase', 'sales', etc. if they also need table data
        default:
            return 'Invalid page for table data.';
    }

    try {
        const [rows] = await conn.execute(sql);
        // You could format this as HTML here if you want to render server-side,
        // but typically you'd send JSON and let the client render the table.
        return JSON.stringify({ data: rows, columns: columns, page: page });
    } catch (error) {
        console.error(`Error fetching data for ${page} table:`, error);
        return JSON.stringify({ error: `Failed to fetch data for ${page}.` });
    }
}

module.exports = { getTableData };