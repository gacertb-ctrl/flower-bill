// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { tokenProtect } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/check', tokenProtect, authController.checkAuth);
router.post('/refresh', authController.refreshToken);
router.post('/logout', tokenProtect, authController.logout);

module.exports = router;