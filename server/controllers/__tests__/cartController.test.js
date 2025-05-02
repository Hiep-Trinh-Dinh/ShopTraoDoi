const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');

let mongoServer;
let testUser;
let userToken;
let testProduct;

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
  
  userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // Tạo sản phẩm test
  testProduct = await Product.create({
    name: 'Test Product',
    price: 100,
    category: 'Electronics',
    description: 'Test product description'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Cart.deleteMany({});
});

describe('Cart Controller', () => {
  describe('POST /api/cart/add', () => {
    test('thêm sản phẩm vào giỏ hàng', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id,
          quantity: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].product.toString()).toBe(testProduct._id.toString());
      expect(response.body.data.items[0].quantity).toBe(2);
    });
    
    test('không thêm sản phẩm khi chưa đăng nhập', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({
          productId: testProduct._id,
          quantity: 2
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/cart', () => {
    test('lấy giỏ hàng của user', async () => {
      // Tạo giỏ hàng cho user
      await Cart.create({
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 3
          }
        ]
      });
      
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].quantity).toBe(3);
    });
  });
  
  describe('PUT /api/cart/update', () => {
    test('cập nhật số lượng sản phẩm', async () => {
      // Tạo giỏ hàng trước
      await Cart.create({
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 1
          }
        ]
      });
      
      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id,
          quantity: 5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].quantity).toBe(5);
    });
  });
  
  describe('DELETE /api/cart/remove', () => {
    test('xóa sản phẩm khỏi giỏ hàng', async () => {
      // Tạo giỏ hàng trước
      await Cart.create({
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 1
          }
        ]
      });
      
      const response = await request(app)
        .delete('/api/cart/remove')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(0);
    });
  });
}); 