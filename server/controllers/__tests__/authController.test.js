const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const VerificationToken = require('../../models/VerificationToken');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await VerificationToken.deleteMany({});
});

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    };
    
    test('đăng ký tài khoản thành công', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.name).toBe(validUser.name);
      expect(response.body.data.user.email).toBe(validUser.email);
      
      // Kiểm tra token xác thực đã được tạo
      const verificationToken = await VerificationToken.findOne({ 
        email: validUser.email 
      });
      expect(verificationToken).toBeTruthy();
    });
    
    test('đăng ký thất bại - email đã tồn tại', async () => {
      // Tạo user trước
      await User.create(validUser);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Email đã tồn tại/i);
    });
    
    test('đăng ký thất bại - mật khẩu không khớp', async () => {
      const invalidUser = {
        ...validUser,
        confirmPassword: 'DifferentPassword'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/không khớp/i);
    });
  });
  
  describe('POST /api/auth/login', () => {
    test('đăng nhập thành công', async () => {
      // Tạo user trước
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        isVerified: true
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.name).toBe('Test User');
    });
    
    test('đăng nhập thất bại - email không tồn tại', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    test('đăng nhập thất bại - mật khẩu không đúng', async () => {
      // Tạo user trước
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        isVerified: true
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
