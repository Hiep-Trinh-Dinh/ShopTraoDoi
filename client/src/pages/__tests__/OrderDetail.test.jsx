import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import OrderDetail from '../OrderDetail';

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'order123' })
}));

// Mock API
global.fetch = jest.fn();

describe('OrderDetail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch order
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'order123',
          total: 450,
          status: 'delivered',
          createdAt: '2023-06-15T10:00:00Z',
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            phone: '1234567890'
          },
          paymentMethod: 'COD',
          items: [
            { 
              product: { 
                _id: 'p1', 
                name: 'Product 1', 
                price: 100, 
                image: 'image1.jpg' 
              }, 
              quantity: 3,
              price: 100
            },
            { 
              product: { 
                _id: 'p2', 
                name: 'Product 2', 
                price: 150, 
                image: 'image2.jpg' 
              }, 
              quantity: 1,
              price: 150
            }
          ]
        }
      })
    });
  });
  
  test('hiển thị chi tiết đơn hàng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <OrderDetail />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Order Details - #order123')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin đơn hàng
    expect(screen.getByText('Order Status: delivered')).toBeInTheDocument();
    expect(screen.getByText('Total: 450 đ')).toBeInTheDocument();
    
    // Kiểm tra thông tin shipping
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, New York')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('COD')).toBeInTheDocument();
    
    // Kiểm tra sản phẩm
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('300 đ')).toBeInTheDocument(); // 100 * 3
    expect(screen.getByText('150 đ')).toBeInTheDocument(); // 150 * 1
  });
  
  test('hiển thị thông báo lỗi khi không tìm thấy đơn hàng', async () => {
    // Mock lỗi
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        message: 'Order not found'
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <OrderDetail />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi phản hồi lỗi
    await waitFor(() => {
      expect(screen.getByText('Error: Order not found')).toBeInTheDocument();
    });
  });
}); 