import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Register from '../Register';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API
global.fetch = jest.fn();

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('hiển thị form đăng ký', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra tiêu đề
    expect(screen.getByText('Register')).toBeInTheDocument();
    
    // Kiểm tra các trường
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    
    // Kiểm tra nút đăng ký
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    
    // Kiểm tra link đăng nhập
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Login here')).toBeInTheDocument();
  });
  
  test('đăng ký thành công', async () => {
    // Mock response đăng ký thành công
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Registration successful. Please verify your email.'
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Điền form
    userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'Password123');
    userEvent.type(screen.getByLabelText('Confirm Password'), 'Password123');
    
    // Submit form
    userEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com')
        })
      );
    });
    
    // Kiểm tra thông báo thành công
    await waitFor(() => {
      expect(screen.getByText('Registration successful. Please verify your email.')).toBeInTheDocument();
    });
    
    // Kiểm tra chuyển hướng sau khi đăng ký
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
  
  test('hiển thị lỗi khi password không khớp', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Điền form với password không khớp
    userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'Password123');
    userEvent.type(screen.getByLabelText('Confirm Password'), 'DifferentPassword');
    
    // Submit form
    userEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
  
  test('hiển thị lỗi khi email đã tồn tại', async () => {
    // Mock response email đã tồn tại
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        message: 'Email already exists'
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Điền form
    userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
    userEvent.type(screen.getByLabelText('Password'), 'Password123');
    userEvent.type(screen.getByLabelText('Confirm Password'), 'Password123');
    
    // Submit form
    userEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });
}); 