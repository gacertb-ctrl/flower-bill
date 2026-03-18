// server/services/reportGenerator.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

exports.generateMonthlyReport = async (type, month, year, customerCode, token) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Need to visit the domain first to set localStorage
  await page.goto(frontendUrl, { waitUntil: 'networkidle0' });
  
  if (token) {
      await page.evaluate((t) => {
          localStorage.setItem('authToken', t);
      }, token);
  }

  const reportUrl = `${frontendUrl}/print-report?period=month&type=${type}&month=${month}&year=${year}&code=${customerCode}`;
  await page.goto(reportUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  
  const pdfPath = path.join(__dirname, '../temp', `monthly_${customerCode}.pdf`);
  
  // Ensure temp directory exists
  if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
  }

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true
  });
  
  await browser.close();
  return pdfPath;
};

exports.generateDateRangeReport = async (reportType, startDate, endDate, customerCode) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const reportUrl = `${process.env.FRONTEND_URL}/reports/date-range?type=${reportType}&start=${startDate}&end=${endDate}&cusSupCode=${customerCode}`;
  await page.goto(reportUrl, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(__dirname, '../temp', `daily_${customerCode}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true
  });
  
  await browser.close();
  return pdfPath;
};