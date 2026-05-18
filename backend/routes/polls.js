const express = require('express');
const {
  getPolls,
  getPoll,
  createPoll,
  voteOnPoll,
  deletePoll
} = require('../controllers/pollController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getPolls)
  .post(protect, createPoll);

router.route('/:id')
  .get(protect, getPoll)
  .delete(protect, deletePoll);

router.route('/:id/vote')
  .put(protect, voteOnPoll);

module.exports = router;
