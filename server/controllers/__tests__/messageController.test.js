const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Room = require('../../models/Room');
const Message = require('../../models/Message');

let mongoServer;
let testUser;
let userToken;
let testRoom;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo user test
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    isVerified: true
  });
  
  userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // Tạo phòng test
  testRoom = await Room.create({
    id: 'TEST123',
    productDetails: 'Test Product',
    price: 100,
    sellerId: testUser._id,
    status: 'pending'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Message.deleteMany({});
});

describe('Message Controller', () => {
  describe('GET /api/messages/rooms/:roomId/messages', () => {
    test('lấy tin nhắn của phòng', async () => {
      // Tạo tin nhắn test
      await Message.create([
        {
          roomId: testRoom.id,
          text: 'Message 1',
          sender: testUser._id,
          timestamp: new Date()
        },
        {
          roomId: testRoom.id,
          text: 'Message 2',
          sender: testUser._id,
          timestamp: new Date()
        }
      ]);
      
      const response = await request(app)
        .get(`/api/messages/rooms/${testRoom.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].text).toBe('Message 1');
      expect(response.body.data[1].text).toBe('Message 2');
    });
    
    test('trả về mảng rỗng khi phòng không có tin nhắn', async () => {
      const response = await request(app)
        .get(`/api/messages/rooms/${testRoom.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });
  
  describe('POST /api/messages/rooms/:roomId/messages', () => {
    test('gửi tin nhắn mới', async () => {
      const response = await request(app)
        .post(`/api/messages/rooms/${testRoom.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: 'New message'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe('New message');
      expect(response.body.data.sender.toString()).toBe(testUser._id.toString());
      expect(response.body.data.roomId).toBe(testRoom.id);
    });
    
    test('từ chối gửi tin nhắn với nội dung trống', async () => {
      const response = await request(app)
        .post(`/api/messages/rooms/${testRoom.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 