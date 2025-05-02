import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ProductProvider } from '../../context/ProductContext';
import Products from '../../pages/Products';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock fetch API
global.fetch = jest.fn();

const mockProducts = [
  { _id: '1', name: 'Product 1', price: 100, category: 'Electronics', image: 'image1.jpg' },
  { _id: '2', name: 'Product 2', price: 200, category: 'Clothing', image: 'image2.jpg' }
];

const renderProductsPage = () => {
  return render(
    <BrowserRouter>
      <ProductProvider>
        <Products />
      </ProductProvider>
    </BrowserRouter>
  );
};

describe('Products Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockProducts
      })
    });
  });
  
  test('hiển thị danh sách sản phẩm', async () => {
    renderProductsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
  
  test('lọc sản phẩm theo danh mục', async () => {
    renderProductsPage();
    
    // Chờ sản phẩm hiển thị
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // Giả lập fetch khi lọc
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [mockProducts[0]] // Chỉ trả về sản phẩm đầu tiên
      })
    });
    
    // Chọn danh mục Electronics
    const categorySelect = screen.getByLabelText(/Danh mục/i);
    userEvent.selectOptions(categorySelect, 'Electronics');
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
    });
  });
}); 