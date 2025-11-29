class Product {
    constructor(conn, conn1) {
        this.conn = conn;
        this.conn1 = conn1;
    }

    async addProduct(details) {
        const sql = "INSERT INTO product (product_name, product_code, product_price, product_quality, product_unit) VALUES (?, ?, ?, ?, ?)";
        const values = [details.pro_name, details.pro_code, details.pro_price, details.pro_quality, details.pro_unit];

        await this.conn.execute(sql, values);
        try {
            await this.conn1.execute(sql.replace('INSERT INTO ', 'INSERT INTO kanthimathi_'), values);
        } catch (th) {
            console.error(th);
        }
    }

    async updateProduct(details) {
        const sql = "UPDATE product SET product_name = ?, product_price = ?, product_quality = ?, product_unit = ? WHERE product_code = ?";
        const values = [details.name, details.price, details.quality, details.unit, details.code];
        console.log(values);
        await this.conn.execute(sql, values);
        try {
            await this.conn1.execute(sql.replace('UPDATE ', 'UPDATE kanthimathi_'), values);
        } catch (th) {
            console.error(th);
        }
    }
}

module.exports = Product;