const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/logController');
const { verifyAdminToken } = require('../../middleware/admin/adminAuthMiddleware');

router.get('/logs', verifyAdminToken, logController.getLogs);

module.exports = router;