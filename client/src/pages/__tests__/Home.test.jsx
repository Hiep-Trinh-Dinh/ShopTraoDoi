import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { ProductProvider } from '../../context/ProductContext';
import Home from '../Home';

// Mock API
global.fetch = jest.fn();

// Mock các component con
jest.mock('../../components/ProductCard', () => {
  return {
    __esModule: true,
    default: ({ product }) => (
      <div data-testid="product-card">
        <h3>{product.name}</h3>
        <p>{product.price} đ</p>
      </div>
    )
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch products
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'product1', 
            name: 'Product 1', 
            price: 100, 
            category: 'Electronics',
            image: 'image1.jpg'
          },
          { 
            _id: 'product2', 
            name: 'Product 2', 
            price: 150, 
            category: 'Clothing',
            image: 'image2.jpg'
          },
          { 
            _id: 'product3', 
            name: 'Product 3', 
            price: 200, 
            category: 'Electronics',
            image: 'image3.jpg'
          }
        ],
        totalPages: 1
      })
    });
    
    // Mock fetch categories
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { _id: 'cat1', name: 'Electronics' },
          { _id: 'cat2', name: 'Clothing' },
          { _id: 'cat3', name: 'Books' }
        ]
      })
    });
  });
  
  test('hiển thị danh sách sản phẩm', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <Home />
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải sản phẩm
    await waitFor(() => {
      expect(screen.getAllByTestId('product-card').length).toBe(3);
    });
    
    // Kiểm tra sản phẩm
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
  });
  
  test('hiển thị danh mục sản phẩm', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <Home />
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh mục
    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });
    
    // Kiểm tra danh mục
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });
  
  test('hiển thị chức năng lọc giá', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <Home />
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Price Range')).toBeInTheDocument();
    });
    
    // Kiểm tra slider giá
    expect(screen.getByText('Min:')).toBeInTheDocument();
    expect(screen.getByText('Max:')).toBeInTheDocument();
    
    // Kiểm tra nút apply filter
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });
}); 