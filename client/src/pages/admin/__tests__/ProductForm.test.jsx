import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import ProductForm from '../ProductForm';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'product-123' })
}));

// Mock API
global.fetch = jest.fn();

describe('ProductForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch product (for edit mode)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'product-123',
          name: 'Test Product',
          description: 'This is a test product',
          price: 100,
          category: 'Electronics',
          stock: 20,
          image: 'product.jpg'
        }
      })
    });
    
    // Mock categories
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { _id: 'cat1', name: 'Electronics' },
          { _id: 'cat2', name: 'Clothing' },
          { _id: 'cat3', name: 'Books' }
        ]
      })
    });
  });
  
  test('loads and displays product data in edit mode', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByLabelText('Product Name')).toHaveValue('Test Product');
    });
    
    // Kiểm tra các trường được điền với dữ liệu sản phẩm
    expect(screen.getByLabelText('Description')).toHaveValue('This is a test product');
    expect(screen.getByLabelText('Price')).toHaveValue(100);
    expect(screen.getByLabelText('Stock')).toHaveValue(20);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    
    // Kiểm tra tiêu đề form
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });
  
  test('submits updated product data', async () => {
    // Mock submit API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'product-123',
          name: 'Updated Product',
          description: 'Updated description',
          price: 150,
          category: 'Electronics',
          stock: 25,
          image: 'product.jpg'
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByLabelText('Product Name')).toHaveValue('Test Product');
    });
    
    // Cập nhật các trường
    userEvent.clear(screen.getByLabelText('Product Name'));
    userEvent.type(screen.getByLabelText('Product Name'), 'Updated Product');
    
    userEvent.clear(screen.getByLabelText('Description'));
    userEvent.type(screen.getByLabelText('Description'), 'Updated description');
    
    userEvent.clear(screen.getByLabelText('Price'));
    userEvent.type(screen.getByLabelText('Price'), '150');
    
    userEvent.clear(screen.getByLabelText('Stock'));
    userEvent.type(screen.getByLabelText('Stock'), '25');
    
    // Submit form
    userEvent.click(screen.getByText('Save Product'));
    
    // Kiểm tra API được gọi với dữ liệu đúng
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/products/product-123',
        expect.objectContaining({
          method: 'PUT',
          body: expect.any(FormData)
        })
      );
    });
    
    // Kiểm tra chuyển hướng
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });
  
  test('shows validation errors for invalid inputs', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByLabelText('Product Name')).toHaveValue('Test Product');
    });
    
    // Xóa dữ liệu các trường bắt buộc
    userEvent.clear(screen.getByLabelText('Product Name'));
    userEvent.clear(screen.getByLabelText('Price'));
    
    // Submit form
    userEvent.click(screen.getByText('Save Product'));
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('Product name is required')).toBeInTheDocument();
      expect(screen.getByText('Price is required')).toBeInTheDocument();
    });
  });
}); 