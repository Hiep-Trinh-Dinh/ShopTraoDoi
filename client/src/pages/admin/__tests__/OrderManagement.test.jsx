import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import OrderManagement from '../OrderManagement';

// Mock API
global.fetch = jest.fn();

// Mock AlertDialog
jest.mock('../../../components/AlertDialog', () => {
  return {
    __esModule: true,
    default: ({ isOpen, onClose, onConfirm, title }) => (
      isOpen ? (
        <div data-testid="alert-dialog">
          <h2>{title}</h2>
          <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      ) : null
    )
  };
});

describe('OrderManagement Component', () => {
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
            user: { name: 'User 1', email: 'user1@example.com' },
            total: 200,
            status: 'pending',
            createdAt: '2023-06-01T10:00:00Z',
            items: [
              { product: { name: 'Product 1' }, quantity: 2, price: 100 }
            ]
          },
          { 
            _id: 'order2', 
            user: { name: 'User 2', email: 'user2@example.com' },
            total: 150,
            status: 'processing',
            createdAt: '2023-06-02T11:00:00Z',
            items: [
              { product: { name: 'Product 2' }, quantity: 1, price: 150 }
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
          <OrderManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách đơn hàng
    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin đơn hàng
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.getByText('200 đ')).toBeInTheDocument();
    expect(screen.getByText('150 đ')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
  });
  
  test('cập nhật trạng thái đơn hàng', async () => {
    // Mock cập nhật đơn hàng
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'order1',
          status: 'processing'
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <OrderManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách đơn hàng
    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });
    
    // Mở dropdown trạng thái đơn hàng đầu tiên
    const statusSelects = screen.getAllByRole('combobox');
    userEvent.click(statusSelects[0]);
    
    // Chọn trạng thái mới
    userEvent.selectOptions(statusSelects[0], 'processing');
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/orders/order1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('processing')
        })
      );
    });
  });
  
  test('lọc đơn hàng theo trạng thái', async () => {
    // Mock fetch với filter
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'order1', 
            user: { name: 'User 1', email: 'user1@example.com' },
            total: 200,
            status: 'pending',
            createdAt: '2023-06-01T10:00:00Z',
            items: [
              { product: { name: 'Product 1' }, quantity: 2, price: 100 }
            ]
          }
        ]
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <OrderManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách đơn hàng
    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });
    
    // Chọn filter status
    const filterSelect = screen.getByLabelText('Filter by Status');
    userEvent.selectOptions(filterSelect, 'pending');
    
    // Đợi API được gọi lại
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/orders?status=pending'),
        expect.any(Object)
      );
    });
    
    // Kiểm tra kết quả lọc
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.queryByText('User 2')).not.toBeInTheDocument();
  });
}); 