import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

// Mock Navigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: () => <div data-testid="redirect-login">Redirecting to login</div>
}));

// Mock authenticated state
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('ProtectedRoute Component', () => {
  test('chuyển hướng khi chưa đăng nhập', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('redirect-login')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
}); 