const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Room = require('../../models/Room');

let mongoServer;
let sellerUser;
let buyerUser;
let sellerToken;
let buyerToken;
let roomId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo users
  sellerUser = await User.create({
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
  
  sellerToken = jwt.sign({ id: sellerUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  buyerToken = jwt.sign({ id: buyerUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Room.deleteMany({});
});

describe('Room Exchange Flow', () => {
  test('quy trình trao đổi hoàn chỉnh', async () => {
    // 1. Người bán tạo phòng
    const createResponse = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productDetails: 'Game Account',
        price: 100
      });
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    
    roomId = createResponse.body.data.id;
    
    // 2. Người bán cung cấp thông tin sản phẩm
    const updateInfoResponse = await request(app)
      .put(`/api/rooms/${roomId}/product-info`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productInfo: 'Username: testuser\nPassword: test123\nGame: Minecraft'
      });
    
    expect(updateInfoResponse.status).toBe(200);
    expect(updateInfoResponse.body.data.status).toBe('info_provided');
    
    // 3. Người mua join phòng và trở thành buyer
    const joinResponse = await request(app)
      .put(`/api/rooms/${roomId}/role`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ role: 'buyer' });
    
    expect(joinResponse.status).toBe(200);
    expect(joinResponse.body.data.buyerId.toString()).toBe(buyerUser._id.toString());
    
    // 4. Người mua đặt cọc
    const depositResponse = await request(app)
      .put(`/api/rooms/${roomId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        status: 'deposited',
        depositAmount: 100
      });
    
    expect(depositResponse.status).toBe(200);
    expect(depositResponse.body.data.status).toBe('deposited');
    expect(depositResponse.body.data.depositAmount).toBe(100);
    
    // 5. Người mua xác nhận
    const buyerVerifyResponse = await request(app)
      .put(`/api/rooms/${roomId}/verify`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'verified' });
    
    expect(buyerVerifyResponse.status).toBe(200);
    expect(buyerVerifyResponse.body.data.status).toBe('buyer_verified');
    
    // 6. Người bán xác nhận hoàn tất
    const completeResponse = await request(app)
      .put(`/api/rooms/${roomId}/complete`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send();
    
    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.data.status).toBe('completed');
  });
  
  test('quy trình từ chối trao đổi', async () => {
    // 1. Người bán tạo phòng
    const createResponse = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productDetails: 'Game Account',
        price: 100
      });
    
    roomId = createResponse.body.data.id;
    
    // 2. Người bán cung cấp thông tin
    await request(app)
      .put(`/api/rooms/${roomId}/product-info`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productInfo: 'Username: testuser\nPassword: test123\nGame: Minecraft'
      });
    
    // 3. Người mua tham gia
    await request(app)
      .put(`/api/rooms/${roomId}/role`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ role: 'buyer' });
    
    // 4. Người mua đặt cọc
    await request(app)
      .put(`/api/rooms/${roomId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        status: 'deposited',
        depositAmount: 100
      });
    
    // 5. Người mua từ chối xác nhận
    const rejectResponse = await request(app)
      .put(`/api/rooms/${roomId}/verify`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'rejected' });
    
    expect(rejectResponse.status).toBe(200);
    expect(rejectResponse.body.data.status).toBe('rejected');
    
    // 6. Kiểm tra refund
    const roomResponse = await request(app)
      .get(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${buyerToken}`);
    
    expect(roomResponse.status).toBe(200);
    expect(roomResponse.body.data.status).toBe('rejected');
  });
}); 