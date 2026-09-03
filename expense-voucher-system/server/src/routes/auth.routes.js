const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');

// Public
router.post('/login', login);

// Protected - requires valid JWT
router.get('/me', authenticate, getMe);

module.exports = router;
