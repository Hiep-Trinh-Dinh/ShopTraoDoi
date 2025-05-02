const mongoose = require('mongoose');

const ChatConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isUserMessage: {
    type: Boolean,
    required: true
  },
  responseSource: {
    type: String,
    enum: ['api', 'template', 'fallback', null],
    default: null
  }
});

module.exports = mongoose.model('ChatConversation', ChatConversationSchema); 