const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const ChatConversation = require('../../models/ChatConversation');
const ChatFeedback = require('../../models/ChatFeedback');

let mongoServer;
let testUser;
let adminUser;
let userToken;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo users
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    role: 'user',
    isVerified: true
  });
  
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Password123',
    role: 'admin',
    isVerified: true
  });
  
  userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await ChatConversation.deleteMany({});
  await ChatFeedback.deleteMany({});
});

describe('Chat Controller', () => {
  describe('POST /api/chat/conversation', () => {
    test('lưu cuộc hội thoại chat', async () => {
      const conversationData = {
        conversationId: 'test-conversation-123',
        message: 'Hello, I need help',
        isUserMessage: true,
        userId: testUser._id,
        timestamp: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/chat/conversation')
        .send(conversationData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversationId).toBe('test-conversation-123');
      expect(response.body.data.message).toBe('Hello, I need help');
    });
  });
  
  describe('POST /api/chat/feedback', () => {
    test('lưu phản hồi về chatbot', async () => {
      const feedbackData = {
        conversationId: 'test-conversation-123',
        messageContent: 'How do I create a room?',
        isHelpful: true,
        userId: testUser._id,
        timestamp: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/chat/feedback')
        .send(feedbackData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversationId).toBe('test-conversation-123');
      expect(response.body.data.isHelpful).toBe(true);
    });
  });
  
  describe('GET /api/chat/analytics', () => {
    test('lấy analytics (cần admin)', async () => {
      // Tạo dữ liệu test
      await ChatConversation.create([
        {
          conversationId: 'test-conversation-1',
          message: 'How do I create a room?',
          isUserMessage: true,
          userId: testUser._id
        },
        {
          conversationId: 'test-conversation-1',
          message: 'You can go to Create Room page',
          isUserMessage: false,
          responseSource: 'api'
        }
      ]);
      
      await ChatFeedback.create({
        conversationId: 'test-conversation-1',
        messageContent: 'You can go to Create Room page',
        isHelpful: true,
        userId: testUser._id
      });
      
      const response = await request(app)
        .get('/api/chat/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalConversations).toBe(1);
      expect(response.body.data.totalFeedback).toBe(1);
      expect(response.body.data.positiveRatio).toBe(1);
    });
    
    test('từ chối với user không phải admin', async () => {
      const response = await request(app)
        .get('/api/chat/analytics')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 