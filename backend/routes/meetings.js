const express = require('express');
const {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getCommitteeMeetings,
  markAttendance,
  updateMinutes,
} = require('../controllers/meetingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getMeetings)
  .post(protect, createMeeting);

router.route('/committee/:committeeId').get(protect, getCommitteeMeetings);

router.route('/:id')
  .get(protect, getMeeting)
  .put(protect, authorize('admin', 'committee_head'), updateMeeting)
  .delete(protect, authorize('admin'), deleteMeeting);

router.route('/:id/attendance')
  .put(protect, authorize('admin', 'committee_head'), markAttendance);

router.route('/:id/minutes')
  .put(protect, authorize('admin', 'committee_head'), updateMinutes);

module.exports = router;
