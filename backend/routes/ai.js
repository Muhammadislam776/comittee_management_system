const express = require('express');
const {
  generateMeetingSummary,
  getTaskRecommendations,
  getAttendanceInsights,
  generateAutomatedReport,
  aiSearchAssistant
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// protect all AI routes
router.use(protect);

router.post('/meeting-summary', generateMeetingSummary);
router.post('/task-recommendations', getTaskRecommendations);
router.post('/attendance-insights', getAttendanceInsights);
router.post('/automated-report', generateAutomatedReport);
router.post('/search-assistant', aiSearchAssistant);

module.exports = router;
