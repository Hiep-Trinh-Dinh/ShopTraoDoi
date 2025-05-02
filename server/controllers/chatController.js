const ChatConversation = require('../models/ChatConversation');
const ChatFeedback = require('../models/ChatFeedback');

exports.saveConversation = async (req, res) => {
  try {
    const { conversationId, message, isUserMessage, responseSource, timestamp, userId } = req.body;
    
    const conversation = new ChatConversation({
      conversationId,
      message,
      isUserMessage,
      responseSource,
      timestamp,
      userId: userId || req.user?.id || 'anonymous'
    });
    
    await conversation.save();
    
    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.saveFeedback = async (req, res) => {
  try {
    const { conversationId, messageContent, isHelpful, timestamp, userId } = req.body;
    
    const feedback = new ChatFeedback({
      conversationId,
      messageContent,
      isHelpful,
      timestamp,
      userId: userId || req.user?.id || 'anonymous'
    });
    
    await feedback.save();
    
    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // Tổng số cuộc hội thoại
    const totalConversations = await ChatConversation.distinct('conversationId').countDocuments();
    
    // Tổng số phản hồi
    const totalFeedback = await ChatFeedback.countDocuments();
    
    // Phân tích phản hồi tích cực/tiêu cực
    const positiveRatio = await ChatFeedback.countDocuments({ isHelpful: true }) / totalFeedback;
    
    // Top 10 câu hỏi phổ biến
    const topQuestions = await ChatConversation.aggregate([
      { $match: { isUserMessage: true } },
      { $group: { _id: '$message', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalConversations,
        totalFeedback,
        positiveRatio,
        topQuestions
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 