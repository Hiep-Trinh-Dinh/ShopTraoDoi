describe('Authentication Flow', () => {
  it('should show login form and navigate to register', () => {
    cy.visit('/login');
    
    // Kiểm tra form login
    cy.get('input[name=email]').should('exist');
    cy.get('input[name=password]').should('exist');
    cy.get('button[type=submit]').should('contain', 'Đăng nhập');
    
    // Click vào link đăng ký
    cy.contains('Đăng ký').click();
    cy.url().should('include', '/register');
  });
  
  it('should show register form with validation', () => {
    cy.visit('/register');
    
    // Kiểm tra form đăng ký
    cy.get('input[name=name]').should('exist');
    cy.get('input[name=email]').should('exist');
    cy.get('input[name=password]').should('exist');
    cy.get('input[name=confirmPassword]').should('exist');
    
    // Kiểm tra validation
    cy.get('button[type=submit]').click();
    cy.contains('Tên không được để trống').should('be.visible');
    
    // Nhập thông tin không hợp lệ
    cy.get('input[name=email]').type('invalid-email');
    cy.get('button[type=submit]').click();
    cy.contains('Email không hợp lệ').should('be.visible');
  });
  
  it('should login successfully', () => {
    // Giả lập API response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-token',
          user: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      }
    }).as('loginRequest');
    
    cy.visit('/login');
    
    // Nhập thông tin đăng nhập
    cy.get('input[name=email]').type('test@example.com');
    cy.get('input[name=password]').type('Password123');
    cy.get('button[type=submit]').click();
    
    // Đợi request hoàn tất
    cy.wait('@loginRequest');
    
    // Kiểm tra redirect về trang chủ
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Kiểm tra hiển thị tên người dùng
    cy.contains('Test User').should('be.visible');
  });
}); 