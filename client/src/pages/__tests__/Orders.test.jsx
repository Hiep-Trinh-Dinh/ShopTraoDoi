import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Orders from '../Orders';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API
global.fetch = jest.fn();

describe('Orders Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch orders
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'order1', 
            total: 200,
            status: 'delivered',
            createdAt: '2023-06-01T10:00:00Z',
            items: [
              { product: { name: 'Product 1' }, quantity: 2 }
            ]
          },
          { 
            _id: 'order2', 
            total: 150,
            status: 'processing',
            createdAt: '2023-06-02T11:00:00Z',
            items: [
              { product: { name: 'Product 2' }, quantity: 1 }
            ]
          },
          { 
            _id: 'order3', 
            total: 300,
            status: 'pending',
            createdAt: '2023-06-03T12:00:00Z',
            items: [
              { product: { name: 'Product 3' }, quantity: 3 }
            ]
          }
        ]
      })
    });
  });
  
  test('hiển thị danh sách đơn hàng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải đơn hàng
    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin đơn hàng
    expect(screen.getByText('Order #order1')).toBeInTheDocument();
    expect(screen.getByText('Order #order2')).toBeInTheDocument();
    expect(screen.getByText('Order #order3')).toBeInTheDocument();
    
    expect(screen.getByText('200 đ')).toBeInTheDocument();
    expect(screen.getByText('150 đ')).toBeInTheDocument();
    expect(screen.getByText('300 đ')).toBeInTheDocument();
    
    expect(screen.getByText('delivered')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
  
  test('hiển thị thông báo khi không có đơn hàng', async () => {
    // Mock không có đơn hàng
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: []
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument();
    });
    
    // Kiểm tra thông báo không có đơn hàng
    expect(screen.getByText('You have no orders yet.')).toBeInTheDocument();
  });
  
  test('chuyển đến trang chi tiết đơn hàng khi click vào nút View', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải đơn hàng
    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument();
    });
    
    // Click nút View đầu tiên
    const viewButtons = screen.getAllByText('View Details');
    viewButtons[0].click();
    
    // Kiểm tra chuyển hướng
    expect(mockNavigate).toHaveBeenCalledWith('/orders/order1');
  });
}); 