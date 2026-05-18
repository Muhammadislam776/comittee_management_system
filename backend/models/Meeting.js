const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Excused'], default: 'Absent' },
  markedAt: { type: Date }
}, { _id: false });

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  endDate: { type: Date },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    default: ''
  },
  committee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Committee',
    required: [true, 'Committee is required']
  },
  agenda: {
    type: String,
    maxlength: [2000, 'Agenda cannot exceed 2000 characters'],
    default: ''
  },
  minutes: {
    type: String,
    maxlength: [5000, 'Minutes cannot exceed 5000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Scheduled'
  },
  attendance: [AttendanceSchema],
  reminderSent: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

MeetingSchema.index({ date: 1 });
MeetingSchema.index({ committee: 1, date: 1 });

module.exports = mongoose.model('Meeting', MeetingSchema);
