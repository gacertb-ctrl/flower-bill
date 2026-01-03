const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { tokenProtect } = require('../middleware/auth');

router.get('/all_sup', tokenProtect, supplierController.getAllSuppliers);
router.post('/add_sup', tokenProtect, supplierController.addSupplier);
router.put('/update_sup', tokenProtect, supplierController.updateSupplier);
router.get('/last_transaction/:code', tokenProtect, supplierController.getLastSupplierTransactions); // This was a shared function
router.delete('/delete_sup/:code', tokenProtect, supplierController.deleteSupplier);

module.exports = router;
