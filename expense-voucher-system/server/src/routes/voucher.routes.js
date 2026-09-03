const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher
} = require('../controllers/voucher.controller');

// All routes require authentication
router.use(authenticate);

// Employee creates vouchers
router.post('/', authorize('employee'), createVoucher);

// All roles can list & view vouchers (scoped in controller)
router.get('/', getAllVouchers);
router.get('/:id', getVoucherById);

// Employee edits/deletes own drafts
router.put('/:id', authorize('employee'), updateVoucher);
router.delete('/:id', authorize('employee'), deleteVoucher);

// Employee submits a draft
router.patch('/:id/submit', authorize('employee'), submitVoucher);

// Director approves/rejects
router.patch('/:id/approve', authorize('director'), approveVoucher);
router.patch('/:id/reject', authorize('director'), rejectVoucher);

module.exports = router;
