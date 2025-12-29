class Product {
    constructor(conn, conn1) {
        this.conn = conn;
        this.conn1 = conn1;
    }

    async addProduct(details) {
        const sql = "INSERT INTO product (product_name, product_code, product_price, product_quality, product_unit, organization_id) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [details.pro_name, details.pro_code, details.pro_price, details.pro_quality, details.pro_unit, details.organization_id];

        await this.conn.execute(sql, values);
        
    }

    async updateProduct(details) {
        const sql = "UPDATE product SET product_name = ?, product_price = ?, product_quality = ?, product_unit = ? WHERE product_code = ? AND organization_id = ?";
        const values = [details.name, details.price, details.quality, details.unit, details.code, details.organization_id];
        console.log(values);
        await this.conn.execute(sql, values);
        
    }
}

module.exports = Product;