const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { tokenProtect } = require('../middleware/auth'); // Assuming protection is needed

router.post('/add_cus', tokenProtect, customerController.addCustomer);
router.post('/update_cus', tokenProtect, customerController.updateCustomer);
router.post('/last_transaction', tokenProtect, customerController.getLastCustomerTransactions); // This was a shared function
router.get('/all_cus', tokenProtect, customerController.getAllCustomers);
router.delete('/delete_cus/:code', tokenProtect, customerController.deleteCustomer);

module.exports = router;