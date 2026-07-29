const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'committee_head', 'member'], default: 'member' },
  avatar: { type: String, default: '' },
  department: { type: String, default: 'General' },
  designation: { type: String, default: 'Committee Member' },
  skills: [{ type: String }],
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    meetingReminders: { type: Boolean, default: true },
    taskAssignments: { type: Boolean, default: true }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);

