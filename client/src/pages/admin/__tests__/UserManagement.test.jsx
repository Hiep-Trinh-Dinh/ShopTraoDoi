import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import UserManagement from '../UserManagement';

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

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch users
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'user1', 
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            isVerified: true,
            createdAt: '2023-05-01T10:00:00Z'
          },
          { 
            _id: 'user2', 
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'admin',
            isVerified: true,
            createdAt: '2023-05-02T11:00:00Z'
          },
          { 
            _id: 'user3', 
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'user',
            isVerified: false,
            createdAt: '2023-05-03T12:00:00Z'
          }
        ]
      })
    });
  });
  
  test('hiển thị danh sách người dùng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <UserManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách users
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin users
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });
  
  test('thay đổi vai trò của người dùng', async () => {
    // Mock update role
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin'
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <UserManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách users
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
    
    // Chọn vai trò mới cho user đầu tiên
    const roleSelects = screen.getAllByLabelText('Role');
    userEvent.selectOptions(roleSelects[0], 'admin');
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/users/user1/role',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('admin')
        })
      );
    });
  });
  
  test('block/unblock người dùng', async () => {
    // Mock block user API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          isBlocked: true
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <UserManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách users
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
    
    // Click nút block đầu tiên
    const blockButtons = screen.getAllByText('Block');
    userEvent.click(blockButtons[0]);
    
    // Xác nhận trong dialog
    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    });
    
    userEvent.click(screen.getByTestId('confirm-button'));
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/users/user1/block',
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });
  });
  
  test('lọc người dùng theo vai trò', async () => {
    // Mock fetch với filter
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'user2', 
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'admin',
            isVerified: true,
            createdAt: '2023-05-02T11:00:00Z'
          }
        ]
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <UserManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách users
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
    
    // Chọn filter role
    const filterSelect = screen.getByLabelText('Filter by Role');
    userEvent.selectOptions(filterSelect, 'admin');
    
    // Đợi API được gọi lại
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users?role=admin'),
        expect.any(Object)
      );
    });
    
    // Kiểm tra kết quả lọc
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
}); 