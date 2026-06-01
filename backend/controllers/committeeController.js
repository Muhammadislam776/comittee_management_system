const Committee = require('../models/Committee');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc      Get all committees (with Search and Pagination)
// @route     GET /api/committees
// @access    Private
exports.getCommittees = asyncHandler(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;

  try {
    console.log('📋 Fetching committees...', { userId: req.user._id, search, page, limit });

    // Search query setup
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Pagination logic
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Committee.countDocuments(query);
    const committees = await Committee.find(query)
      .populate('members', 'name email role')
      .populate('head', 'name email role')
      .skip(skip)
      .limit(limitNum);

    console.log('✅ Committees fetched:', { count: committees.length, total });

    res.status(200).json({
      success: true,
      count: committees.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: committees
    });
  } catch (err) {
    console.error('❌ Error fetching committees:', err.message);
    throw err;
  }
});

// @desc      Get single committee
// @route     GET /api/committees/:id
// @access    Private
exports.getCommittee = asyncHandler(async (req, res, next) => {
  const committee = await Committee.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('head', 'name email role');

  if (!committee) {
    return next(new ErrorResponse(`Committee not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: committee });
});

// @desc      Create new committee
// @route     POST /api/committees
// @access    Private/Admin
exports.createCommittee = asyncHandler(async (req, res, next) => {
  const { name, description, head, members, status } = req.body;

  if (!name) {
    return next(new ErrorResponse('Please provide a committee name', 400));
  }

  const committee = await Committee.create({
    name,
    description,
    head,
    members: members || [],
    status: status || 'Active'
  });

  res.status(201).json({ success: true, data: committee });
});

// @desc      Update committee
// @route     PUT /api/committees/:id
// @access    Private/Admin
exports.updateCommittee = asyncHandler(async (req, res, next) => {
  let committee = await Committee.findById(req.params.id);

  if (!committee) {
    return next(new ErrorResponse(`Committee not found with id of ${req.params.id}`, 404));
  }

  committee = await Committee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: committee });
});

// @desc      Delete committee
// @route     DELETE /api/committees/:id
// @access    Private/Admin
exports.deleteCommittee = asyncHandler(async (req, res, next) => {
  const committee = await Committee.findById(req.params.id);

  if (!committee) {
    return next(new ErrorResponse(`Committee not found with id of ${req.params.id}`, 404));
  }

  await committee.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Add member to committee
// @route     POST /api/committees/:id/members
// @access    Private/Admin
exports.addMember = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorResponse('Please provide a user ID to add', 400));
  }

  const committee = await Committee.findById(req.params.id);
  if (!committee) {
    return next(new ErrorResponse(`Committee not found with id of ${req.params.id}`, 404));
  }

  if (committee.members.includes(userId)) {
    return next(new ErrorResponse('User is already a member of this committee', 400));
  }

  committee.members.push(userId);
  await committee.save();

  res.status(200).json({ success: true, data: committee });
});

// @desc      Remove member from committee
// @route     DELETE /api/committees/:id/members/:userId
// @access    Private/Admin
exports.removeMember = asyncHandler(async (req, res, next) => {
  const committee = await Committee.findById(req.params.id);
  if (!committee) {
    return next(new ErrorResponse(`Committee not found with id of ${req.params.id}`, 404));
  }

  committee.members = committee.members.filter(
    (memberId) => memberId.toString() !== req.params.userId
  );
  await committee.save();

  res.status(200).json({ success: true, data: committee });
});
