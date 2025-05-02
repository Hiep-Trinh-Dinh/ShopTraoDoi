import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock fetch API
global.fetch = jest.fn();

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('hiển thị form đăng nhập', () => {
    renderLoginPage();
    
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
  });
  
  test('hiển thị lỗi khi nhập liệu không hợp lệ', async () => {
    renderLoginPage();
    
    // Click nút đăng nhập mà không nhập gì
    userEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Email không được để trống/i)).toBeInTheDocument();
    });
  });
  
  test('đăng nhập thành công và chuyển hướng', async () => {
    // Mock response cho login thành công
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { user: { name: 'Test User' }, token: 'test-token' }
      })
    });
    
    renderLoginPage();
    
    // Nhập thông tin đăng nhập
    userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/Mật khẩu/i), 'password123');
    
    // Click nút đăng nhập
    userEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }));
    
    // Đợi xử lý hoàn tất
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
