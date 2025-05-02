describe('Admin Flow', () => {
  beforeEach(() => {
    // Mock login admin
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-admin-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        _id: 'admin123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }));
    });
  });
  
  it('Truy cập trang tổng quan admin', () => {
    // Mock API thống kê
    cy.intercept('GET', '/api/admin/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          totalUsers: 120,
          totalProducts: 85,
          totalOrders: 210,
          totalRevenue: 2500000,
          recentOrders: [
            { 
              _id: 'order1', 
              user: { name: 'User 1' },
              total: 150000,
              status: 'completed',
              createdAt: '2023-06-10T10:00:00Z'
            },
            { 
              _id: 'order2', 
              user: { name: 'User 2' },
              total: 200000,
              status: 'processing',
              createdAt: '2023-06-11T11:00:00Z'
            }
          ],
          topProducts: [
            { _id: 'product1', name: 'Product 1', sales: 25 },
            { _id: 'product2', name: 'Product 2', sales: 18 }
          ],
          monthlySales: [
            { month: 'Jan', revenue: 180000 },
            { month: 'Feb', revenue: 220000 },
            { month: 'Mar', revenue: 250000 }
          ]
        }
      }
    }).as('getAdminStats');
    
    cy.visit('/admin');
    
    // Đợi API lấy thống kê
    cy.wait('@getAdminStats');
    
    // Kiểm tra hiển thị tổng quan
    cy.contains('Dashboard Overview').should('be.visible');
    cy.contains('120').should('be.visible'); // Users
    cy.contains('85').should('be.visible');  // Products
    cy.contains('210').should('be.visible'); // Orders
    cy.contains('2,500,000 đ').should('be.visible'); // Revenue
    
    // Kiểm tra đơn hàng gần đây
    cy.contains('Recent Orders').should('be.visible');
    cy.contains('User 1').should('be.visible');
    cy.contains('User 2').should('be.visible');
    
    // Kiểm tra sản phẩm bán chạy
    cy.contains('Top Selling Products').should('be.visible');
    cy.contains('Product 1').should('be.visible');
    cy.contains('Product 2').should('be.visible');
  });
  
  it('Quản lý sản phẩm', () => {
    // Mock API lấy danh sách sản phẩm
    cy.intercept('GET', '/api/admin/products*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'product1',
            name: 'Laptop Gaming',
            price: 15000000,
            category: 'Electronics',
            stock: 10,
            createdAt: '2023-06-01T10:00:00Z'
          },
          {
            _id: 'product2',
            name: 'Smartphone',
            price: 8000000,
            category: 'Electronics',
            stock: 15,
            createdAt: '2023-06-02T11:00:00Z'
          }
        ],
        totalPages: 1
      }
    }).as('getAdminProducts');
    
    // Mock API xóa sản phẩm
    cy.intercept('DELETE', '/api/admin/products/product2', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Product deleted successfully'
      }
    }).as('deleteProduct');
    
    cy.visit('/admin/products');
    
    // Đợi API lấy sản phẩm
    cy.wait('@getAdminProducts');
    
    // Kiểm tra sản phẩm hiển thị
    cy.contains('Product Management').should('be.visible');
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('Smartphone').should('be.visible');
    cy.contains('15,000,000 đ').should('be.visible');
    cy.contains('8,000,000 đ').should('be.visible');
    
    // Xóa sản phẩm
    cy.contains('tr', 'Smartphone').within(() => {
      cy.contains('Delete').click();
    });
    
    // Xác nhận xóa
    cy.contains('Are you sure').should('be.visible');
    cy.contains('Yes, delete').click();
    
    // Đợi API xóa sản phẩm
    cy.wait('@deleteProduct');
    
    // Kiểm tra thông báo thành công
    cy.contains('Product deleted successfully').should('be.visible');
  });
  
  it('Quản lý người dùng', () => {
    // Mock API lấy danh sách người dùng
    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'user1',
            name: 'User One',
            email: 'user1@example.com',
            role: 'user',
            isVerified: true,
            createdAt: '2023-05-01T10:00:00Z'
          },
          {
            _id: 'user2',
            name: 'User Two',
            email: 'user2@example.com',
            role: 'user',
            isVerified: true,
            createdAt: '2023-05-02T11:00:00Z'
          }
        ],
        totalPages: 1
      }
    }).as('getAdminUsers');
    
    // Mock API cập nhật vai trò
    cy.intercept('PUT', '/api/admin/users/user2/role', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'user2',
          name: 'User Two',
          email: 'user2@example.com',
          role: 'admin'
        }
      }
    }).as('updateUserRole');
    
    cy.visit('/admin/users');
    
    // Đợi API lấy người dùng
    cy.wait('@getAdminUsers');
    
    // Kiểm tra người dùng hiển thị
    cy.contains('User Management').should('be.visible');
    cy.contains('User One').should('be.visible');
    cy.contains('User Two').should('be.visible');
    cy.contains('user1@example.com').should('be.visible');
    cy.contains('user2@example.com').should('be.visible');
    
    // Cập nhật vai trò
    cy.contains('tr', 'User Two').within(() => {
      cy.get('select').select('admin');
    });
    
    // Đợi API cập nhật vai trò
    cy.wait('@updateUserRole');
    
    // Kiểm tra thông báo thành công
    cy.contains('User role updated successfully').should('be.visible');
  });
}); 