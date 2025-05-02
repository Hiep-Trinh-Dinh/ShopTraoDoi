const Message = require('../models/Message');
const Room = require('../models/Room');

// Lấy tin nhắn của phòng
exports.getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Kiểm tra phòng tồn tại using the custom id field
        const existingRoom = await Room.findOne({ id: roomId });
        if (!existingRoom) {
            return res.status(404).json({ message: 'Phòng không tồn tại' });
        }

        // Lấy 100 tin nhắn gần nhất
        const messages = await Message.find({ roomId })
            .sort({ timestamp: -1 })
            .limit(100);

        res.json(messages.reverse());
    } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Gửi tin nhắn mới
exports.sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { text, sender, role } = req.body;

        // Kiểm tra phòng tồn tại using the custom id field
        const targetRoom = await Room.findOne({ id: roomId });
        if (!targetRoom) {
            return res.status(404).json({ message: 'Phòng không tồn tại' });
        }

        // Tạo tin nhắn mới
        const message = new Message({
            roomId,
            text,
            sender,
            role,
            timestamp: new Date()
        });

        await message.save();

        // Broadcast tin nhắn tới tất cả clients trong phòng
        const wss = req.app.get('wss');
        if (wss && wss.clients) {
            wss.clients.forEach((client) => {
                if (client.roomId === roomId && client.readyState === 1) {
                    client.send(JSON.stringify(message));
                }
            });
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xóa tin nhắn
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const message = await Message.findByIdAndDelete(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Tin nhắn không tồn tại' });
        }

        res.json({ message: 'Đã xóa tin nhắn' });
    } catch (error) {
        console.error('Lỗi khi xóa tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}; 