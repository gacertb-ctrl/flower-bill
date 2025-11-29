// server/middleware/reportValidation.js
const validateReportParams = (req, res, next) => {
  const { periodType, reportType } = req.body;
  
  if (!periodType || !reportType) {
    return res.status(400).json({ error: 'Missing periodType or reportType' });
  }
  
  if (periodType === 'month' && (!req.body.month || !req.body.year)) {
    return res.status(400).json({ error: 'Missing month or year for monthly report' });
  }
  
  if (periodType === 'date' && (!req.body.startDate || !req.body.endDate)) {
    return res.status(400).json({ error: 'Missing startDate or endDate for date range report' });
  }
  
  next();
};

module.exports = validateReportParams;