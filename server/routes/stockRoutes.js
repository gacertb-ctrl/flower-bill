const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { tokenProtect } = require('../middleware/auth');

router.get('/stocks', tokenProtect, stockController.getStock);

module.exports = router;
