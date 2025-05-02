const mongoose = require('mongoose');

const ChatFeedbackSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  messageContent: {
    type: String,
    required: true
  },
  isHelpful: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatFeedback', ChatFeedbackSchema); 