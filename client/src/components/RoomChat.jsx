import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../context/AuthContext';

const RoomChat = ({ roomId, role }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Hàm kết nối WebSocket
    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        // Close existing connection if any
        if (wsRef.current) {
            console.log('Closing existing connection');
            wsRef.current.close();
        }

        try {
            console.log('Attempting to connect to WebSocket...');
            const ws = new WebSocket(`ws://localhost:5000/ws/room`);
            wsRef.current = ws;
            
            // Connection timeout
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                    console.log('Connection timeout - closing socket');
                    ws.close();
                }
            }, 5000);
            
            // Send room ID after connection
            ws.onopen = () => {
                console.log('Connected to WebSocket server');
                clearTimeout(connectionTimeout);
                setIsConnected(true);
                setReconnectAttempt(0);
                
                // Send room ID
                ws.send(JSON.stringify({
                    type: 'join_room',
                    roomId: roomId
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received message:', data);
                    
                    if (data.type === 'connected') {
                        console.log('Server acknowledged connection');
                        return;
                    }
                    
                    if (data.type === 'connection_established') {
                        console.log('Room connection confirmed by server');
                        // Fetch existing messages when room connection is confirmed
                        fetch(`http://localhost:5000/api/messages/rooms/${roomId}/messages`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('API response not OK');
                                }
                                return response.json();
                            })
                            .then(data => {
                                const messageArray = Array.isArray(data) ? data : [];
                                setMessages(messageArray);
                            })
                            .catch(error => {
                                console.error('Error fetching messages:', error);
                                setMessages([]);
                            });
                        return;
                    }

                    if (data.type === 'error') {
                        console.error('Server error:', data.message);
                        return;
                    }

                    if (data.type === 'message_sent') {
                        // Add the sent message to the messages list
                        setMessages(prev => [...prev, {
                            id: data.message._id,
                            text: data.message.text,
                            sender: data.message.sender,
                            role: data.message.role,
                            timestamp: new Date(data.message.timestamp)
                        }]);
                        return;
                    }

                    if (data.type === 'chat_message') {
                        // Add received message to the messages list
                        setMessages(prev => [...prev, {
                            id: data._id,
                            text: data.text,
                            sender: data.sender,
                            role: data.role,
                            timestamp: new Date(data.timestamp)
                        }]);
                        return;
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                setIsConnected(false);
                clearTimeout(connectionTimeout);
                
                // Don't attempt to reconnect if the connection was closed normally
                // or if component is unmounting
                if (event.code !== 1000 && event.code !== 1001) {
                    // Attempt to reconnect with exponential backoff
                    const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
                    console.log(`Attempting to reconnect in ${timeout}ms...`);
                    setTimeout(() => {
                        setReconnectAttempt(prev => prev + 1);
                        connectWebSocket();
                    }, timeout);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Log additional connection state information
                console.log('Connection state:', {
                    readyState: ws.readyState,
                    url: ws.url,
                    protocol: ws.protocol,
                    bufferedAmount: ws.bufferedAmount
                });
            };

            // Handle component unmount
            return () => {
                clearTimeout(connectionTimeout);
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close(1000, 'Component unmounting');
                }
            };
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            setIsConnected(false);
        }
    };

    // Kết nối WebSocket khi component được mount
    useEffect(() => {
        const cleanup = connectWebSocket();
        
        return () => {
            if (cleanup) cleanup();
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
            }
        };
    }, [roomId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !isConnected) return;

        // Tạo tin nhắn mới
        const message = {
            roomId,
            text: inputMessage,
            sender: user.id,
            role: role,
            timestamp: new Date()
        };

        // Chỉ gửi tin nhắn qua WebSocket, không cần gửi qua HTTP
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                ...message,
                type: 'chat_message' // Thêm type để phân biệt loại tin nhắn
            }));
        }

        setInputMessage('');
        setShowEmojiPicker(false);
    };

    const handleEmojiSelect = (emojiObject) => {
        setInputMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="p-4 bg-[#5350C4] text-white rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold">Chat Room</h3>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {Array.isArray(messages) && messages.map((message, index) => (
                    <div
                        key={message.id || index}
                        className={`flex ${message.sender === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender === user.id
                                    ? 'bg-[#5350C4] text-white'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            <div className="text-sm font-medium mb-1">
                                {message.sender === user.id ? 'You' : message.role}
                            </div>
                            <p className="text-sm">{message.text}</p>
                            <div className="text-xs opacity-70 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="relative">
                    <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-[#5350C4]"
                            disabled={!isConnected}
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                            className="flex-1 ml-2 bg-transparent border-none focus:outline-none"
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || !isConnected}
                            className="text-[#5350C4] hover:text-[#3d39ac] disabled:text-gray-400"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2">
                            <EmojiPicker
                                onEmojiClick={handleEmojiSelect}
                                width={300}
                                height={400}
                            />
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RoomChat; 