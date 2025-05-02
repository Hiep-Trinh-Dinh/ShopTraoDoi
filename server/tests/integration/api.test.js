const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');
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
    description: 'Test product description',
    image: 'test.jpg'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Cart.deleteMany({});
  await Order.deleteMany({});
});

describe('API Integration Tests', () => {
  describe('Mua sắm và thanh toán', () => {
    test('thêm sản phẩm vào giỏ hàng và đặt hàng', async () => {
      // 1. Thêm sản phẩm vào giỏ hàng
      const addToCartResponse = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: testProduct._id,
          quantity: 2
        });
      
      expect(addToCartResponse.status).toBe(200);
      expect(addToCartResponse.body.success).toBe(true);
      expect(addToCartResponse.body.data.items.length).toBe(1);
      expect(addToCartResponse.body.data.items[0].quantity).toBe(2);
      
      // 2. Lấy giỏ hàng
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.success).toBe(true);
      
      // 3. Tạo đơn hàng từ giỏ hàng
      const orderData = {
        items: cartResponse.body.data.items,
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          phone: '1234567890'
        },
        paymentMethod: 'COD',
        total: testProduct.price * 2
      };
      
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);
      
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.status).toBe('pending');
      expect(orderResponse.body.data.total).toBe(testProduct.price * 2);
      
      // 4. Kiểm tra giỏ hàng đã trống
      const emptyCartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(emptyCartResponse.status).toBe(200);
      expect(emptyCartResponse.body.data.items.length).toBe(0);
    });
  });
  
  describe('Tìm kiếm sản phẩm', () => {
    test('lọc sản phẩm theo danh mục và giá', async () => {
      // Tạo thêm sản phẩm test
      await Product.create([
        {
          name: 'Budget Phone',
          price: 50,
          category: 'Electronics',
          description: 'Cheap phone'
        },
        {
          name: 'Luxury Watch',
          price: 500,
          category: 'Accessories',
          description: 'Expensive watch'
        }
      ]);
      
      // Tìm sản phẩm theo danh mục
      const categoryResponse = await request(app)
        .get('/api/products?category=Electronics');
      
      expect(categoryResponse.status).toBe(200);
      expect(categoryResponse.body.success).toBe(true);
      expect(categoryResponse.body.data.length).toBe(2);
      expect(categoryResponse.body.data[0].category).toBe('Electronics');
      expect(categoryResponse.body.data[1].category).toBe('Electronics');
      
      // Tìm sản phẩm theo khoảng giá
      const priceResponse = await request(app)
        .get('/api/products?minPrice=100&maxPrice=600');
      
      expect(priceResponse.status).toBe(200);
      expect(priceResponse.body.success).toBe(true);
      expect(priceResponse.body.data.length).toBe(2);
      
      // Kết hợp bộ lọc
      const combinedResponse = await request(app)
        .get('/api/products?category=Electronics&maxPrice=60');
      
      expect(combinedResponse.status).toBe(200);
      expect(combinedResponse.body.success).toBe(true);
      expect(combinedResponse.body.data.length).toBe(1);
      expect(combinedResponse.body.data[0].name).toBe('Budget Phone');
    });
  });
  
  describe('Đăng ký và đăng nhập', () => {
    test('đăng ký -> xác thực email -> đăng nhập', async () => {
      // 1. Đăng ký người dùng mới
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password123'
        });
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      
      // 2. Xác thực email (giả lập)
      const token = await mongoose.model('VerificationToken').findOne({
        email: 'newuser@example.com'
      });
      
      const verifyResponse = await request(app)
        .get(`/api/auth/verify-email?token=${token.token}`);
      
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      
      // 3. Đăng nhập với tài khoản đã xác thực
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'Password123'
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('token');
      expect(loginResponse.body.data.user.name).toBe('New User');
    });
  });
});
