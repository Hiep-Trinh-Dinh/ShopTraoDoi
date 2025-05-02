import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('hiển thị thông tin liên hệ và copyright', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/ShopTraoDoi/i)).toBeInTheDocument();
    expect(screen.getByText(/Bản quyền/i)).toBeInTheDocument();
    expect(screen.getByText(/Liên hệ/i)).toBeInTheDocument();
  });
  
  test('hiển thị các links hữu ích', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
}); 