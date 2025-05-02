const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../User');

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
});

describe('User Model', () => {
  test('tạo user thành công với thông tin hợp lệ', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123'
    };
    
    const user = await User.create(userData);
    
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    // Password phải được hash, không lưu dạng plaintext
    expect(user.password).not.toBe(userData.password);
  });
  
  test('email phải là duy nhất', async () => {
    // Tạo user đầu tiên
    await User.create({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'Password123'
    });
    
    // Thử tạo user thứ hai với email trùng
    await expect(
      User.create({
        name: 'Another User',
        email: 'duplicate@example.com',
        password: 'Password456'
      })
    ).rejects.toThrow();
  });
  
  test('email phải đúng định dạng', async () => {
    await expect(
      User.create({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      })
    ).rejects.toThrow();
  });
  
  test('so sánh mật khẩu hoạt động đúng', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123'
    });
    
    const passwordMatch = await user.matchPassword('Password123');
    const passwordMismatch = await user.matchPassword('WrongPassword');
    
    expect(passwordMatch).toBe(true);
    expect(passwordMismatch).toBe(false);
  });
});
