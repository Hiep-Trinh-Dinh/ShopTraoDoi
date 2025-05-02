import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';

// Mock sản phẩm để test
const mockProduct = {
  _id: '123456',
  name: 'PlayStation 5',
  price: 15000000,
  image: 'ps5.jpg',
  category: 'Electronics'
};

// Wrapper để cung cấp Router cho component
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProductCard Component', () => {
  test('hiển thị thông tin sản phẩm chính xác', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
    expect(screen.getByText('15000000 đ')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    // Kiểm tra hình ảnh
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('ps5.jpg'));
  });
  
  test('chuyển hướng đến trang chi tiết khi click', async () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/products/${mockProduct._id}`);
  });
});
