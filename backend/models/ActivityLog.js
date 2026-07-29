const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. 'User Login', 'Task Updated', 'Meeting Created'
  module: { type: String, required: true }, // e.g. 'Auth', 'Task', 'Meeting', 'Committee'
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
