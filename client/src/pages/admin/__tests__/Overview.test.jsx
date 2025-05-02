import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import Overview from '../Overview';

// Mock API
global.fetch = jest.fn();

describe('Overview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock các dữ liệu thống kê
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          totalUsers: 120,
          totalProducts: 85,
          totalOrders: 210,
          totalRevenue: 2500000,
          recentOrders: [
            { 
              _id: 'order1', 
              user: { name: 'User 1' },
              total: 150000,
              status: 'completed',
              createdAt: '2023-06-10T10:00:00Z'
            },
            { 
              _id: 'order2', 
              user: { name: 'User 2' },
              total: 200000,
              status: 'processing',
              createdAt: '2023-06-11T11:00:00Z'
            }
          ],
          topProducts: [
            { _id: 'product1', name: 'Product 1', sales: 25 },
            { _id: 'product2', name: 'Product 2', sales: 18 }
          ],
          monthlySales: [
            { month: 'Jan', revenue: 180000 },
            { month: 'Feb', revenue: 220000 },
            { month: 'Mar', revenue: 250000 }
          ]
        }
      })
    });
  });
  
  test('hiển thị thống kê tổng quan', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Overview />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });
    
    // Kiểm tra các thống kê tổng quan
    expect(screen.getByText('120')).toBeInTheDocument(); // Total users
    expect(screen.getByText('85')).toBeInTheDocument(); // Total products
    expect(screen.getByText('210')).toBeInTheDocument(); // Total orders
    expect(screen.getByText('2,500,000 đ')).toBeInTheDocument(); // Total revenue
  });
  
  test('hiển thị đơn hàng gần đây', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Overview />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin đơn hàng gần đây
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.getByText('150,000 đ')).toBeInTheDocument();
    expect(screen.getByText('200,000 đ')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
  });
  
  test('hiển thị sản phẩm bán chạy', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Overview />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Top Selling Products')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin sản phẩm bán chạy
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('25 sales')).toBeInTheDocument();
    expect(screen.getByText('18 sales')).toBeInTheDocument();
  });
}); 