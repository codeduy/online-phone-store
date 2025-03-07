const express = require('express');
const router = express.Router();
const voucherController = require('../../controllers/admin/voucherController');
const { adminAuthMiddleware } = require('../../middleware/admin/adminAuthMiddleware');

router.use(adminAuthMiddleware);

router.get('/', voucherController.getAllVouchers);
router.post('/', voucherController.createVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);
router.patch('/:id/toggle', voucherController.toggleVoucherStatus);

module.exports = router;