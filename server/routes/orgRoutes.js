const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { tokenProtect } = require('../middleware/auth');

router.get('/settings', tokenProtect, orgController.getOrgDetails);
router.put('/settings', tokenProtect, orgController.updateOrgDetails);
router.post('/change-password', tokenProtect, orgController.changePassword);


module.exports = router;    