import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import ProductDetail from '../ProductDetail';

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'product-123' }),
  useNavigate: () => jest.fn()
}));

// Mock API
global.fetch = jest.fn();

describe('ProductDetail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch product
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'product-123',
          name: 'Test Product',
          description: 'This is a test product',
          price: 100,
          category: 'Electronics',
          image: 'product.jpg'
        }
      })
    });
  });
  
  test('hiển thị chi tiết sản phẩm', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductDetail />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải sản phẩm
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin sản phẩm
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
    expect(screen.getByText('100 đ')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    
    // Kiểm tra nút Add to Cart
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });
  
  test('thêm sản phẩm vào giỏ hàng', async () => {
    // Mock add to cart API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          items: [
            { 
              product: { 
                _id: 'product-123', 
                name: 'Test Product', 
                price: 100 
              }, 
              quantity: 1 
            }
          ]
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductDetail />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải sản phẩm
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Click nút Add to Cart
    userEvent.click(screen.getByText('Add to Cart'));
    
    // Đợi toast hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product added to cart')).toBeInTheDocument();
    });
  });
  
  test('tăng/giảm số lượng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductDetail />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải sản phẩm
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Kiểm tra số lượng ban đầu
    const quantityInput = screen.getByLabelText('Quantity');
    expect(quantityInput).toHaveValue('1');
    
    // Tăng số lượng
    userEvent.click(screen.getByText('+'));
    expect(quantityInput).toHaveValue('2');
    
    // Tăng lần nữa
    userEvent.click(screen.getByText('+'));
    expect(quantityInput).toHaveValue('3');
    
    // Giảm số lượng
    userEvent.click(screen.getByText('-'));
    expect(quantityInput).toHaveValue('2');
  });
}); 