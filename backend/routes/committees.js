const express = require('express');
const {
  getCommittees,
  getCommittee,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  addMember,
  removeMember
} = require('../controllers/committeeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getCommittees)
  .post(protect, authorize('admin'), createCommittee);

router
  .route('/:id')
  .get(protect, getCommittee)
  .put(protect, authorize('admin', 'committee_head'), updateCommittee)
  .delete(protect, authorize('admin'), deleteCommittee);

router
  .route('/:id/members')
  .post(protect, authorize('admin', 'committee_head'), addMember);

router
  .route('/:id/members/:userId')
  .delete(protect, authorize('admin', 'committee_head'), removeMember);

module.exports = router;
