const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health
// Returns simple health information including MongoDB connection state
router.get('/', async (req, res) => {
  try {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'];
    const state = mongoose.connection.readyState;

    // Optional: include basic server time and uptime
    return res.json({
      ok: true,
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
      db: {
        readyState: state,
        status: states[state] || 'unknown'
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
