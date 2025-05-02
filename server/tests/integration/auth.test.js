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

describe('Authentication Flow', () => {
  test('đăng ký -> xác thực email -> đăng nhập', async () => {
    // 1. Đăng ký
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      });
    
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    
    // Lấy token xác thực
    const verificationToken = await VerificationToken.findOne({ 
      email: 'test@example.com' 
    });
    expect(verificationToken).toBeTruthy();
    
    // 2. Xác thực email
    const verifyResponse = await request(app)
      .get(`/api/auth/verify-email?token=${verificationToken.token}`);
    
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.success).toBe(true);
    
    // Kiểm tra user đã được xác thực
    const user = await User.findOne({ email: 'test@example.com' });
    expect(user.isVerified).toBe(true);
    
    // 3. Đăng nhập
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
      });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data).toHaveProperty('token');
    expect(loginResponse.body.data.user.name).toBe('Test User');
  });
  
  test('đăng nhập thất bại khi chưa xác thực email', async () => {
    // Tạo user chưa xác thực
    await User.create({
      name: 'Unverified User',
      email: 'unverified@example.com',
      password: 'Password123',
      isVerified: false
    });
    
    // Thử đăng nhập
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unverified@example.com',
        password: 'Password123'
      });
    
    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.success).toBe(false);
    expect(loginResponse.body.message).toMatch(/chưa xác thực/i);
  });
}); 