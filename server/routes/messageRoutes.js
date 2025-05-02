const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Lấy tin nhắn của phòng
router.get('/rooms/:roomId/messages', messageController.getMessages);

// Gửi tin nhắn mới
router.post('/rooms/:roomId/messages', messageController.sendMessage);

// Xóa tin nhắn
router.delete('/messages/:messageId', messageController.deleteMessage);

module.exports = router; 