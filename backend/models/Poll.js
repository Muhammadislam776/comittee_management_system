const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  voteCount: { type: Number, default: 0 }
});

const PollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Poll title is required'],
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
    default: null // If null, it's a global poll
  },
  options: {
    type: [OptionSchema],
    validate: [v => v.length >= 2, 'A poll must have at least two options']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
