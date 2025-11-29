const express = require('express');
const router = express.Router();
const controller = require('../controllers/debitCreditController');

router.get('/debit', controller.getDebitEntries);
router.get('/credit', controller.getCreditEntries);
router.post('/debit', controller.createDebitEntry);
router.post('/credit', controller.createCreditEntry);
router.delete('/debit/:id', controller.deleteDebitEntry);
router.delete('/credit/:id', controller.deleteCreditEntry);

module.exports = router;