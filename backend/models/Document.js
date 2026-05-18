const mongoose = require('mongoose');

const DocumentVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  committee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Committee',
    default: null // If null, global file
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentVersion: {
    type: Number,
    default: 1
  },
  versions: [DocumentVersionSchema],
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
