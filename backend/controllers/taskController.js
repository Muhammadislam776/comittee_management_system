const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc      Get all tasks
// @route     GET /api/tasks
// @access    Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find()
    .populate('assignedTo', 'name email role')
    .populate('meeting', 'title date')
    .populate('comments.user', 'name email role')
    .sort({ createdAt: -1 });

  res.status(200).json(tasks);
});

// @desc      Get single task
// @route     GET /api/tasks/:id
// @access    Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('meeting', 'title date')
    .populate('comments.user', 'name email role');

  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json(task);
});

// @desc      Create new task
// @route     POST /api/tasks
// @access    Private
exports.createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignedTo, meeting, status, priority, deadline } = req.body;

  // Simple validations
  if (!title) {
    return next(new ErrorResponse('Please provide a task title', 400));
  }
  if (!description) {
    return next(new ErrorResponse('Please provide a task description', 400));
  }
  if (!assignedTo) {
    return next(new ErrorResponse('Please assign the task to a user', 400));
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    meeting: meeting || undefined,
    status: status || 'Pending',
    priority: priority || 'Medium',
    deadline: deadline || undefined
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('meeting', 'title date');

  try {
    const { getIO } = require('../socket');
    getIO().emit('task_created', populatedTask);
  } catch (err) {}

  res.status(201).json(populatedTask);
});

// @desc      Update task
// @route     PUT /api/tasks/:id
// @access    Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  .populate('assignedTo', 'name email role')
  .populate('meeting', 'title date')
  .populate('comments.user', 'name email role');

  try {
    const { getIO } = require('../socket');
    getIO().emit('task_updated', task);
  } catch (err) {}

  res.status(200).json(task);
});

// @desc      Delete task
// @route     DELETE /api/tasks/:id
// @access    Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  const taskId = task._id;
  await task.deleteOne();

  try {
    const { getIO } = require('../socket');
    getIO().emit('task_deleted', taskId);
  } catch (err) {}

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get tasks for logged in user
// @route     GET /api/tasks/user
// @access    Private
exports.getUserTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find({ assignedTo: req.user.id })
    .populate('meeting', 'title date')
    .populate('assignedTo', 'name email role')
    .populate('comments.user', 'name email role');

  res.status(200).json(tasks);
});

// @desc      Add comment to task
// @route     POST /api/tasks/:id/comments
// @access    Private
exports.addTaskComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    return next(new ErrorResponse('Comment content is required', 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  task.comments.push({
    text,
    user: req.user.id
  });

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('meeting', 'title date')
    .populate('comments.user', 'name email role');

  try {
    const { getIO } = require('../socket');
    getIO().emit('task_updated', updatedTask);
  } catch (err) {}

  res.status(200).json({ success: true, data: updatedTask });
});

// @desc      Add attachment to task
// @route     POST /api/tasks/:id/attachments
// @access    Private
exports.addTaskAttachment = asyncHandler(async (req, res, next) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return next(new ErrorResponse('Attachment name and URL are required', 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
  }

  task.attachments.push({ name, url });
  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('meeting', 'title date')
    .populate('comments.user', 'name email role');

  try {
    const { getIO } = require('../socket');
    getIO().emit('task_updated', updatedTask);
  } catch (err) {}

  res.status(200).json({ success: true, data: updatedTask });
});
