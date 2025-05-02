import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import Checkout from '../Checkout';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock APIs
global.fetch = jest.fn();

describe('Checkout Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock cart items
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
  
  test('hiển thị form checkout và thông tin giỏ hàng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });
    
    // Kiểm tra form shipping
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    
    // Kiểm tra thông tin đơn hàng
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('350 đ')).toBeInTheDocument(); // 100*2 + 150
  });
  
  test('xác nhận đặt hàng thành công', async () => {
    // Mock tạo đơn hàng
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'order123',
          total: 350,
          status: 'pending'
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });
    
    // Nhập thông tin shipping
    userEvent.type(screen.getByLabelText('Full Name'), 'John Doe');
    userEvent.type(screen.getByLabelText('Address'), '123 Main St');
    userEvent.type(screen.getByLabelText('City'), 'New York');
    userEvent.type(screen.getByLabelText('Phone'), '1234567890');
    
    // Chọn phương thức thanh toán
    userEvent.click(screen.getByLabelText('COD (Cash on Delivery)'));
    
    // Đặt hàng
    userEvent.click(screen.getByText('Place Order'));
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/orders',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('John Doe')
        })
      );
    });
    
    // Kiểm tra chuyển hướng
    expect(mockNavigate).toHaveBeenCalledWith('/orders/order123', { replace: true });
  });
  
  test('hiển thị lỗi khi nhập thiếu thông tin', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });
    
    // Để trống form và submit
    userEvent.click(screen.getByText('Place Order'));
    
    // Kiểm tra hiển thị lỗi
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();
      expect(screen.getByText('City is required')).toBeInTheDocument();
      expect(screen.getByText('Phone is required')).toBeInTheDocument();
    });
  });
}); 