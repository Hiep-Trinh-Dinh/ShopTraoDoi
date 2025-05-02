import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import Cart from '../Cart';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API
global.fetch = jest.fn();

describe('Cart Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock giỏ hàng
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          items: [
            { 
              _id: '1', 
              product: { 
                _id: 'p1', 
                name: 'Product 1', 
                price: 100, 
                image: 'image1.jpg' 
              }, 
              quantity: 2 
            },
            { 
              _id: '2', 
              product: { 
                _id: 'p2', 
                name: 'Product 2', 
                price: 150, 
                image: 'image2.jpg' 
              }, 
              quantity: 1 
            }
          ]
        }
      })
    });
  });
  
  test('hiển thị giỏ hàng với các sản phẩm', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi giỏ hàng hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin giá
    expect(screen.getByText('200 đ')).toBeInTheDocument(); // 100 * 2
    expect(screen.getByText('150 đ')).toBeInTheDocument(); // 150 * 1
    
    // Kiểm tra tổng tiền
    expect(screen.getByText('350 đ')).toBeInTheDocument(); // 200 + 150
  });
  
  test('cập nhật số lượng sản phẩm', async () => {
    // Mock update API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          items: [
            { 
              _id: '1', 
              product: { 
                _id: 'p1', 
                name: 'Product 1', 
                price: 100, 
                image: 'image1.jpg' 
              }, 
              quantity: 3 
            },
            { 
              _id: '2', 
              product: { 
                _id: 'p2', 
                name: 'Product 2', 
                price: 150, 
                image: 'image2.jpg' 
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
            <Cart />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi giỏ hàng hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Tăng số lượng sản phẩm 1
    const increaseButtons = screen.getAllByText('+');
    userEvent.click(increaseButtons[0]);
    
    // Đợi cập nhật hiển thị
    await waitFor(() => {
      // Kiểm tra số lượng mới
      expect(screen.getByText('3')).toBeInTheDocument();
      // Kiểm tra tổng tiền mới: 300 (100*3) + 150 = 450
      expect(screen.getByText('450 đ')).toBeInTheDocument();
    });
  });
  
  test('xóa sản phẩm khỏi giỏ hàng', async () => {
    // Mock delete API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          items: [
            { 
              _id: '2', 
              product: { 
                _id: 'p2', 
                name: 'Product 2', 
                price: 150, 
                image: 'image2.jpg' 
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
            <Cart />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi giỏ hàng hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Xóa sản phẩm 1
    const removeButtons = screen.getAllByText('Remove');
    userEvent.click(removeButtons[0]);
    
    // Đợi cập nhật hiển thị
    await waitFor(() => {
      // Kiểm tra sản phẩm đã bị xóa
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      // Kiểm tra tổng tiền mới: 150
      expect(screen.getByText('150 đ')).toBeInTheDocument();
    });
  });
  
  test('chuyển đến trang checkout', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi giỏ hàng hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Click nút Checkout
    userEvent.click(screen.getByText('Proceed to Checkout'));
    
    // Kiểm tra chuyển hướng đến trang checkout
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
}); 