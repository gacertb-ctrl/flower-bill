const evolutionService = require('../services/whatsappService');
const db = require('../db/connection');
const reportGenerator = require('../services/reportGenerator');
const fs = require('fs');
const path = require('path');

// Helper to get Tamil Month Dates (Copied from reportController)
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

exports.getStatus = async (req, res) => {
    try {
        const status = await evolutionService.getConnectionStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.connect = async (req, res) => {
    try {
        console.log("connect");
        const qr = await evolutionService.getQRCode();
        res.json(qr);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.disconnect = async (req, res) => {
    try {
        const result = await evolutionService.logout();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendReport = async (req, res) => {
    try {
        const { period_type, report_type, date, month, year, code, number } = req.body;
        const orgId = req.user.organization_id;
        console.log(req.body);
        if (!number) return res.status(400).json({ error: 'WhatsApp number is required' });

        // Clean number (remove non-digits)
        const cleanNumber = number.replace(/\D/g, '');
        // Evolution API usually expects number with country code
        const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

        if (period_type === 'date') {
            // Daily Report - Text Message
            const data = await fetchReportData(period_type, report_type, date, month, year, code, orgId);
            const customer = data[0];
            if (!customer) return res.status(404).json({ error: 'Report data not found' });

            const message = formatDailyReportMessage(customer, date, report_type);
            const result = await evolutionService.sendText(finalNumber, message);
            res.json({ success: true, result });

        } else if (period_type === 'month') {
            // We use the existing reportGenerator which uses Puppeteer to render the frontend Print View
            const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
            const pdfPath = await reportGenerator.generateMonthlyReport(report_type, month, year, code, token);
            const pdfBase64 = fs.readFileSync(pdfPath, { encoding: 'base64' });

            const caption = `Monthly Report - ${month} ${year}`;
            const fileName = `Monthly_Report_${code}.pdf`;

            const result = await evolutionService.sendMedia(finalNumber, pdfBase64, fileName, caption);

            // Clean up temp file
            fs.unlinkSync(pdfPath);

            res.json({ success: true, result });
        } else {
            res.status(400).json({ error: 'Invalid period type' });
        }

    } catch (error) {
        console.error('Send Report Error:', error);
        res.status(500).json({ error: error.message });
    }
};

async function fetchReportData(period_type, report_type, date, month, year, code, orgId) {
    const pageType = report_type === 'purchase' ? 'supplier' : 'customer';

    let customerSql = `
        SELECT 
            cs.customer_supplier_code,
            cs.customer_supplier_name,
            cs.customer_supplier_contact_no,
            cs.supplier_commission
        FROM customer_supplier cs 
        INNER JOIN ${report_type} en ON en.customer_supplier_code = cs.customer_supplier_code 
        WHERE cs.${pageType} = 'Y' AND cs.customer_supplier_is_active = 'Y' AND cs.organization_id = ? AND cs.customer_supplier_code = ?`;

    const [customerRows] = await db.query(customerSql, [orgId, code]);
    if (customerRows.length === 0) return [];

    const customer = customerRows[0];

    // Fetch Items
    const [items] = await db.query(`
        SELECT pr.product_name, ${report_type}_quality as quality, ${report_type}_rate as rate, 
        ${report_type}_total as total 
        FROM ${report_type} en
        INNER JOIN product pr ON pr.product_code = en.product_code
        WHERE en.${report_type}_date = ? AND en.customer_supplier_code = ? AND en.organization_id = ?
    `, [date, code, orgId]);

    // Calculate Balance
    const [debitRes] = await db.query(`SELECT SUM(debit_amount) as amount FROM debit WHERE customer_supplier_code = ? AND debit_date < ? AND organization_id = ?`, [code, date, orgId]);
    const [creditRes] = await db.query(`SELECT SUM(credit_amount) as amount FROM credit WHERE customer_supplier_code = ? AND credit_date < ? AND organization_id = ?`, [code, date, orgId]);

    const [todayPayRes] = await db.query(
        report_type === 'purchase'
            ? `SELECT debit_amount as amount FROM debit WHERE customer_supplier_code = ? AND debit_date = ? AND organization_id = ?`
            : `SELECT credit_amount as amount FROM credit WHERE customer_supplier_code = ? AND credit_date = ? AND organization_id = ?`,
        [code, date, orgId]
    );

    customer.items = items;
    customer.prev_debit = debitRes[0]?.amount || 0;
    customer.prev_credit = creditRes[0]?.amount || 0;
    customer.today_pay = todayPayRes[0]?.amount || 0;

    return [customer];
}

function formatDailyReportMessage(customer, date, type) {
    const totalAmount = customer.items?.reduce((acc, item) => acc + parseFloat(item.total || 0), 0) || 0;
    const prevBalance = parseFloat(customer.prev_debit || 0) - parseFloat(customer.prev_credit || 0);
    const grandTotal = (prevBalance + totalAmount) - parseFloat(customer.today_pay || 0);
    console.log("grandTotal", grandTotal);

    let message = `Daily Report - ${date}\n\n`;
    message += `Customer: ${customer.customer_supplier_name}\n`;
    message += `Product List:\n`;

    customer.items.forEach(item => {
        message += `${item.product_name} - ₹${item.rate} x ${item.quality} = ₹${item.total}\n`;
    });

    message += `\nPrevious Balance: ₹${prevBalance.toFixed(2)}`;
    message += `\nTotal: ₹${totalAmount.toFixed(2)}`;
    if (customer.today_pay > 0) {
        message += `\nToday Pay: ₹${customer.today_pay.toFixed(2)}`;
    }

    if (type === 'purchase') {
        const commission = (totalAmount * (customer.supplier_commission || 0)) / 100;
        message += `\nCommission: ₹${commission.toFixed(2)}`;
        message += `\nGrand Total: ₹${(totalAmount - commission).toFixed(2)}`;
    } else {
        message += `\nGrand Total: ₹${grandTotal.toFixed(2)}`;
    }

    return message;
}
