const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: false },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
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
