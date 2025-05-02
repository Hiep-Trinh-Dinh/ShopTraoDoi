const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const authMiddleware = require('../authMiddleware');

let mongoServer;
let testUser;
let adminUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo user test
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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Middleware', () => {
  describe('protect', () => {
    test('từ chối khi không có token', async () => {
      const req = {
        headers: {}
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      await authMiddleware.protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
    
    test('cho phép với token hợp lệ', async () => {
      const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
      
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      await authMiddleware.protect(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testUser._id.toString());
      expect(next).toHaveBeenCalled();
    });
    
    test('từ chối với token không hợp lệ', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      await authMiddleware.protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('admin', () => {
    test('cho phép admin truy cập', async () => {
      const req = {
        user: adminUser
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      authMiddleware.admin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    test('từ chối user thường', async () => {
      const req = {
        user: testUser
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      authMiddleware.admin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 