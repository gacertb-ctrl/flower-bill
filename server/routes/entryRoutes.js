const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { tokenProtect } = require('../middleware/auth');

router.post('/purchase_entry', tokenProtect, entryController.purchaseEntry);
router.post('/sales_entry', tokenProtect, entryController.salesEntry);
router.post('/credit_entry', tokenProtect, entryController.creditEntry);
router.post('/debit_entry', tokenProtect, entryController.debitEntry);
router.post('/delete_sales', tokenProtect, entryController.deleteSales);
router.post('/delete_purchase', tokenProtect, entryController.deletePurchase);
router.post('/delete_credit', tokenProtect, entryController.deleteCredit);
router.post('/delete_debit', tokenProtect, entryController.deleteDebit);
router.get('/purchase_entry', tokenProtect, entryController.getAllPurchaseEntries);
router.get('/sales_entry', tokenProtect, entryController.getAllSalesEntries);
router.get('/credit_entr', tokenProtect, entryController.getAllCreditEntries);
router.get('/debit_entry', tokenProtect, entryController.getAllDebitEntries);

module.exports = router;