const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { tokenProtect } = require('../middleware/auth');

router.get('/staff', tokenProtect, userController.getAllStaff);
router.post('/staff', tokenProtect, userController.createStaff);
router.delete('/staff/:id', tokenProtect, userController.deleteStaff);

module.exports = router;