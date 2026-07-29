const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/logs
// @desc    Get activity logs (Super Admin / Staff)
// @access  Private (Admin, Staff)
router.get('/', protect, authorize('admin', 'committee_head'), async (req, res, next) => {
  try {
    const { module: moduleFilter, limit = 50 } = req.query;
    const query = {};
    if (moduleFilter) query.module = moduleFilter;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'name email role avatar');

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
