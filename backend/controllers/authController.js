const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorResponse('User already exists', 400));
  }

  // Create user
  user = new User({
    name,
    email,
    password,
    role: role || 'member'
  });

  // Encrypt password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Logout user / clear cookie
// @route     GET /api/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json(user);
});

// @desc      Forgot Password
// @route     POST /api/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

  // Log url to console
  console.log(`\n=================== RESET PASSWORD LINK ===================\n${resetUrl}\n===========================================================\n`);

  res.status(200).json({
    success: true,
    data: 'Email sent (simulated). Check server console for reset link.',
    token: resetToken // Exposing for convenience in this exercise
  });
});

// @desc      Reset Password
// @route     PUT /api/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token or expired token', 400));
  }

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Get all users
// @route     GET /api/auth/users
// @access    Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, data: users });
});
