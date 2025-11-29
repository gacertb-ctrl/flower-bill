const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/stocks', stockController.getStock);

module.exports = router;
