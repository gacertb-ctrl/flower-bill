const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/summary', reportController.getReportSummary);
router.get('/tamil-months', reportController.getTamilMonths);
router.get('/print-details', reportController.getPrintDetails);

module.exports = router;