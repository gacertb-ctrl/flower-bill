class Stock {
    constructor(conn) {
        this.conn = conn;
    }

    async getStockDetails(date, organization_id) {
        
        const sql = `SELECT pr.product_code, pr.product_name,
            COALESCE(pur.total_purchase_quality, 0) AS total_purchase_quality,
            COALESCE(sa.total_sales_quality, 0) AS total_sales_quality
            FROM product pr
            LEFT JOIN (SELECT sum(purchase_quality) AS total_purchase_quality, product_code FROM \`purchase\` WHERE purchase_date = ? GROUP BY product_code) pur ON pur.product_code = pr.product_code
            LEFT JOIN (SELECT sum(sales_quality) AS total_sales_quality, product_code FROM \`sales\` WHERE sales_date = ? GROUP BY product_code) sa ON sa.product_code = pr.product_code
            WHERE pr.organization_id = ?`;
        const values = [date, date, organization_id];
        const [rows] = await this.conn.execute(sql, values);
        return rows;
    }
}

module.exports = Stock;
