const db = require('../db/connection');

// Helper to get Tamil Month Dates
const getTamilMonthDates = async (month, year) => {
    let sql = "SELECT date, tamil_date, tamil_month_name_en, tamil_month_name_ta FROM tamil_calendar WHERE tamil_month_name_en = ?";
    let params = [month];

    if (month === 'Markazhi') {
        sql += " AND (date BETWEEN ? AND ?)";
        params.push(`${year}-12-01`, `${parseInt(year) + 1}-01-30`);
    } else {
        sql += " AND YEAR(date) = ?";
        params.push(year);
    }
    const [rows] = await db.query(sql, params);
    return rows;
};

exports.getTamilMonths = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT
        MIN(id) AS id,
        tamil_month_name_en,
        tamil_month_name_ta
      FROM tamil_calendar
      GROUP BY
        tamil_month_name_en,
        tamil_month_name_ta
      ORDER BY id
    `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getReportSummary = async (req, res) => {
    try {
        const { period_type, report_type, month, year, date } = req.query;

        let sql = '';
        let params = [];

        const pageType = report_type === 'purchase' ? 'supplier' : 'customer';

        if (period_type === 'month') {
            const dates = await getTamilMonthDates(month, year);
            if (!dates.length) return res.json([]);

            const dateList = dates.map(d => d.date); // yyyy-mm-dd

            sql = `
        SELECT
          cs.*,
          COALESCE(de.debit_amount, 0) AS debit_amount,
          COALESCE(cr.credit_amount, 0) AS credit_amount
        FROM customer_supplier cs
        LEFT JOIN (
          SELECT
            customer_supplier_code,
            SUM(debit_amount) AS debit_amount
          FROM debit
          WHERE debit_date IN (?)
          GROUP BY customer_supplier_code
        ) de ON de.customer_supplier_code = cs.customer_supplier_code
        LEFT JOIN (
          SELECT
            customer_supplier_code,
            SUM(credit_amount) AS credit_amount
          FROM credit
          WHERE credit_date IN (?)
          GROUP BY customer_supplier_code
        ) cr ON cr.customer_supplier_code = cs.customer_supplier_code
        WHERE
          cs.${pageType} = 'Y'
          AND cs.customer_supplier_is_active = 'Y'
          AND cs.organization_id = ?
      `;

            params.push(dateList, dateList, req.user.organization_id);

        } else {
            sql = `
        SELECT
          cs.*,
          COALESCE(de.debit_amount, 0) AS debit_amount,
          COALESCE(cr.credit_amount, 0) AS credit_amount
        FROM customer_supplier cs
        LEFT JOIN (
          SELECT
            customer_supplier_code,
            SUM(debit_amount) AS debit_amount
          FROM debit
          WHERE debit_date = ?
          GROUP BY customer_supplier_code
        ) de ON de.customer_supplier_code = cs.customer_supplier_code
        LEFT JOIN (
          SELECT
            customer_supplier_code,
            SUM(credit_amount) AS credit_amount
          FROM credit
          WHERE credit_date = ?
          GROUP BY customer_supplier_code
        ) cr ON cr.customer_supplier_code = cs.customer_supplier_code
        WHERE
          cs.${pageType} = 'Y'
          AND cs.customer_supplier_is_active = 'Y'
          AND cs.organization_id = ?
      `;

            params.push(date, date, req.user.organization_id);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating report' });
    }
};


exports.getPrintDetails = async (req, res) => {
    try {
        const { period_type, report_type, date, month, year, code } = req.query;
        const pageType = report_type === 'purchase' ? 'supplier' : 'customer';

        let customers = [];

        // 1. Fetch Customers - FIXED using MAX() for compatibility
        let customerSql = `
            SELECT 
                cs.customer_supplier_code,
                MAX(cs.customer_supplier_id) as customer_supplier_id,
                MAX(cs.customer_supplier_name) as customer_supplier_name,
                MAX(cs.customer_supplier_contact_no) as customer_supplier_contact_no,
                MAX(cs.customer_supplier_address) as customer_supplier_address,
                MAX(cs.customer) as customer,
                MAX(cs.supplier) as supplier,
                MAX(cs.customer_supplier_is_active) as customer_supplier_is_active,
                MAX(cs.supplier_commission) as supplier_commission,
                MAX(cs.S_no) as S_no,
                MAX(cs.organization_id) as organization_id
            FROM customer_supplier cs 
            INNER JOIN ${report_type} en ON en.customer_supplier_code = cs.customer_supplier_code 
            WHERE cs.${pageType} = 'Y' AND cs.customer_supplier_is_active = 'Y' AND cs.organization_id = ?`;

        let customerParams = [];

        if (period_type === 'date') {
            customerSql += ` AND en.${report_type}_date = ? `;
            customerParams.push(date);
        } else {
            const dates = await getTamilMonthDates(month, year);
            if (dates.length === 0) return res.json([]);

            const dateList = dates
                .map(d => `'${new Date(d.date).toISOString().slice(0, 10)}'`)
                .join(',');
            customerSql += ` AND en.${report_type}_date IN (${dateList}) `;
        }

        if (code) {
            customerSql += " AND cs.customer_supplier_code = ? ";
            customerParams.push(code);
        }

        customerParams.unshift(req.user.organization_id);
        customerSql += " GROUP BY cs.customer_supplier_code";

        const [customerRows] = await db.query(customerSql, customerParams);
        customers = customerRows;

        // 2. Build Response Data
        const responseData = [];

        for (const customer of customers) {
            let dataObj = { ...customer };

            if (period_type === 'date') {
                // Fetch Items
                const [items] = await db.query(`
                    SELECT *, ${report_type}_quality as quality, ${report_type}_rate as rate, 
                    ${report_type}_total as total 
                    FROM ${report_type} en
                    INNER JOIN product pr ON pr.product_code = en.product_code
                    WHERE en.${report_type}_date = ? AND en.customer_supplier_code = ? AND en.organization_id = ?
                `, [date, customer.customer_supplier_code, req.user.organization_id]);

                // Calculate Totals (Opening Balance)
                const [debitRes] = await db.query(`SELECT SUM(debit_amount) as amount FROM debit WHERE customer_supplier_code = ? AND debit_date < ? AND organization_id = ?`, [customer.customer_supplier_code, date, req.user.organization_id]);
                const [creditRes] = await db.query(`SELECT SUM(credit_amount) as amount FROM credit WHERE customer_supplier_code = ? AND credit_date < ? AND organization_id = ?`, [customer.customer_supplier_code, date, req.user.organization_id]);

                // Today's Payment/Receipt
                let todayPaySql = report_type === 'purchase'
                    ? `SELECT debit_amount as amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ? AND organization_id = ?`
                    : `SELECT credit_amount as amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ? AND organization_id = ?`;
                const [todayPayRes] = await db.query(todayPaySql, [customer.customer_supplier_code, date, req.user.organization_id]);

                const [tamilDateRes] = await db.query("SELECT * FROM tamil_calendar WHERE date = ?", [date]);

                dataObj.items = items;
                dataObj.prev_debit = debitRes[0]?.amount || 0;
                dataObj.prev_credit = creditRes[0]?.amount || 0;
                dataObj.today_pay = todayPayRes[0]?.amount || 0;
                dataObj.tamil_date = tamilDateRes[0] || {};

            } else {
                // Monthly Logic
                // const { getTamilMonthDates } = require('../utils/tamilDateHelper');
                const tamilDates = await getTamilMonthDates(month, year);
                dataObj.date_ranges = tamilDates;

                const dateStrings = tamilDates.map(d => `'${new Date(d.date).toISOString().slice(0, 10)}'`).join(',');

                if (dateStrings) {
                    const [dailyDebits] = await db.query(`SELECT debit_date, SUM(debit_amount) as amount FROM debit WHERE customer_supplier_code = ? AND debit_date IN (${dateStrings}) AND organization_id = ? GROUP BY debit_date`, [customer.customer_supplier_code, req.user.organization_id]);
                    const [dailyCredits] = await db.query(`SELECT credit_date, SUM(credit_amount) as amount FROM credit WHERE customer_supplier_code = ? AND credit_date IN (${dateStrings}) AND organization_id = ? GROUP BY credit_date`, [customer.customer_supplier_code, req.user.organization_id]);
                    dataObj.daily_debits = dailyDebits;
                    dataObj.daily_credits = dailyCredits;
                } else {
                    dataObj.daily_debits = [];
                    dataObj.daily_credits = [];
                }

                const [odRes] = await db.query(`SELECT od_amount FROM supplier_od_old WHERE customer_supplier_code = ? AND tamil_month_name_en = ? AND year = ? AND organization_id = ?`, [customer.customer_supplier_code, month, year, req.user.organization_id]);
                dataObj.opening_balance = odRes[0]?.od_amount || 0;
            }

            responseData.push(dataObj);
        }

        res.json(responseData);

    } catch (error) {
        console.error("Print Details Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// controller.js
exports.getTamilDateByCalendarDate = async (req, res) => {
    try {
        const { date } = req.query; // Expecting YYYY-MM-DD
        const sql = "SELECT tamil_date, tamil_month_name_ta FROM tamil_calendar WHERE date = ? LIMIT 1";
        const [rows] = await req.conn.execute(sql, [date]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Date not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};