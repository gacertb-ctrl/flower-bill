class Product {
    constructor(conn, conn1) {
        this.conn = conn;
        this.conn1 = conn1;
    }

    async addProduct(details) {

        const sql = "INSERT INTO product (product_name, product_code, product_price, product_quality, product_unit, organization_id) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [details.product_name, details.product_code, details.product_price || 0, details.product_quality || 0, details.product_unit || null, details.organization_id];
        await this.conn.execute(sql, values);
        
    }

    async updateProduct(details) {
        const sql = "UPDATE product SET product_name = ?, product_price = ?, product_quality = ?, product_unit = ? WHERE product_code = ? AND organization_id = ?";
        const values = [details.product_name, details.product_price || 0, details.product_quality || 0, details.product_unit || null, details.product_code, details.organization_id];
        console.log(values);
        await this.conn.execute(sql, values);
        
    }

    async deleteProduct(code, organization_id) {
        const sql = "DELETE FROM product WHERE product_code = ? AND organization_id = ?";
        await this.conn.execute(sql, [code, organization_id]);
    }
}


module.exports = Product;