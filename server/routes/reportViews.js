// server/routes/reportViews.js
const express = require('express');
const router = express.Router();
const reportViewController = require('../controllers/reportViewController');

router.get('/daily/:type', reportViewController.dailyReport);
router.get('/monthly', reportViewController.monthlyReport);
router.get('/date-range', reportViewController.dateRangeReport);

module.exports = router;