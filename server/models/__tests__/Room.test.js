const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Room = require('../Room');
const User = require('../User');

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo user test
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Room.deleteMany({});
});

describe('Room Model', () => {
  test('tạo room thành công với thông tin hợp lệ', async () => {
    const roomData = {
      id: 'TEST123',
      productDetails: 'Test Product',
      price: 100,
      sellerId: testUser._id
    };
    
    const room = await Room.create(roomData);
    
    expect(room).toBeDefined();
    expect(room.id).toBe(roomData.id);
    expect(room.productDetails).toBe(roomData.productDetails);
    expect(room.price).toBe(roomData.price);
    expect(room.sellerId.toString()).toBe(testUser._id.toString());
    expect(room.status).toBe('pending'); // Default status
  });
  
  test('room ID phải là duy nhất', async () => {
    // Tạo room đầu tiên
    await Room.create({
      id: 'DUPLICATE',
      productDetails: 'Test Product',
      price: 100,
      sellerId: testUser._id
    });
    
    // Thử tạo room thứ hai với ID trùng
    await expect(
      Room.create({
        id: 'DUPLICATE',
        productDetails: 'Another Product',
        price: 200,
        sellerId: testUser._id
      })
    ).rejects.toThrow();
  });
  
  test('price phải là số dương', async () => {
    await expect(
      Room.create({
        id: 'TEST123',
        productDetails: 'Test Product',
        price: -100,
        sellerId: testUser._id
      })
    ).rejects.toThrow();
  });
  
  test('trạng thái phải nằm trong enum hợp lệ', async () => {
    await expect(
      Room.create({
        id: 'TEST123',
        productDetails: 'Test Product',
        price: 100,
        sellerId: testUser._id,
        status: 'invalid_status'
      })
    ).rejects.toThrow();
  });
});
