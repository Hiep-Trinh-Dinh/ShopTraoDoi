describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'fake-jwt-token'
        }
      }
    }).as('loginRequest');
    
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Registration successful. Please verify your email.'
      }
    }).as('registerRequest');
  });
  
  it('Đăng ký người dùng mới', () => {
    cy.visit('/register');
    
    // Điền form đăng ký
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="confirmPassword"]').type('Password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Đợi API call
    cy.wait('@registerRequest');
    
    // Kiểm tra chuyển hướng sau khi đăng ký
    cy.url().should('include', '/login');
    
    // Kiểm tra thông báo thành công
    cy.contains('Registration successful').should('be.visible');
  });
  
  it('Đăng nhập thành công', () => {
    cy.visit('/login');
    
    // Điền form đăng nhập
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Đợi API call
    cy.wait('@loginRequest');
    
    // Kiểm tra chuyển hướng sau khi đăng nhập
    cy.url().should('equal', 'http://localhost:3000/');
    
    // Kiểm tra tên người dùng hiển thị trong navbar
    cy.contains('Test User').should('be.visible');
  });
  
  it('Đăng nhập thất bại với thông tin không hợp lệ', () => {
    // Intercept login request với phản hồi thất bại
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: false,
        message: 'Invalid email or password'
      }
    }).as('failedLoginRequest');
    
    cy.visit('/login');
    
    // Điền form đăng nhập với thông tin không đúng
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Đợi API call
    cy.wait('@failedLoginRequest');
    
    // Kiểm tra thông báo lỗi
    cy.contains('Invalid email or password').should('be.visible');
    
    // Kiểm tra không chuyển hướng
    cy.url().should('include', '/login');
  });
  
  it('Xác thực email', () => {
    // Intercept verify email request
    cy.intercept('GET', '/api/auth/verify*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Email verified successfully'
      }
    }).as('verifyEmailRequest');
    
    cy.visit('/verify-email?token=valid-token');
    
    // Đợi API call
    cy.wait('@verifyEmailRequest');
    
    // Kiểm tra thông báo thành công
    cy.contains('Email verified successfully').should('be.visible');
    
    // Kiểm tra nút đăng nhập hiển thị
    cy.contains('Login to your account').should('be.visible');
  });
}); 