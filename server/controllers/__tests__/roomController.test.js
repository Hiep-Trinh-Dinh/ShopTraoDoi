const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Room = require('../../models/Room');

let mongoServer;
let testUser;
let buyerUser;
let userToken;
let buyerToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo user test
  testUser = await User.create({
    name: 'Seller User',
    email: 'seller@example.com',
    password: 'Password123',
    isVerified: true
  });
  
  buyerUser = await User.create({
    name: 'Buyer User',
    email: 'buyer@example.com',
    password: 'Password123',
    isVerified: true
  });
  
  userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  buyerToken = jwt.sign({ id: buyerUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Room.deleteMany({});
});

describe('Room Controller', () => {
  describe('POST /api/rooms', () => {
    test('tạo phòng thành công', async () => {
      const roomData = {
        productDetails: 'Test Product',
        price: 100
      };
      
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send(roomData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.sellerId.toString()).toBe(testUser._id.toString());
      expect(response.body.data.status).toBe('pending');
    });
  });
  
  describe('PUT /api/rooms/:id/product-info', () => {
    test('cập nhật thông tin sản phẩm', async () => {
      // Tạo phòng
      const room = await Room.create({
        id: 'TEST123',
        productDetails: 'Test Product',
        price: 100,
        sellerId: testUser._id,
        status: 'pending'
      });
      
      const response = await request(app)
        .put(`/api/rooms/${room.id}/product-info`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productInfo: 'Detailed product info' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.productInfo).toBe('Detailed product info');
      expect(response.body.data.status).toBe('info_provided');
    });
    
    test('từ chối cập nhật từ người dùng không phải người bán', async () => {
      // Tạo phòng
      const room = await Room.create({
        id: 'TEST123',
        productDetails: 'Test Product',
        price: 100,
        sellerId: testUser._id,
        status: 'pending'
      });
      
      const response = await request(app)
        .put(`/api/rooms/${room.id}/product-info`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productInfo: 'Detailed product info' });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/rooms/:id/status', () => {
    test('cập nhật trạng thái thành deposited', async () => {
      // Tạo phòng
      const room = await Room.create({
        id: 'TEST123',
        productDetails: 'Test Product',
        price: 100,
        sellerId: testUser._id,
        buyerId: buyerUser._id,
        status: 'info_provided'
      });
      
      const response = await request(app)
        .put(`/api/rooms/${room.id}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ 
          status: 'deposited',
          depositAmount: 100
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('deposited');
      expect(response.body.data.depositAmount).toBe(100);
    });
  });
});
