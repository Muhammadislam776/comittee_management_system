const Poll = require('../models/Poll');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all active polls (and closed polls user participated in or created)
// @route   GET /api/polls
// @access  Private
exports.getPolls = asyncHandler(async (req, res, next) => {
  const { committee } = req.query;

  const query = {};
  if (committee) {
    query.committee = committee;
  }

  // Fetch all polls matching query. In a real app we might filter by user's committee.
  let polls = await Poll.find(query)
    .populate('createdBy', 'name email')
    .populate('committee', 'name')
    .sort({ createdAt: -1 });

  // Update status dynamically if expired
  polls = await Promise.all(polls.map(async (poll) => {
    if (poll.status === 'Active' && new Date(poll.expiresAt) < new Date()) {
      poll.status = 'Closed';
      await poll.save();
    }
    return poll;
  }));

  res.status(200).json({ success: true, count: polls.length, data: polls });
});

// @desc    Get single poll
// @route   GET /api/polls/:id
// @access  Private
exports.getPoll = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('committee', 'name');

  if (!poll) {
    return next(new ErrorResponse('Poll not found', 404));
  }

  res.status(200).json({ success: true, data: poll });
});

// @desc    Create new poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = asyncHandler(async (req, res, next) => {
  const { title, description, committee, options, expiresAt } = req.body;

  if (!options || options.length < 2) {
    return next(new ErrorResponse('Please provide at least two options', 400));
  }

  const pollOptions = options.map(opt => ({ text: opt, voteCount: 0 }));

  const poll = await Poll.create({
    title,
    description,
    committee: committee || null,
    options: pollOptions,
    expiresAt,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: poll });
});

// @desc    Vote on a poll
// @route   PUT /api/polls/:id/vote
// @access  Private
exports.voteOnPoll = asyncHandler(async (req, res, next) => {
  const { optionId } = req.body;

  if (!optionId) {
    return next(new ErrorResponse('Please select an option to vote', 400));
  }

  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return next(new ErrorResponse('Poll not found', 404));
  }

  // Check if poll is closed or expired
  if (poll.status === 'Closed' || new Date(poll.expiresAt) < new Date()) {
    if (poll.status !== 'Closed') {
      poll.status = 'Closed';
      await poll.save();
    }
    return next(new ErrorResponse('This poll is closed and no longer accepting votes', 400));
  }

  // Check if user already voted
  if (poll.voters.includes(req.user._id)) {
    return next(new ErrorResponse('You have already voted on this poll', 400));
  }

  // Find option and increment vote
  const option = poll.options.id(optionId);
  if (!option) {
    return next(new ErrorResponse('Invalid option selected', 400));
  }

  option.voteCount += 1;
  poll.voters.push(req.user._id);

  await poll.save();

  res.status(200).json({ success: true, data: poll });
});

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private (Admin / Creator)
exports.deletePoll = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return next(new ErrorResponse('Poll not found', 404));
  }

  // Allow admin or creator to delete
  if (poll.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this poll', 403));
  }

  await poll.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
