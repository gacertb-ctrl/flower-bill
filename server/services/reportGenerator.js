// server/services/reportGenerator.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

exports.generateMonthlyReport = async (month, year, customerCode) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const reportUrl = `${process.env.FRONTEND_URL}/reports/monthly?month=${month}&year=${year}&cusSupCode=${customerCode}`;
  await page.goto(reportUrl, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(__dirname, '../temp', `monthly_${customerCode}.pdf`);
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