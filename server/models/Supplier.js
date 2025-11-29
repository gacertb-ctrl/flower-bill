class Supplier {
    constructor(conn, conn1) {
        this.conn = conn;
        this.conn1 = conn1;
    }

    async addSupplier(details) {
        // Find the last S_no
        const [lastSnoRows] = await this.conn.execute("SELECT S_no FROM `customer_supplier` WHERE `supplier` = 'Y' ORDER BY `S_no` DESC LIMIT 1");
        const lastSno = lastSnoRows.length > 0 ? parseInt(lastSnoRows[0].S_no) + 1 : 1;

        const sql = "INSERT INTO customer_supplier (customer_supplier_name, customer_supplier_contact_no, customer_supplier_code, customer_supplier_address, supplier, customer_supplier_is_active, supplier_commission, S_no) VALUES (?, ?, ?, ?, 'Y', 'Y', ?, ?)";
        const values = [details.name, details.number, details.code, details.address, details.commission, lastSno];

        await this.conn.execute(sql, values);
    }

    async updateSupplier(details) {
        const sql = "UPDATE customer_supplier SET customer_supplier_name = ?, customer_supplier_contact_no = ?, customer_supplier_address = ?, supplier_commission = ? WHERE customer_supplier_code = ?";
        const values = [details.name, details.number, details.address, details.commission, details.code];

        await this.conn.execute(sql, values);
    }

    async getAllSuppliers() {
        const [rows] = await this.conn.execute("SELECT * FROM customer_supplier WHERE supplier = 'Y'");
        return rows;
    }

    async deleteSupplier(code) {
        const sql = "UPDATE customer_supplier SET customer_supplier_is_active = 'N' WHERE customer_supplier_code = ?";
        const values = [code];

        await this.conn.execute(sql, values);
    }
}

module.exports = Supplier;
