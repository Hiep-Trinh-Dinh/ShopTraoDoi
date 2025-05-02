import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VerifyEmail from '../VerifyEmail';

// Mock useSearchParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams('token=valid-token')]
}));

// Mock API
global.fetch = jest.fn();

describe('VerifyEmail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('xác thực email thành công', async () => {
    // Mock response xác thực thành công
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Email verified successfully'
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <VerifyEmail />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra loading state ban đầu
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
    
    // Đợi phản hồi thành công
    await waitFor(() => {
      expect(screen.getByText('Email verified successfully')).toBeInTheDocument();
    });
    
    // Kiểm tra link đăng nhập hiển thị
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
  });
  
  test('xác thực email thất bại', async () => {
    // Mock response xác thực thất bại
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        message: 'Invalid or expired token'
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <VerifyEmail />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra loading state ban đầu
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
    
    // Đợi phản hồi thất bại
    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });
    
    // Kiểm tra không hiển thị link đăng nhập
    expect(screen.queryByText('Login to your account')).not.toBeInTheDocument();
  });
  
  test('xử lý khi không có token', async () => {
    // Override mock để trả về empty URLSearchParams
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockImplementation(() => [new URLSearchParams('')]);
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <VerifyEmail />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('No verification token found')).toBeInTheDocument();
    });
  });
}); 