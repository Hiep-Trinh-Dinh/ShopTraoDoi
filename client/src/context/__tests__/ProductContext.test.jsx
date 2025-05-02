import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { ProductProvider, useProducts } from '../../context/ProductContext';

// Mock fetch API
global.fetch = jest.fn();

// Component để test context
const TestComponent = () => {
  const { products, loading, error, fetchProducts } = useProducts();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="products-count">{products.length}</div>
      <button onClick={() => fetchProducts()}>Fetch Products</button>
      <ul>
        {products.map(product => (
          <li key={product._id} data-testid={`product-${product._id}`}>
            {product.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('ProductContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('trạng thái ban đầu đúng', () => {
    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    expect(screen.getByTestId('products-count')).toHaveTextContent('0');
  });
  
  test('fetchProducts thành công', async () => {
    // Mock response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { _id: '1', name: 'Product 1', price: 100 },
          { _id: '2', name: 'Product 2', price: 200 }
        ]
      })
    });
    
    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );
    
    // Click nút fetch
    screen.getByText('Fetch Products').click();
    
    // Kiểm tra fetch được gọi
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/products'));
    
    // Đợi fetch hoàn tất
    await waitFor(() => {
      expect(screen.getByTestId('products-count')).toHaveTextContent('2');
      expect(screen.getByTestId('product-1')).toHaveTextContent('Product 1');
      expect(screen.getByTestId('product-2')).toHaveTextContent('Product 2');
    });
  });
  
  test('xử lý lỗi khi fetch thất bại', async () => {
    // Mock fetch thất bại
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));
    
    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );
    
    // Click nút fetch
    screen.getByText('Fetch Products').click();
    
    // Đợi hiện lỗi
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network Error');
    });
  });
}); 