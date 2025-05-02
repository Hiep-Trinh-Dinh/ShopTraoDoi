import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import Navbar from '../Navbar';

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('hiển thị logo và các liên kết chính', () => {
    renderNavbar();
    
    // Logo hiển thị
    expect(screen.getByText(/ShopTraoDoi/i)).toBeInTheDocument();
    
    // Các liên kết chính
    expect(screen.getByText(/Trang chủ/i)).toBeInTheDocument();
    expect(screen.getByText(/Sản phẩm/i)).toBeInTheDocument();
  });
  
  test('hiển thị nút đăng nhập khi chưa đăng nhập', () => {
    renderNavbar();
    
    expect(screen.getByText(/Đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByText(/Đăng ký/i)).toBeInTheDocument();
  });
});
