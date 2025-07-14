const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.register);

// Protected routes
router.get('/profile', auth, userController.getProfile);
//router.put('/profile', auth, userController.updateProfile);
//router.get('/balance', auth, userController.getBalance);


module.exports = router;