const mongoose = require('mongoose');

const CommitteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a committee name'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: ['Executive', 'Finance', 'HR', 'Marketing', 'Technical', 'Operations', 'Legal', 'Other'],
    default: 'Other'
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Dissolved'],
    default: 'Active'
  },
}, { timestamps: true });

// Text search index
CommitteeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Committee', CommitteeSchema);
