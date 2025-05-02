import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import Dashboard from '../Dashboard';

// Mock Outlet
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: jest.fn(() => <div data-testid="outlet-content">Outlet Content</div>)
}));

describe('Dashboard Component', () => {
  test('renders dashboard layout with sidebar and content area', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra sidebar
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    
    // Kiểm tra content area
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });
  
  test('sidebar links navigate to correct routes', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Kiểm tra các link
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/admin/products');
    expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/admin/orders');
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/admin/users');
  });
}); 