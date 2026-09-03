const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { upload, uploadSignature } = require('../controllers/upload.controller');

// POST /api/upload/signature — authenticated, single file
router.post('/signature', authenticate, upload.single('signature'), uploadSignature);

module.exports = router;
