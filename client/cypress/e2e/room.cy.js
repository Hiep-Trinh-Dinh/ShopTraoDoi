describe('Trading Room Flow', () => {
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
    
    // Mock API lấy danh sách phòng
    cy.intercept('GET', '/api/rooms*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'room1',
            title: 'Trading Room 1',
            description: 'Room for trading electronics',
            product: {
              _id: 'product1',
              name: 'Laptop Gaming',
              price: 15000000,
              image: '/images/laptop.jpg'
            },
            seller: {
              _id: 'seller1',
              name: 'Seller User'
            },
            status: 'active',
            createdAt: '2023-06-01T10:00:00Z'
          },
          {
            _id: 'room2',
            title: 'Trading Room 2',
            description: 'Room for trading smartphone',
            product: {
              _id: 'product2',
              name: 'Smartphone',
              price: 8000000,
              image: '/images/smartphone.jpg'
            },
            seller: {
              _id: 'seller2',
              name: 'Another Seller'
            },
            status: 'active',
            createdAt: '2023-06-02T11:00:00Z'
          }
        ]
      }
    }).as('getRooms');
  });
  
  it('Xem danh sách phòng trao đổi', () => {
    cy.visit('/room');
    
    // Đợi API load danh sách phòng
    cy.wait('@getRooms');
    
    // Kiểm tra phòng hiển thị
    cy.contains('Trading Room 1').should('be.visible');
    cy.contains('Trading Room 2').should('be.visible');
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('Smartphone').should('be.visible');
    cy.contains('Seller User').should('be.visible');
    cy.contains('Another Seller').should('be.visible');
  });
  
  it('Tạo phòng trao đổi mới', () => {
    // Mock API lấy sản phẩm của user
    cy.intercept('GET', '/api/products/user', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'myproduct1',
            name: 'My Laptop',
            price: 12000000,
            image: '/images/mylaptop.jpg'
          },
          {
            _id: 'myproduct2',
            name: 'My Headphones',
            price: 1500000,
            image: '/images/myheadphones.jpg'
          }
        ]
      }
    }).as('getUserProducts');
    
    // Mock API tạo phòng
    cy.intercept('POST', '/api/rooms', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'newroom',
          title: 'Trading My Laptop',
          description: 'Looking to trade my laptop',
          product: {
            _id: 'myproduct1',
            name: 'My Laptop'
          },
          seller: {
            _id: 'user123',
            name: 'Test User'
          },
          status: 'active'
        }
      }
    }).as('createRoom');
    
    cy.visit('/room');
    cy.wait('@getRooms');
    
    // Click nút tạo phòng mới
    cy.contains('Create New Room').click();
    
    // Đợi API lấy sản phẩm của user
    cy.wait('@getUserProducts');
    
    // Điền thông tin phòng
    cy.get('input[name="title"]').type('Trading My Laptop');
    cy.get('textarea[name="description"]').type('Looking to trade my laptop');
    
    // Chọn sản phẩm
    cy.contains('My Laptop').click();
    
    // Tạo phòng
    cy.contains('Create Room').click();
    
    // Đợi API tạo phòng
    cy.wait('@createRoom');
    
    // Kiểm tra chuyển hướng đến trang chi tiết phòng
    cy.url().should('include', '/room/detail/newroom');
  });
  
  it('Tham gia và trò chuyện trong phòng', () => {
    // Mock API lấy chi tiết phòng
    cy.intercept('GET', '/api/rooms/room1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'room1',
          title: 'Trading Room 1',
          description: 'Room for trading electronics',
          product: {
            _id: 'product1',
            name: 'Laptop Gaming',
            price: 15000000,
            image: '/images/laptop.jpg'
          },
          seller: {
            _id: 'seller1',
            name: 'Seller User'
          },
          status: 'active',
          createdAt: '2023-06-01T10:00:00Z'
        }
      }
    }).as('getRoomDetail');
    
    // Mock API lấy tin nhắn
    cy.intercept('GET', '/api/rooms/room1/messages', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'msg1',
            sender: {
              _id: 'seller1',
              name: 'Seller User'
            },
            content: 'Hello, welcome to my trading room',
            createdAt: '2023-06-01T10:05:00Z'
          },
          {
            _id: 'msg2',
            sender: {
              _id: 'user123',
              name: 'Test User'
            },
            content: 'Hi, I am interested in your product',
            createdAt: '2023-06-01T10:10:00Z'
          }
        ]
      }
    }).as('getMessages');
    
    cy.visit('/room');
    cy.wait('@getRooms');
    
    // Click vào phòng đầu tiên
    cy.contains('Join Room').first().click();
    
    // Đợi API lấy chi tiết phòng và tin nhắn
    cy.wait('@getRoomDetail');
    cy.wait('@getMessages');
    
    // Kiểm tra thông tin phòng và tin nhắn
    cy.contains('Trading Room 1').should('be.visible');
    cy.contains('Room for trading electronics').should('be.visible');
    cy.contains('Laptop Gaming').should('be.visible');
    cy.contains('15,000,000 đ').should('be.visible');
    cy.contains('Seller: Seller User').should('be.visible');
    
    cy.contains('Hello, welcome to my trading room').should('be.visible');
    cy.contains('Hi, I am interested in your product').should('be.visible');
    
    // Nhập và gửi tin nhắn mới (không thể test socket.io trong cypress nhưng có thể test UI)
    cy.get('input[name="message"]').type('Is the price negotiable?');
    cy.contains('Send').click();
    
    // Kiểm tra input được xóa sau khi gửi
    cy.get('input[name="message"]').should('have.value', '');
  });
}); 