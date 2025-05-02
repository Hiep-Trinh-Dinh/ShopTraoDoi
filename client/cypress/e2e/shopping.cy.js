describe('Shopping Flow', () => {
  beforeEach(() => {
    // Mock login để đảm bảo user đã đăng nhập
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
    
    // Mock API endpoints
    cy.intercept('GET', '/api/products*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'product1',
            name: 'Laptop Gaming',
            description: 'High performance gaming laptop',
            price: 15000000,
            category: 'Electronics',
            image: '/images/laptop.jpg',
            stock: 10
          },
          {
            _id: 'product2',
            name: 'Smartphone',
            description: 'Latest smartphone model',
            price: 8000000,
            category: 'Electronics',
            image: '/images/smartphone.jpg',
            stock: 15
          },
          {
            _id: 'product3',
            name: 'Wireless Headphones',
            description: 'Premium wireless headphones',
            price: 2000000,
            category: 'Electronics',
            image: '/images/headphones.jpg',
            stock: 20
          }
        ],
        totalPages: 1
      }
    }).as('getProducts');
    
    cy.intercept('GET', '/api/categories', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'cat1', name: 'Electronics' },
          { _id: 'cat2', name: 'Clothing' },
          { _id: 'cat3', name: 'Books' }
        ]
      }
    }).as('getCategories');
  });
  
  it('Xem danh sách sản phẩm và lọc theo danh mục', () => {
    cy.visit('/');
    
    // Đợi API load sản phẩm
    cy.wait('@getProducts');
    cy.wait('@getCategories');
    
    // Kiểm tra sản phẩm hiển thị
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('Smartphone').should('be.visible');
    cy.contains('Wireless Headphones').should('be.visible');
    
    // Lọc theo danh mục Electronics (mock API response cho request lọc)
    cy.intercept('GET', '/api/products?category=Electronics*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'product1',
            name: 'Laptop Gaming',
            description: 'High performance gaming laptop',
            price: 15000000,
            category: 'Electronics',
            image: '/images/laptop.jpg',
            stock: 10
          },
          {
            _id: 'product2',
            name: 'Smartphone',
            description: 'Latest smartphone model',
            price: 8000000,
            category: 'Electronics',
            image: '/images/smartphone.jpg',
            stock: 15
          }
        ],
        totalPages: 1
      }
    }).as('getElectronics');
    
    // Click vào danh mục Electronics
    cy.contains('Electronics').click();
    
    // Đợi API lọc sản phẩm
    cy.wait('@getElectronics');
    
    // Kiểm tra sản phẩm đã lọc
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('Smartphone').should('be.visible');
  });
  
  it('Xem chi tiết sản phẩm', () => {
    // Mock API chi tiết sản phẩm
    cy.intercept('GET', '/api/products/product1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'product1',
          name: 'Laptop Gaming',
          description: 'High performance gaming laptop with latest GPU and CPU.',
          price: 15000000,
          category: 'Electronics',
          image: '/images/laptop.jpg',
          stock: 10
        }
      }
    }).as('getProductDetail');
    
    cy.visit('/');
    cy.wait('@getProducts');
    
    // Click vào sản phẩm đầu tiên
    cy.contains('Laptop Gaming').click();
    
    // Đợi API chi tiết sản phẩm
    cy.wait('@getProductDetail');
    
    // Kiểm tra thông tin chi tiết sản phẩm
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('High performance gaming laptop with latest GPU and CPU.').should('be.visible');
    cy.contains('15,000,000 đ').should('be.visible');
    cy.contains('Add to Cart').should('be.visible');
  });
  
  it('Thêm sản phẩm vào giỏ hàng', () => {
    // Mock API chi tiết sản phẩm
    cy.intercept('GET', '/api/products/product1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'product1',
          name: 'Laptop Gaming',
          description: 'High performance gaming laptop',
          price: 15000000,
          category: 'Electronics',
          image: '/images/laptop.jpg',
          stock: 10
        }
      }
    }).as('getProductDetail');
    
    // Mock API thêm vào giỏ hàng
    cy.intercept('POST', '/api/cart', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          items: [
            {
              _id: 'cartitem1',
              product: {
                _id: 'product1',
                name: 'Laptop Gaming',
                price: 15000000,
                image: '/images/laptop.jpg'
              },
              quantity: 1
            }
          ]
        }
      }
    }).as('addToCart');
    
    cy.visit('/product/product1');
    cy.wait('@getProductDetail');
    
    // Thêm vào giỏ hàng
    cy.contains('Add to Cart').click();
    
    // Đợi API thêm giỏ hàng
    cy.wait('@addToCart');
    
    // Kiểm tra thông báo thành công
    cy.contains('Product added to cart').should('be.visible');
  });
  
  it('Xem giỏ hàng và thanh toán', () => {
    // Mock API lấy giỏ hàng
    cy.intercept('GET', '/api/cart', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          items: [
            {
              _id: 'cartitem1',
              product: {
                _id: 'product1',
                name: 'Laptop Gaming',
                price: 15000000,
                image: '/images/laptop.jpg'
              },
              quantity: 1
            },
            {
              _id: 'cartitem2',
              product: {
                _id: 'product3',
                name: 'Wireless Headphones',
                price: 2000000,
                image: '/images/headphones.jpg'
              },
              quantity: 2
            }
          ]
        }
      }
    }).as('getCart');
    
    // Mock API tạo đơn hàng
    cy.intercept('POST', '/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'order123',
          total: 19000000,
          status: 'pending'
        }
      }
    }).as('createOrder');
    
    cy.visit('/cart');
    cy.wait('@getCart');
    
    // Kiểm tra sản phẩm trong giỏ hàng
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('Wireless Headphones').should('be.visible');
    cy.contains('15,000,000 đ').should('be.visible');
    cy.contains('4,000,000 đ').should('be.visible'); // 2 x 2,000,000
    cy.contains('19,000,000 đ').should('be.visible'); // Tổng
    
    // Tiến hành thanh toán
    cy.contains('Proceed to Checkout').click();
    
    // Điền thông tin giao hàng
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="address"]').type('123 Test Street');
    cy.get('input[name="city"]').type('Test City');
    cy.get('input[name="phone"]').type('1234567890');
    
    // Chọn phương thức thanh toán
    cy.get('input[type="radio"][value="COD"]').check();
    
    // Đặt hàng
    cy.contains('Place Order').click();
    
    // Đợi API tạo đơn hàng
    cy.wait('@createOrder');
    
    // Kiểm tra chuyển hướng đến trang chi tiết đơn hàng
    cy.url().should('include', '/orders/order123');
  });
}); 