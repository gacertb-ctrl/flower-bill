const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { tokenProtect } = require('../middleware/auth');

router.post('/add_pro', tokenProtect, productController.addProduct);
router.put('/update_pro', tokenProtect, productController.updateProduct);
router.post('/', tokenProtect, productController.createProduct);
router.get('/products/:code', tokenProtect, productController.getProduct);
router.get('/products', tokenProtect, productController.getAllProducts);

module.exports = router;