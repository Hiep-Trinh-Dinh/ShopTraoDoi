import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { RoomProvider } from '../../context/RoomContext';
import CreateRoom from '../CreateRoom';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API
global.fetch = jest.fn();

describe('CreateRoom Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch products của user
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'product1', 
            name: 'Product 1', 
            price: 100,
            image: 'product1.jpg'
          },
          { 
            _id: 'product2', 
            name: 'Product 2', 
            price: 150,
            image: 'product2.jpg'
          }
        ]
      })
    });
  });
  
  test('hiển thị form tạo phòng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <CreateRoom />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Create Trading Room')).toBeInTheDocument();
    });
    
    // Kiểm tra form
    expect(screen.getByLabelText('Room Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Select Product')).toBeInTheDocument();
    
    // Kiểm tra sản phẩm
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });
  
  test('tạo phòng thành công', async () => {
    // Mock create room API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'new-room',
          title: 'Test Room',
          description: 'Test Description',
          product: {
            _id: 'product1',
            name: 'Product 1'
          }
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <CreateRoom />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Create Trading Room')).toBeInTheDocument();
    });
    
    // Điền form
    userEvent.type(screen.getByLabelText('Room Title'), 'Test Room');
    userEvent.type(screen.getByLabelText('Description'), 'Test Description');
    
    // Chọn sản phẩm
    const productCards = screen.getAllByTestId('product-card');
    userEvent.click(productCards[0]);
    
    // Submit form
    userEvent.click(screen.getByText('Create Room'));
    
    // Kiểm tra API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rooms',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Room')
        })
      );
    });
    
    // Kiểm tra chuyển hướng
    expect(mockNavigate).toHaveBeenCalledWith('/room/detail/new-room');
  });
  
  test('hiển thị lỗi khi không chọn sản phẩm', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <CreateRoom />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Create Trading Room')).toBeInTheDocument();
    });
    
    // Điền thiếu thông tin
    userEvent.type(screen.getByLabelText('Room Title'), 'Test Room');
    
    // Submit form mà không chọn sản phẩm
    userEvent.click(screen.getByText('Create Room'));
    
    // Kiểm tra thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText('Please select a product')).toBeInTheDocument();
    });
  });
  
  test('hiển thị thông báo khi không có sản phẩm', async () => {
    // Mock không có sản phẩm
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: []
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <CreateRoom />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Create Trading Room')).toBeInTheDocument();
    });
    
    // Kiểm tra thông báo
    expect(screen.getByText('You have no products to trade. Please add a product first.')).toBeInTheDocument();
  });
}); 