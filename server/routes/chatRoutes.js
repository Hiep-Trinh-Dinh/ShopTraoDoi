const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Lưu hội thoại - không cần xác thực
router.post('/conversation', chatController.saveConversation);

// Lưu phản hồi - không cần xác thực
router.post('/feedback', chatController.saveFeedback);

// Lấy phân tích - cần xác thực admin
router.get('/analytics', authMiddleware.protect, (req, res, next) => {
  // Kiểm tra quyền admin thủ công
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ admin mới có quyền xem analytics'
    });
  }
  next();
}, chatController.getAnalytics);

module.exports = router; 