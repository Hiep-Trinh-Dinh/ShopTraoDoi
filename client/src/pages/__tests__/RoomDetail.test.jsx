import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { RoomProvider } from '../../context/RoomContext';
import RoomDetail from '../RoomDetail';

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'room123' }),
  useNavigate: () => jest.fn()
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const disconnect = jest.fn();
  
  return jest.fn(() => ({
    emit,
    on,
    disconnect
  }));
});

// Mock API
global.fetch = jest.fn();

describe('RoomDetail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch room
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'room123',
          title: 'Test Trading Room',
          description: 'Room for trading test product',
          product: {
            _id: 'product1',
            name: 'Product 1',
            price: 100,
            image: 'product1.jpg'
          },
          seller: {
            _id: 'seller1',
            name: 'Seller User'
          },
          status: 'active',
          createdAt: '2023-06-01T10:00:00Z'
        }
      })
    });
    
    // Mock fetch messages
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          {
            _id: 'msg1',
            sender: {
              _id: 'seller1',
              name: 'Seller User'
            },
            content: 'Hello, welcome to my trading room',
            createdAt: '2023-06-01T10:05:00Z'
          },
          {
            _id: 'msg2',
            sender: {
              _id: 'buyer1',
              name: 'Buyer User'
            },
            content: 'Hi, I am interested in your product',
            createdAt: '2023-06-01T10:10:00Z'
          }
        ]
      })
    });
  });
  
  test('hiển thị thông tin phòng và tin nhắn', async () => {
    // Mock authentication data
    jest.spyOn(AuthProvider, 'useAuth').mockImplementation(() => ({
      user: { _id: 'buyer1', name: 'Buyer User' },
      isAuthenticated: true
    }));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <RoomDetail />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Test Trading Room')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin phòng
    expect(screen.getByText('Room for trading test product')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('100 đ')).toBeInTheDocument();
    expect(screen.getByText('Seller: Seller User')).toBeInTheDocument();
    
    // Kiểm tra tin nhắn
    expect(screen.getByText('Hello, welcome to my trading room')).toBeInTheDocument();
    expect(screen.getByText('Hi, I am interested in your product')).toBeInTheDocument();
  });
  
  test('gửi tin nhắn mới', async () => {
    // Mock user authentication
    jest.spyOn(AuthProvider, 'useAuth').mockImplementation(() => ({
      user: { _id: 'buyer1', name: 'Buyer User' },
      isAuthenticated: true
    }));
    
    // Mock socket.io-client
    const socketMock = require('socket.io-client')();
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <RoomDetail />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Test Trading Room')).toBeInTheDocument();
    });
    
    // Nhập tin nhắn mới
    userEvent.type(screen.getByPlaceholderText('Type your message...'), 'This is a new message');
    
    // Gửi tin nhắn
    userEvent.click(screen.getByText('Send'));
    
    // Kiểm tra socket.emit được gọi
    expect(socketMock.emit).toHaveBeenCalledWith('sendMessage', expect.objectContaining({
      roomId: 'room123',
      content: 'This is a new message'
    }));
  });
  
  test('đóng phòng trao đổi (chỉ cho người bán)', async () => {
    // Mock user là người bán
    jest.spyOn(AuthProvider, 'useAuth').mockImplementation(() => ({
      user: { _id: 'seller1', name: 'Seller User' },
      isAuthenticated: true
    }));
    
    // Mock close room API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          _id: 'room123',
          status: 'closed'
        }
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <RoomDetail />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Test Trading Room')).toBeInTheDocument();
    });
    
    // Kiểm tra nút đóng phòng hiển thị (chỉ cho người bán)
    expect(screen.getByText('Close Room')).toBeInTheDocument();
    
    // Click nút đóng phòng
    userEvent.click(screen.getByText('Close Room'));
    
    // Xác nhận dialog
    userEvent.click(screen.getByText('Yes, close room'));
    
    // Kiểm tra API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rooms/room123/close',
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });
  });
}); 