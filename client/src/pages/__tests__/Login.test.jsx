import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API
global.fetch = jest.fn();

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('hiển thị form đăng nhập', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra tiêu đề
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    // Kiểm tra các trường
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Kiểm tra nút đăng nhập
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    
    // Kiểm tra link đăng ký
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });
  
  test('đăng nhập thành công', async () => {
    // Mock response đăng nhập thành công
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          user: {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'fake-token'
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Điền form
    userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit form
    userEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com')
        })
      );
    });
    
    // Kiểm tra chuyển hướng sau khi đăng nhập
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  
  test('hiển thị lỗi khi đăng nhập thất bại', async () => {
    // Mock response đăng nhập thất bại
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        message: 'Invalid email or password'
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Điền form
    userEvent.type(screen.getByLabelText('Email'), 'wrong@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    // Submit form
    userEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
  
  test('hiển thị lỗi khi điền thiếu thông tin', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Submit form mà không điền thông tin
    userEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
}); 