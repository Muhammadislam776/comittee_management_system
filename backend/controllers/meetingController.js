const Meeting = require('../models/Meeting');
const Committee = require('../models/Committee');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all meetings (with optional filters)
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = asyncHandler(async (req, res) => {
  const { status, committee, from, to, search } = req.query;

  try {
    console.log('📅 Fetching meetings...', { userId: req.user._id, status, committee, search });

    const query = {};
    if (status) query.status = status;
    if (committee) query.committee = committee;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const meetings = await Meeting.find(query)
      .populate('committee', 'name status')
      .populate('createdBy', 'name email')
      .populate('attendance.user', 'name email')
      .sort({ date: 1 });

    console.log('✅ Meetings fetched:', { count: meetings.length });
    res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (err) {
    console.error('❌ Error fetching meetings:', err.message);
    throw err;
  }
});

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private
exports.getMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('committee', 'name members status')
    .populate('createdBy', 'name email')
    .populate('attendance.user', 'name email role');

  if (!meeting) return next(new ErrorResponse('Meeting not found', 404));
  res.status(200).json({ success: true, data: meeting });
});

// @desc    Create meeting
// @route   POST /api/meetings
// @access  Private
exports.createMeeting = asyncHandler(async (req, res, next) => {
  const { title, date, endDate, location, committee, agenda, status } = req.body;

  if (!title || !date || !committee) {
    return next(new ErrorResponse('Title, date and committee are required', 400));
  }

  // Seed attendance from committee members
  const comm = await Committee.findById(committee).select('members');
  const attendance = comm
    ? comm.members.map(uid => ({ user: uid, status: 'Absent' }))
    : [];

  const meeting = await Meeting.create({
    title, date, endDate, location, committee, agenda,
    status: status || 'Scheduled',
    attendance,
    createdBy: req.user._id
  });

  const populated = await meeting.populate([
    { path: 'committee', select: 'name' },
    { path: 'attendance.user', select: 'name email' }
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private/Admin/Head
exports.updateMeeting = asyncHandler(async (req, res, next) => {
  let meeting = await Meeting.findById(req.params.id);
  if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

  // Prevent editing cancelled/completed unless admin
  const { title, date, endDate, location, committee, agenda, minutes, status } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (date !== undefined) updates.date = date;
  if (endDate !== undefined) updates.endDate = endDate;
  if (location !== undefined) updates.location = location;
  if (committee !== undefined) updates.committee = committee;
  if (agenda !== undefined) updates.agenda = agenda;
  if (minutes !== undefined) updates.minutes = minutes;
  if (status !== undefined) updates.status = status;

  meeting = await Meeting.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true
  }).populate('committee', 'name').populate('attendance.user', 'name email');

  res.status(200).json({ success: true, data: meeting });
});

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private/Admin
exports.deleteMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return next(new ErrorResponse('Meeting not found', 404));
  await meeting.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get meetings for a committee
// @route   GET /api/meetings/committee/:committeeId
// @access  Private
exports.getCommitteeMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({ committee: req.params.committeeId })
    .populate('attendance.user', 'name email')
    .sort({ date: 1 });
  res.status(200).json(meetings);
});

// @desc    Mark attendance for a meeting
// @route   PUT /api/meetings/:id/attendance
// @access  Private/Admin/Head
exports.markAttendance = asyncHandler(async (req, res, next) => {
  // req.body.attendance = [{ userId, status }]
  const { attendance } = req.body;
  if (!Array.isArray(attendance)) {
    return next(new ErrorResponse('attendance must be an array', 400));
  }

  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

  attendance.forEach(({ userId, status }) => {
    const record = meeting.attendance.find(a => a.user.toString() === userId);
    if (record) {
      record.status = status;
      record.markedAt = new Date();
    } else {
      meeting.attendance.push({ user: userId, status, markedAt: new Date() });
    }
  });

  await meeting.save();
  await meeting.populate('attendance.user', 'name email');
  res.status(200).json({ success: true, data: meeting });
});

// @desc    Upload / update meeting minutes
// @route   PUT /api/meetings/:id/minutes
// @access  Private/Admin/Head
exports.updateMinutes = asyncHandler(async (req, res, next) => {
  const { minutes } = req.body;
  if (minutes === undefined) return next(new ErrorResponse('minutes field required', 400));

  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    { minutes, status: 'Completed' },
    { new: true, runValidators: true }
  ).populate('committee', 'name').populate('attendance.user', 'name email');

  if (!meeting) return next(new ErrorResponse('Meeting not found', 404));
  res.status(200).json({ success: true, data: meeting });
});
