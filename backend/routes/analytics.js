const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Secure analytics behind protect validation
router.get('/', protect, getAnalytics);

module.exports = router;
