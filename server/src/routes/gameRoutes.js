const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Game routes will be implemented later
router.get('/state', auth, (req, res) => {
  res.json({ status: 'waiting', message: 'Game routes not yet implemented' });
});

module.exports = router;