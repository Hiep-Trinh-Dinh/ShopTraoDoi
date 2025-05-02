import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../CartContext';

// Component để test context
const TestComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  
  return (
    <div>
      <div data-testid="cart-count">{cart.length}</div>
      <button onClick={() => addToCart({ _id: '1', name: 'Test Product', price: 100, quantity: 1 })}>
        Add Item
      </button>
      <button onClick={() => removeFromCart('1')}>Remove Item</button>
      <button onClick={() => updateQuantity('1', 5)}>Update Quantity</button>
      <button onClick={clearCart}>Clear Cart</button>
      <ul>
        {cart.map(item => (
          <li key={item._id} data-testid={`cart-item-${item._id}`}>
            {item.name} - {item.quantity} x {item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  test('giỏ hàng ban đầu trống', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });
  
  test('thêm sản phẩm vào giỏ hàng', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    userEvent.click(screen.getByText('Add Item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Test Product - 1 x 100');
    });
  });
  
  test('cập nhật số lượng sản phẩm', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Thêm sản phẩm trước
    userEvent.click(screen.getByText('Add Item'));
    
    // Cập nhật số lượng
    userEvent.click(screen.getByText('Update Quantity'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Test Product - 5 x 100');
    });
  });
});
