const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { tokenProtect } = require('../middleware/auth');

router.get('/status', tokenProtect, whatsappController.getStatus);
router.get('/connect', tokenProtect, whatsappController.connect);
router.post('/disconnect', tokenProtect, whatsappController.disconnect);
router.post('/send', tokenProtect, whatsappController.sendReport);

module.exports = router;
