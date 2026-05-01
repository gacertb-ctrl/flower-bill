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
        ORDER BY cs.customer_supplier_name
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
        ORDER BY cs.customer_supplier_name
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
        const orgId = req.user.organization_id;

        let customers = [];

        // 1. Fetch Customers
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

        customerParams.unshift(orgId);
        customerSql += " GROUP BY cs.customer_supplier_code";
        customerSql += " ORDER BY MAX(cs.customer_supplier_name) ASC";

        const [customerRows] = await db.query(customerSql, customerParams);
        customers = customerRows;

        if (customers.length === 0) {
            return res.json([]);
        }

        // Get an array of all customer codes for bulk fetching
        const customerCodes = customers.map(c => c.customer_supplier_code);
        const responseData = [];

        // 2. BULK DATA FETCHING (Eliminates the N+1 Query Problem)
        if (period_type === 'date') {
            // Bulk fetch items
            const [allItems] = await db.query(`
                SELECT *, ${report_type}_quality as quality, ${report_type}_rate as rate, 
                ${report_type}_total as total 
                FROM ${report_type} en
                INNER JOIN product pr ON pr.product_code = en.product_code
                WHERE en.${report_type}_date = ? AND en.organization_id = ? AND en.customer_supplier_code IN (?)
            `, [date, orgId, customerCodes]);

            // Bulk fetch Prev Balances
            const [allPrevDebits] = await db.query(`SELECT customer_supplier_code, SUM(debit_amount) as amount FROM debit WHERE debit_date < ? AND organization_id = ? AND customer_supplier_code IN (?) GROUP BY customer_supplier_code`, [date, orgId, customerCodes]);
            const [allPrevCredits] = await db.query(`SELECT customer_supplier_code, SUM(credit_amount) as amount FROM credit WHERE credit_date < ? AND organization_id = ? AND customer_supplier_code IN (?) GROUP BY customer_supplier_code`, [date, orgId, customerCodes]);

            // Bulk fetch Today's Pay
            const todayPaySql = report_type === 'purchase'
                ? `SELECT customer_supplier_code, SUM(debit_amount) as amount FROM debit WHERE debit_date = ? AND organization_id = ? AND customer_supplier_code IN (?) GROUP BY customer_supplier_code`
                : `SELECT customer_supplier_code, SUM(credit_amount) as amount FROM credit WHERE credit_date = ? AND organization_id = ? AND customer_supplier_code IN (?) GROUP BY customer_supplier_code`;
            const [allTodayPay] = await db.query(todayPaySql, [date, orgId, customerCodes]);

            // Single fetch for Tamil Date
            const [tamilDateRes] = await db.query("SELECT * FROM tamil_calendar WHERE date = ?", [date]);
            const currentTamilDate = tamilDateRes[0] || {};

            // Map the bulk data to respective customers
            for (const customer of customers) {
                let dataObj = { ...customer };
                dataObj.items = allItems.filter(item => item.customer_supplier_code === customer.customer_supplier_code);
                dataObj.prev_debit = allPrevDebits.find(d => d.customer_supplier_code === customer.customer_supplier_code)?.amount || 0;
                dataObj.prev_credit = allPrevCredits.find(c => c.customer_supplier_code === customer.customer_supplier_code)?.amount || 0;
                dataObj.today_pay = allTodayPay.find(t => t.customer_supplier_code === customer.customer_supplier_code)?.amount || 0;
                dataObj.tamil_date = currentTamilDate;

                responseData.push(dataObj);
            }

        } else {
            // Monthly Bulk Logic
            const tamilDates = await getTamilMonthDates(month, year);
            const dateStrings = tamilDates.map(d => `'${new Date(d.date).toISOString().slice(0, 10)}'`).join(',');

            let allDailyDebits = [];
            let allDailyCredits = [];

            if (dateStrings) {
                [allDailyDebits] = await db.query(`SELECT customer_supplier_code, debit_date, SUM(debit_amount) as amount FROM debit WHERE debit_date IN (${dateStrings}) AND organization_id = ? AND customer_supplier_code IN (?) GROUP BY customer_supplier_code, debit_date`, [orgId, customerCodes]);
                [allDailyCredits] = await db.query(`SELECT customer_supplier_code, credit_date, SUM(credit_amount) as amount FROM credit WHERE credit_date IN (${dateStrings}) AND organization_id = ? AND customer_supplier_code IN (?) GROUP BY customer_supplier_code, credit_date`, [orgId, customerCodes]);
            }

            const tamilMonths = [
                'Chithirai', 'Vaikaasi', 'Aani', 'Aadi', 'Aavani', 'Purattasi',
                'Aippasi', 'Karthikai', 'Markazhi', 'Thai', 'Maasi', 'Panguni'
            ];
            const monthIndex = tamilMonths.indexOf(month);
            const odMonth = monthIndex > 0 ? tamilMonths[monthIndex - 1] : 'Panguni';
            const odYear = (odMonth === 'Markazhi') ? year - 1 : year;

            // Bulk fetch Opening Balance
            const [allOdRes] = await db.query(`SELECT customer_supplier_code, od_amount FROM supplier_od_old WHERE tamil_month_name_en = ? AND year = ? AND organization_id = ? AND customer_supplier_code IN (?)`, [odMonth, odYear, orgId, customerCodes]);

            // Map the bulk data to respective customers
            for (const customer of customers) {
                let dataObj = { ...customer };
                dataObj.date_ranges = tamilDates;
                dataObj.daily_debits = allDailyDebits.filter(d => d.customer_supplier_code === customer.customer_supplier_code);
                dataObj.daily_credits = allDailyCredits.filter(c => c.customer_supplier_code === customer.customer_supplier_code);
                dataObj.opening_balance = allOdRes.find(o => o.customer_supplier_code === customer.customer_supplier_code)?.od_amount || 0;

                responseData.push(dataObj);
            }
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

exports.updateSupplierMonthlyOD = async (req, res) => {
    try {
        const { month, year } = req.body;
        const orgId = req.user.organization_id;

        // 1. Get Dates for the Selected Tamil Month
        const dates = await getTamilMonthDates(month, year);
        if (!dates.length) return res.status(400).json({ message: "Invalid Tamil month/year" });
        const dateStrings = dates.map(d => `'${new Date(d.date).toISOString().slice(0, 10)}'`).join(',');

        // 2. Fetch All Active Suppliers
        const [suppliers] = await db.query(
            "SELECT customer_supplier_code, supplier_commission FROM customer_supplier WHERE supplier = 'Y' AND customer_supplier_is_active = 'Y' AND organization_id = ?",
            [orgId]
        );

        const tamilMonths = [
            'Chithirai', 'Vaikaasi', 'Aani', 'Aadi', 'Aavani', 'Purattasi',
            'Aippasi', 'Karthikai', 'Markazhi', 'Thai', 'Maasi', 'Panguni'
        ];
        const monthIndex = tamilMonths.indexOf(month);

        // Find Previous Month for OD retrieval
        const prevMonth = monthIndex > 0 ? tamilMonths[monthIndex - 1] : 'Panguni';
        const prevYear = (prevMonth === 'Markazhi' ? year - 1 : year);

        const updateResults = [];

        for (const sup of suppliers) {
            const code = sup.customer_supplier_code;
            // const code = "ப.கோ. குத்தாலம்"; // --- TEMP FIX for testing, replace with dynamic code in production ---

            // 2. Get Monthly Debits and Credits

            // 3. Get Monthly Totals
            const [totals] = await db.query(`
                SELECT 
                    (SELECT COALESCE(SUM(debit_amount), 0) FROM debit WHERE customer_supplier_code = ? AND debit_date IN (${dateStrings}) AND organization_id = ?) as debit,
                    (SELECT COALESCE(SUM(credit_amount), 0) FROM credit WHERE customer_supplier_code = ? AND credit_date IN (${dateStrings}) AND organization_id = ?) as credit
            `, [code, orgId, code, orgId]);

            // 4. Get Previous Month OD
            const [prevOD] = await db.query(
                "SELECT COALESCE(od_amount, 0) as amount FROM supplier_od_old WHERE customer_supplier_code = ? AND tamil_month_name_en = ? AND year = ? AND organization_id = ?",
                [code, prevMonth, prevYear, orgId]
            );
            
            const currentDebit = parseFloat(totals[0].debit);
            const currentCredit = parseFloat(totals[0].credit);
            const openingBal = parseFloat(prevOD[0]?.amount || 0);

            // 5. Calculation: (Prev OD + Debit) - Credit
            // Note: Adjust the formula if your business logic requires (Credit - Debit)
            const balanceAmount = (openingBal + currentDebit) - (currentCredit - (currentCredit * (sup.supplier_commission || 0) / 100)); // Adjusting for commission if applicable

            // 6. Update or Insert into supplier_od_old for the CURRENT month
            if (balanceAmount > 0) {
                await db.query(`
                    INSERT INTO supplier_od_old (customer_supplier_code, tamil_month_name_en, year, od_amount, organization_id)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE od_amount = VALUES(od_amount)
                `, [code, month, year, balanceAmount, orgId]);
                updateResults.push({ code, balanceAmount });
            }
        }

        res.json({ message: "Monthly OD updated successfully", updatedCount: updateResults.length });

    } catch (error) {
        console.error("OD Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};