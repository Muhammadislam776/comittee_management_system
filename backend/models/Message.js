const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  committee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Committee',
    default: null // null indicates a general or system room message
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
