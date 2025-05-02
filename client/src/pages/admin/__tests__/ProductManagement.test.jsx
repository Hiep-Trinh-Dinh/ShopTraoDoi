import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import ProductManagement from '../ProductManagement';

// Mock API
global.fetch = jest.fn();

// Mock AlertDialog
jest.mock('../../../components/AlertDialog', () => {
  return {
    __esModule: true,
    default: ({ isOpen, onClose, onConfirm, title, description }) => (
      isOpen ? (
        <div data-testid="alert-dialog">
          <h2>{title}</h2>
          <p>{description}</p>
          <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      ) : null
    )
  };
});

describe('ProductManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch products
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { _id: '1', name: 'Product 1', price: 100, category: 'Electronics' },
          { _id: '2', name: 'Product 2', price: 200, category: 'Clothing' }
        ]
      })
    });
  });
  
  test('hiển thị danh sách sản phẩm', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi sản phẩm hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
    
    // Kiểm tra các nút action
    expect(screen.getAllByText('Edit').length).toBe(2);
    expect(screen.getAllByText('Delete').length).toBe(2);
  });
  
  test('xóa sản phẩm', async () => {
    // Mock delete API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {}
      })
    });
    
    // Mock fetch sau khi xóa
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { _id: '2', name: 'Product 2', price: 200, category: 'Clothing' }
        ]
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductManagement />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi sản phẩm hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Click nút xóa sản phẩm đầu tiên
    const deleteButtons = screen.getAllByText('Delete');
    userEvent.click(deleteButtons[0]);
    
    // Xác nhận xóa trong dialog
    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    });
    
    userEvent.click(screen.getByTestId('confirm-button'));
    
    // Kiểm tra API xóa được gọi
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
    
    // Kiểm tra danh sách đã cập nhật
    await waitFor(() => {
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
}); 