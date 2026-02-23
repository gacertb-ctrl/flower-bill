const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { tokenProtect } = require('../middleware/auth');

router.get('/summary', tokenProtect, reportController.getReportSummary);
router.get('/tamil-months', tokenProtect, reportController.getTamilMonths);
router.get('/print-details', tokenProtect, reportController.getPrintDetails);
router.get('/tamil-date', tokenProtect, reportController.getTamilDateByCalendarDate);
router.put('/supplier/monthlyod', tokenProtect, reportController.updateSupplierMonthlyOD);

module.exports = router;