// This file would typically define a Customer class or schema if using an ORM.
// Since the PHP code uses direct SQL, we'll primarily handle logic in controllers.
// However, it's good practice to centralize SQL queries if not using an ORM.

class Customer {
    constructor(conn, conn1) {
        this.conn = conn;
        this.conn1 = conn1;
    }

    async addCustomer(details) {
        // Find the last S_no
        const [lastSnoRows] = await this.conn.execute("SELECT S_no FROM `customer_supplier` WHERE `customer` = 'Y' AND organization_id = ? ORDER BY `S_no` DESC LIMIT 1", [details.organization_id]);
        const lastSno = lastSnoRows.length > 0 ? parseInt(lastSnoRows[0].S_no) + 1 : 1;

        const sql = "INSERT INTO customer_supplier (customer_supplier_name, customer_supplier_contact_no, customer_supplier_code, customer_supplier_address, customer, customer_supplier_is_active, S_no, organization_id) VALUES (?, ?, ?, ?, 'Y', 'Y', ?, ?)";
        const values = [details.name, details.number, details.code, details.address, lastSno, details.organization_id];
        await this.conn.execute(sql, values);
    }

    async updateCustomer(details) {
        const sql = "UPDATE customer_supplier SET customer_supplier_name = ?, customer_supplier_contact_no = ?, customer_supplier_address = ? WHERE customer_supplier_code = ? AND organization_id = ?";
        const values = [details.name, details.number, details.address, details.code, details.organization_id];

        await this.conn.execute(sql, values);
    }

    async deleteCustomer(code) {
        const sql = "UPDATE customer_supplier SET customer_supplier_is_active = 'N' WHERE customer_supplier_code = ? AND organization_id = ?";
        const values = [code, this.conn.organization_id];

        await this.conn.execute(sql, values);
    }
    // You can add more methods here, e.g., getCustomer, deleteCustomer, etc.
}

module.exports = Customer;