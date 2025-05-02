import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { RoomProvider } from '../../context/RoomContext';
import Room from '../Room';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API
global.fetch = jest.fn();

describe('Room Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch rooms
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'room1', 
            title: 'Trading Room 1',
            product: {
              name: 'Product 1',
              price: 100,
              image: 'product1.jpg'
            },
            seller: {
              _id: 'user1',
              name: 'Seller 1'
            },
            status: 'active',
            createdAt: '2023-06-01T10:00:00Z'
          },
          { 
            _id: 'room2', 
            title: 'Trading Room 2',
            product: {
              name: 'Product 2',
              price: 150,
              image: 'product2.jpg'
            },
            seller: {
              _id: 'user2',
              name: 'Seller 2'
            },
            status: 'active',
            createdAt: '2023-06-02T11:00:00Z'
          }
        ]
      })
    });
  });
  
  test('hiển thị danh sách phòng trao đổi', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <Room />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải danh sách
    await waitFor(() => {
      expect(screen.getByText('Trading Rooms')).toBeInTheDocument();
    });
    
    // Kiểm tra thông tin phòng
    expect(screen.getByText('Trading Room 1')).toBeInTheDocument();
    expect(screen.getByText('Trading Room 2')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Seller 1')).toBeInTheDocument();
    expect(screen.getByText('Seller 2')).toBeInTheDocument();
  });
  
  test('chuyển đến trang tạo phòng', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <Room />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Trading Rooms')).toBeInTheDocument();
    });
    
    // Click nút tạo phòng
    userEvent.click(screen.getByText('Create New Room'));
    
    // Kiểm tra chuyển hướng
    expect(mockNavigate).toHaveBeenCalledWith('/room/create');
  });
  
  test('vào phòng trao đổi', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <Room />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Trading Rooms')).toBeInTheDocument();
    });
    
    // Click nút tham gia phòng đầu tiên
    const joinButtons = screen.getAllByText('Join Room');
    userEvent.click(joinButtons[0]);
    
    // Kiểm tra chuyển hướng
    expect(mockNavigate).toHaveBeenCalledWith('/room/detail/room1');
  });
  
  test('lọc phòng theo trạng thái', async () => {
    // Mock fetch with filter
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          { 
            _id: 'room1', 
            title: 'Trading Room 1',
            product: {
              name: 'Product 1',
              price: 100,
              image: 'product1.jpg'
            },
            seller: {
              _id: 'user1',
              name: 'Seller 1'
            },
            status: 'active',
            createdAt: '2023-06-01T10:00:00Z'
          }
        ]
      })
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoomProvider>
            <Room />
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Đợi tải dữ liệu
    await waitFor(() => {
      expect(screen.getByText('Trading Rooms')).toBeInTheDocument();
    });
    
    // Chọn filter status
    const filterSelect = screen.getByLabelText('Filter by Status');
    userEvent.selectOptions(filterSelect, 'active');
    
    // Đợi API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rooms?status=active'),
        expect.any(Object)
      );
    });
    
    // Kiểm tra kết quả lọc
    expect(screen.getByText('Trading Room 1')).toBeInTheDocument();
    expect(screen.queryByText('Trading Room 2')).not.toBeInTheDocument();
  });
}); 