const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.register);

// Protected routes
router.get('/validate', authMiddleware, userController.validateToken);
router.get('/profile', authMiddleware, userController.getProfile);



module.exports = router;