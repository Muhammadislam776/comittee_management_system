const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get chat message logs for a committee or general room
// @route   GET /api/chat/:roomId
// @access  Private
router.get('/:roomId', protect, async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const query = roomId === 'general' ? { committee: null } : { committee: roomId };
    
    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error loading messages' });
  }
});

module.exports = router;
