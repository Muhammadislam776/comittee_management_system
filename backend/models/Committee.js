const mongoose = require('mongoose');

const CommitteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a committee name'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  committeeType: {
    type: String,
    enum: ['Standing', 'Ad-hoc', 'Special', 'Executive', 'Advisory', 'Operational'],
    default: 'Standing'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: ['Executive', 'Finance', 'HR', 'Marketing', 'Technical', 'Operations', 'Legal', 'Academic', 'Research', 'Other'],
    default: 'Other'
  },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  secretary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Dissolved', 'Pending Approval'],
    default: 'Active'
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  budget: { type: Number, default: 0 },
  location: { type: String, default: 'Headquarters / Online' },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Text search index
CommitteeSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Committee', CommitteeSchema);

