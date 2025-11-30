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
        const [rows] = await db.query("SELECT * FROM tamil_calendar GROUP BY tamil_month_name_en");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getReportSummary = async (req, res) => {
    try {
        const { period_type, report_type, month, year, date } = req.query;
        let sql = "";
        let params = [];

        const pageType = report_type === 'purchase' ? 'supplier' : 'customer';

        if (period_type === 'month') {
            const dates = await getTamilMonthDates(month, year);
            if (dates.length === 0) return res.json([]);

            // Format dates for IN clause safely
            const dateList = dates
                .map(d => {
                    const dateObj = new Date(d.date);
                    return `'${dateObj.toISOString().slice(0, 10)}'`; // yyyy-mm-dd
                })
                .join(',');

            sql = `
                SELECT cs.*, 
                COALESCE(de.debit_amount, 0) AS debit_amount, 
                COALESCE(cr.credit_amount, 0) AS credit_amount 
                FROM customer_supplier cs 
                LEFT JOIN (
                    SELECT sum(debit_amount) AS debit_amount, customer_supplier_code 
                    FROM debit 
                    WHERE debit_date IN (${dateList}) 
                    GROUP BY customer_supplier_code
                ) de ON de.customer_supplier_code = cs.customer_supplier_code 
                LEFT JOIN (
                    SELECT sum(credit_amount) AS credit_amount, customer_supplier_code 
                    FROM credit 
                    WHERE credit_date IN (${dateList}) 
                    GROUP BY customer_supplier_code
                ) cr ON cr.customer_supplier_code = cs.customer_supplier_code 
                WHERE cs.${pageType} = 'Y' AND cs.customer_supplier_is_active = 'Y'
                GROUP BY cs.customer_supplier_code
            `;
        } else {
            sql = `
                SELECT cs.*, 
                COALESCE(de.debit_amount, 0) AS debit_amount, 
                COALESCE(cr.credit_amount, 0) AS credit_amount 
                FROM customer_supplier cs 
                LEFT JOIN (
                    SELECT sum(debit_amount) AS debit_amount, customer_supplier_code 
                    FROM debit 
                    WHERE debit_date = ? 
                    GROUP BY customer_supplier_code
                ) de ON de.customer_supplier_code = cs.customer_supplier_code 
                LEFT JOIN (
                    SELECT sum(credit_amount) AS credit_amount, customer_supplier_code 
                    FROM credit 
                    WHERE credit_date = ? 
                    GROUP BY customer_supplier_code
                ) cr ON cr.customer_supplier_code = cs.customer_supplier_code 
                WHERE cs.${pageType} = 'Y' AND cs.customer_supplier_is_active = 'Y'
                GROUP BY cs.customer_supplier_code
            `;
            params.push(date, date);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating report" });
    }
};

exports.getPrintDetails = async (req, res) => {
    try {
        const { period_type, report_type, date, month, year, code } = req.query;
        const pageType = report_type === 'purchase' ? 'supplier' : 'customer';

        let customers = [];

        // 1. Fetch Customers
        let customerSql = `SELECT * FROM customer_supplier cs 
                           INNER JOIN ${report_type} en ON en.customer_supplier_code = cs.customer_supplier_code 
                           WHERE cs.${pageType} = 'Y' AND cs.customer_supplier_is_active = 'Y' `;
        let customerParams = [];

        if (period_type === 'date') {
            customerSql += ` AND en.${report_type}_date = ? `;
            customerParams.push(date);
        } else {
            const dates = await getTamilMonthDates(month, year);
            if (dates.length === 0) return res.json([]);
            const dateList = dates
                .map(d => {
                    const dateObj = new Date(d.date);
                    return `'${dateObj.toISOString().slice(0, 10)}'`; // yyyy-mm-dd
                })
                .join(',');
            customerSql += ` AND en.${report_type}_date IN (${dateList}) `;
        }

        if (code) {
            customerSql += " AND cs.customer_supplier_code = ? ";
            customerParams.push(code);
        }

        customerSql += " GROUP BY cs.customer_supplier_code";
        console.log("Customer SQL:", customerSql, customerParams);

        const [customerRows] = await db.query(customerSql, customerParams);
        customers = customerRows;

        // 2. Build Response Data based on type
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
                    WHERE en.${report_type}_date = ? AND en.customer_supplier_code = ?
                `, [date, customer.customer_supplier_code]);

                // Calculate Totals (Opening Balance)
                const [debitRes] = await db.query(`SELECT SUM(debit_amount) as amount FROM debit WHERE customer_supplier_code = ? AND debit_date < ?`, [customer.customer_supplier_code, date]);
                const [creditRes] = await db.query(`SELECT SUM(credit_amount) as amount FROM credit WHERE customer_supplier_code = ? AND credit_date < ?`, [customer.customer_supplier_code, date]);

                // Today's Payment/Receipt
                let todayPaySql = report_type === 'purchase'
                    ? `SELECT debit_amount as amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ?`
                    : `SELECT credit_amount as amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ?`;
                const [todayPayRes] = await db.query(todayPaySql, [customer.customer_supplier_code, date]);

                // Get Tamil Date for the specific date
                const [tamilDateRes] = await db.query("SELECT * FROM tamil_calendar WHERE date = ?", [date]);

                dataObj.items = items;
                dataObj.prev_debit = debitRes[0]?.amount || 0;
                dataObj.prev_credit = creditRes[0]?.amount || 0;
                dataObj.today_pay = todayPayRes[0]?.amount || 0;
                dataObj.tamil_date = tamilDateRes[0] || {};

            } else {
                // Monthly Logic
                const tamilDates = await getTamilMonthDates(month, year);
                dataObj.date_ranges = tamilDates
                dataObj.daily_totals = [];

                // Pre-fetch all daily totals for this customer in this month to avoid N+1 query spam
                const dateList = tamilDates
                    .map(d => {
                        const dateObj = new Date(d.date);
                        return `'${dateObj.toISOString().slice(0, 10)}'`; // yyyy-mm-dd
                    })
                    .join(',');
                console.log("Date List for Daily Totals:", dateList);

                const [dailyDebits] = await db.query(`SELECT debit_date, SUM(debit_amount) as amount FROM debit WHERE customer_supplier_code = ? AND debit_date IN (${dateList}) GROUP BY debit_date`, [customer.customer_supplier_code]);
                const [dailyCredits] = await db.query(`SELECT credit_date, SUM(credit_amount) as amount FROM credit WHERE customer_supplier_code = ? AND credit_date IN (${dateList}) GROUP BY credit_date`, [customer.customer_supplier_code]);

                dataObj.daily_debits = dailyDebits;
                dataObj.daily_credits = dailyCredits;

                // Old Balance Logic (Supplier OD)
                // Assuming simple logic for migration if strict OD table isn't fully clear or migrated
                // Logic: Check 'supplier_od_old' or calculate
                let od_month = month; // Simplified for now, complex array search logic in PHP
                let od_year = year;
                // You might need to adjust this OD query based on exact table availability
                const [odRes] = await db.query(`SELECT od_amount FROM supplier_od_old WHERE customer_supplier_code = ? AND tamil_month_name_en = ? AND year = ?`, [customer.customer_supplier_code, od_month, od_year]);
                dataObj.opening_balance = odRes[0]?.od_amount || 0;
            }

            responseData.push(dataObj);
        }

        res.json(responseData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
