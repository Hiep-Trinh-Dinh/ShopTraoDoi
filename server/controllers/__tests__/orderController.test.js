const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

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
  await Order.deleteMany({});
});

describe('Order Controller', () => {
  describe('POST /api/orders', () => {
    test('tạo đơn hàng mới', async () => {
      const orderData = {
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          phone: '1234567890'
        },
        paymentMethod: 'COD',
        total: testProduct.price * 2
      };
      
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.toString()).toBe(testUser._id.toString());
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].product.toString()).toBe(testProduct._id.toString());
      expect(response.body.data.status).toBe('pending');
    });
    
    test('từ chối khi không xác thực', async () => {
      const orderData = {
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          phone: '1234567890'
        },
        paymentMethod: 'COD',
        total: testProduct.price * 2
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/orders/user', () => {
    test('lấy đơn hàng của người dùng', async () => {
      // Tạo đơn hàng trước
      await Order.create({
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          phone: '1234567890'
        },
        paymentMethod: 'COD',
        total: testProduct.price * 2,
        status: 'pending'
      });
      
      const response = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].user.toString()).toBe(testUser._id.toString());
    });
  });
  
  describe('GET /api/orders/:id', () => {
    test('lấy chi tiết đơn hàng', async () => {
      // Tạo đơn hàng
      const order = await Order.create({
        user: testUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          phone: '1234567890'
        },
        paymentMethod: 'COD',
        total: testProduct.price * 2,
        status: 'pending'
      });
      
      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(order._id.toString());
    });
  });
}); 