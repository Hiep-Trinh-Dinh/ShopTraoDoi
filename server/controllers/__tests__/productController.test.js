const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Product = require('../../models/Product');

let mongoServer;
let testUser;
let adminUser;
let userToken;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Tạo user test và token
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
  
  userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Product Controller', () => {
  describe('GET /api/products', () => {
    test('lấy danh sách sản phẩm', async () => {
      // Tạo sản phẩm test
      await Product.create([
        { name: 'Product 1', price: 100, category: 'Electronics', description: 'Test product 1' },
        { name: 'Product 2', price: 200, category: 'Clothing', description: 'Test product 2' }
      ]);
      
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });
    
    test('lọc sản phẩm theo danh mục', async () => {
      // Tạo sản phẩm test
      await Product.create([
        { name: 'Product 1', price: 100, category: 'Electronics', description: 'Test product 1' },
        { name: 'Product 2', price: 200, category: 'Clothing', description: 'Test product 2' }
      ]);
      
      const response = await request(app).get('/api/products?category=Electronics');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Product 1');
    });
  });
  
  describe('GET /api/products/:id', () => {
    test('lấy chi tiết sản phẩm', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        category: 'Electronics',
        description: 'Product description'
      });
      
      const response = await request(app).get(`/api/products/${product._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Product');
    });
    
    test('không tìm thấy sản phẩm', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/products', () => {
    test('tạo sản phẩm mới (admin)', async () => {
      const productData = {
        name: 'New Product',
        price: 150,
        category: 'Electronics',
        description: 'New product description'
      };
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Product');
    });
    
    test('từ chối tạo sản phẩm (user thường)', async () => {
      const productData = {
        name: 'New Product',
        price: 150,
        category: 'Electronics',
        description: 'New product description'
      };
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 