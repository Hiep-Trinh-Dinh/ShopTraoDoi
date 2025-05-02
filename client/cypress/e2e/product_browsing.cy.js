describe('Product Browsing', () => {
  beforeEach(() => {
    // Giả lập danh sách sản phẩm
    cy.intercept('GET', '/api/products*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: '1', name: 'Product 1', price: 100, category: 'Electronics', image: 'image1.jpg' },
          { _id: '2', name: 'Product 2', price: 200, category: 'Clothing', image: 'image2.jpg' }
        ]
      }
    }).as('getProducts');
  });
  
  it('should display product list', () => {
    cy.visit('/products');
    
    cy.wait('@getProducts');
    
    // Kiểm tra danh sách sản phẩm
    cy.contains('Product 1').should('be.visible');
    cy.contains('Product 2').should('be.visible');
    cy.contains('100 đ').should('be.visible');
  });
  
  it('should filter products by category', () => {
    // Giả lập kết quả lọc
    cy.intercept('GET', '/api/products?category=Electronics', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: '1', name: 'Product 1', price: 100, category: 'Electronics', image: 'image1.jpg' }
        ]
      }
    }).as('getFilteredProducts');
    
    cy.visit('/products');
    
    // Chọn danh mục
    cy.wait('@getProducts');
    cy.get('select').select('Electronics');
    
    // Đợi kết quả lọc
    cy.wait('@getFilteredProducts');
    
    // Kiểm tra kết quả
    cy.contains('Product 1').should('be.visible');
    cy.contains('Product 2').should('not.exist');
  });
  
  it('should navigate to product detail', () => {
    // Giả lập chi tiết sản phẩm
    cy.intercept('GET', '/api/products/1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: '1',
          name: 'Product 1',
          price: 100,
          category: 'Electronics',
          image: 'image1.jpg',
          description: 'Product 1 description'
        }
      }
    }).as('getProductDetail');
    
    cy.visit('/products');
    
    cy.wait('@getProducts');
    cy.contains('Product 1').click();
    
    // Đợi load chi tiết
    cy.wait('@getProductDetail');
    
    // Kiểm tra trang chi tiết
    cy.url().should('include', '/products/1');
    cy.contains('Product 1').should('be.visible');
    cy.contains('Product 1 description').should('be.visible');
  });
}); 