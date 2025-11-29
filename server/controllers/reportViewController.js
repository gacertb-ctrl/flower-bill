// server/controllers/reportViewController.js
const db = require('../db/connection');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

exports.dailyReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { date, cusSupCode } = req.query;
    
    // Fetch report data
    const { customers, tamilDate } = await fetchDailyReportData(type, date, cusSupCode);
    
    // Render EJS template
    const templatePath = path.join(__dirname, '../views/reports/daily.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, { 
      type,
      date,
      customers,
      tamilDate
    });
    
    res.send(html);
  } catch (error) {
    res.status(500).send('Error generating report view');
  }
};

exports.monthlyReport = async (req, res) => {
  try {
    const { month, year, cusSupCode } = req.query;
    
    // Fetch report data
    const reportData = await fetchMonthlyReportData(month, year, cusSupCode);
    
    // Render EJS template
    const templatePath = path.join(__dirname, '../views/reports/monthly.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, { 
      month,
      year,
      reportData
    });
    
    res.send(html);
  } catch (error) {
    res.status(500).send('Error generating report view');
  }
};

exports.dateRangeReport = async (req, res) => {
  try {
    const { type, start, end, cusSupCode } = req.query;
    
    // Fetch report data
    const reportData = await fetchDateRangeReportData(type, start, end, cusSupCode);
    
    // Render EJS template
    const templatePath = path.join(__dirname, '../views/reports/date-range.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, { 
      type,
      start,
      end,
      reportData
    });
    
    res.send(html);
  } catch (error) {
    res.status(500).send('Error generating report view');
  }
};

// Helper functions
async function fetchDailyReportData(type, date, cusSupCode) {
  const page = type === 'purchase' ? 'supplier' : 'customer';

  // Get Tamil date
  const [tamilDate] = await db.query(
    'SELECT * FROM tamil_calendar WHERE date = ?', 
    [date]
  );

  // Get customers/suppliers
  let sql = `
    SELECT cs.* 
    FROM customer_supplier cs
    INNER JOIN ${type} en ON en.customer_supplier_code = cs.customer_supplier_code
    WHERE cs.${page} = 'Y' AND cs.customer_supplier_is_active = 'Y' 
      AND en.${type}_date = ?
  `;
  
  const params = [date];
  if (cusSupCode) {
    sql += ' AND cs.customer_supplier_code = ?';
    params.push(cusSupCode);
  }
  sql += ' GROUP BY cs.customer_supplier_code';
  
  const [customers] = await db.query(sql, params);
  
  // Get items for each customer
  for (const customer of customers) {
    const itemsSql = `
      SELECT 
        pr.product_name,
        ${type}_quality AS quality,
        ${type}_rate AS rate,
        ${type}_total AS total
      FROM ${type} t
      INNER JOIN product pr ON pr.product_code = t.product_code
      WHERE t.customer_supplier_code = ? AND t.${type}_date = ?
    `;
    
    const [items] = await db.query(itemsSql, [customer.customer_supplier_code, date]);
    customer.items = items;
  }
  
  return {
    customers,
    tamilDate: tamilDate[0] || null
  };
}

async function fetchMonthlyReportData(month, year, cusSupCode) {
  const tamilDateSql = `SELECT date FROM tamil_calendar 
    WHERE tamil_month_name_en = ? AND YEAR(date) = ?`;
  
  const [dates] = await db.query(tamilDateSql, [month, year]);
  
  const dateList = dates.map(d => d.date);
  const datePlaceholders = dateList.map(() => '?').join(',');
  
  const sql = `
    SELECT 
      cs.customer_supplier_code AS code,
      cs.customer_supplier_name AS name,
      COALESCE(SUM(de.debit_amount), 0) AS debit_amount,
      COALESCE(SUM(cr.credit_amount), 0) AS credit_amount
    FROM customer_supplier cs
    LEFT JOIN (
      SELECT customer_supplier_code, SUM(debit_amount) AS debit_amount
      FROM debit
      WHERE debit_date IN (${datePlaceholders})
      GROUP BY customer_supplier_code
    ) de ON de.customer_supplier_code = cs.customer_supplier_code
    LEFT JOIN (
      SELECT customer_supplier_code, SUM(credit_amount) AS credit_amount
      FROM credit
      WHERE credit_date IN (${datePlaceholders})
      GROUP BY customer_supplier_code
    ) cr ON cr.customer_supplier_code = cs.customer_supplier_code
    WHERE cs.supplier = 'Y' AND cs.customer_supplier_is_active = 'Y'
    ${cusSupCode ? 'AND cs.customer_supplier_code = ?' : ''}
    GROUP BY cs.customer_supplier_code
  `;
  
  const params = [...dateList, ...dateList];
  if (cusSupCode) params.push(cusSupCode);
  
  const [rows] = await db.query(sql, params);
  return rows;
}

async function fetchDateRangeReportData(type, start, end, cusSupCode) {
  const page = type === 'purchase' ? 'supplier' : 'customer';
  
  const sql = `
    SELECT 
      cs.customer_supplier_code AS code,
      cs.customer_supplier_name AS name,
      COALESCE(SUM(de.debit_amount), 0) AS debit_amount,
      COALESCE(SUM(cr.credit_amount), 0) AS credit_amount
    FROM customer_supplier cs
    LEFT JOIN debit de ON de.customer_supplier_code = cs.customer_supplier_code
      AND de.debit_date BETWEEN ? AND ?
    LEFT JOIN credit cr ON cr.customer_supplier_code = cs.customer_supplier_code
      AND cr.credit_date BETWEEN ? AND ?
    WHERE cs.${page} = 'Y' AND cs.customer_supplier_is_active = 'Y'
    ${cusSupCode ? 'AND cs.customer_supplier_code = ?' : ''}
    GROUP BY cs.customer_supplier_code
  `;
  
  const params = [start, end, start, end];
  if (cusSupCode) params.push(cusSupCode);
  
  const [rows] = await db.query(sql, params);
  return rows;
}