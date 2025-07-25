const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all wallet routes
//router.use(authenticateToken);

// GET /api/wallet/balance
router.get('/balance', authMiddleware, walletController.getBalance);

// POST /api/wallet/deposit
router.post('/deposit', authMiddleware, walletController.deposit);

// POST /api/wallet/withdraw
router.post('/withdraw', authMiddleware, walletController.withdraw);

module.exports = router;
