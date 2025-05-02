describe('Room Exchange Flow', () => {
  beforeEach(() => {
    // Login as seller
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-seller-token',
          user: {
            _id: '1',
            name: 'Seller User',
            email: 'seller@example.com'
          }
        }
      }
    }).as('loginSeller');
    
    cy.visit('/login');
    cy.get('input[name=email]').type('seller@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.wait('@loginSeller');
  });
  
  it('should create a room and share room code', () => {
    // Mock room creation
    cy.intercept('POST', '/api/rooms', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          id: 'TEST123',
          productDetails: 'Game Account',
          price: 100,
          sellerId: '1',
          status: 'pending'
        }
      }
    }).as('createRoom');
    
    // Navigate to create room
    cy.visit('/create-room');
    
    // Fill form
    cy.get('input[name=productDetails]').type('Game Account');
    cy.get('input[name=price]').type('100');
    cy.get('button[type=submit]').click();
    
    cy.wait('@createRoom');
    
    // Check if redirected to room page
    cy.url().should('include', '/room/TEST123');
    
    // Verify room ID is displayed
    cy.contains('TEST123').should('be.visible');
    cy.contains('Game Account').should('be.visible');
    cy.contains('pending').should('be.visible');
  });
  
  it('should provide product information', () => {
    // Mock room data
    cy.intercept('GET', '/api/rooms/TEST123', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 'TEST123',
          productDetails: 'Game Account',
          price: 100,
          sellerId: '1',
          status: 'pending'
        }
      }
    }).as('getRoom');
    
    // Mock product info update
    cy.intercept('PUT', '/api/rooms/TEST123/product-info', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 'TEST123',
          productDetails: 'Game Account',
          price: 100,
          sellerId: '1',
          status: 'info_provided',
          productInfo: 'Username: testuser\nPassword: test123'
        }
      }
    }).as('updateInfo');
    
    // Visit room
    cy.visit('/room/TEST123');
    cy.wait('@getRoom');
    
    // Fill product info
    cy.get('textarea[name=productInfo]').type('Username: testuser\nPassword: test123');
    cy.contains('Cung cấp thông tin').click();
    
    cy.wait('@updateInfo');
    
    // Verify status updated
    cy.contains('info_provided').should('be.visible');
  });
}); 