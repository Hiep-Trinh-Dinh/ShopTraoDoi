const WebSocket = require('ws');
const url = require('url');
const Message = require('./models/Message');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ 
        server,
        path: '/ws/room',
        // Add WebSocket specific options
        clientTracking: true,
        // Handle CORS
        verifyClient: (info) => {
            // Accept connections from localhost
            const origin = info.origin || info.req.headers.origin;
            return origin === 'http://localhost:5173' || origin === 'http://localhost:5174';
        }
    });

    // Keep track of connected clients
    const clients = new Map();

    // Handle connection errors at the server level
    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });

    wss.on('connection', (ws, req) => {
        try {
            console.log('New client connected');

            // Send immediate acknowledgment
            ws.send(JSON.stringify({ 
                type: 'connected',
                message: 'Connected to server'
            }));

            // Xử lý tin nhắn từ client
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    console.log('Received message:', data);

                    if (data.type === 'join_room') {
                        // Handle room join
                        const roomId = data.roomId;
                        if (!roomId) {
                            console.error('No room ID provided');
                            ws.close(1008, 'No room ID provided');
                            return;
                        }

                        // Lưu client connection
                        ws.roomId = roomId;
                        clients.set(ws, { roomId });
                        
                        console.log(`Client joined room: ${roomId}`);

                        // Gửi tin nhắn xác nhận kết nối
                        ws.send(JSON.stringify({ 
                            type: 'connection_established',
                            roomId 
                        }));
                    } else if (data.type === 'chat_message') {
                        // Handle chat messages
                        const roomId = ws.roomId;
                        if (!roomId) {
                            console.error('No room ID associated with this connection');
                            return;
                        }

                        // Lưu tin nhắn vào database
                        const newMessage = new Message({
                            roomId: data.roomId,
                            text: data.text,
                            sender: data.sender,
                            role: data.role,
                            timestamp: new Date(data.timestamp)
                        });

                        await newMessage.save();
                        
                        // Broadcast tin nhắn tới tất cả clients khác trong cùng phòng
                        for (const [client, info] of clients) {
                            if (info.roomId === roomId && client.readyState === WebSocket.OPEN && client !== ws) {
                                client.send(JSON.stringify({
                                    ...newMessage.toObject(),
                                    type: 'chat_message'
                                }));
                            }
                        }

                        // Gửi xác nhận về cho người gửi
                        ws.send(JSON.stringify({
                            type: 'message_sent',
                            message: newMessage.toObject()
                        }));
                    } else if (data.type === 'payment_completed') {
                        const roomId = data.roomId;
                        
                        // Broadcast thông báo đến tất cả clients trong cùng phòng
                        for (const [client, info] of clients) {
                            if (info.roomId === roomId && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'update_status',
                                    roomId: roomId,
                                    status: 'deposited'
                                }));
                            }
                        }
                    } else if (data.type === 'product_info_updated') {
                        const roomId = data.roomId;
                        
                        // Broadcast thông báo, nhưng KHÔNG thay đổi trạng thái phòng
                        for (const [client, info] of clients) {
                            if (info.roomId === roomId && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'product_info_updated',
                                    roomId: roomId,
                                    productInfo: data.productInfo
                                }));
                            }
                        }
                    } else if (data.type === 'verify_product' && data.status === 'rejected') {
                        // Gửi thông báo đến tất cả client trong phòng
                        for (const [client, info] of clients) {
                            if (info.roomId === data.roomId && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'transaction_rejected',
                                    roomId: data.roomId
                                }));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Error processing message'
                    }));
                }
            });

            // Xử lý khi client ngắt kết nối
            ws.on('close', (code, reason) => {
                if (ws.roomId) {
                    console.log(`Client disconnected from room: ${ws.roomId}`, code, reason);
                }
                clients.delete(ws);
            });

            // Xử lý lỗi
            ws.on('error', (error) => {
                console.error('WebSocket connection error:', error);
                clients.delete(ws);
            });

            // Keep connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.ping();
                }
            }, 30000);

            ws.on('close', () => {
                clearInterval(pingInterval);
            });

        } catch (error) {
            console.error('Error in WebSocket connection:', error);
            ws.close(1011, 'Internal server error');
        }
    });

    // Định kỳ kiểm tra và dọn dẹp các kết nối không hợp lệ
    setInterval(() => {
        for (const [ws, info] of clients) {
            if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
                clients.delete(ws);
            }
        }
    }, 30000); // Kiểm tra mỗi 30 giây

    return wss;
}

module.exports = setupWebSocket; 