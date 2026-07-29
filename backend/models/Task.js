const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  committee: { type: mongoose.Schema.Types.ObjectId, ref: 'Committee' },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: false },
  status: { type: String, enum: ['Pending', 'In Progress', 'Under Review', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  deadline: { type: Date },
  comments: [{
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);

