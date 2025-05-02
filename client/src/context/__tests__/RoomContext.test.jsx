import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomProvider, useRoom } from '../../context/RoomContext';

// Component để test context
const TestComponent = () => {
  const { rooms, loading, error, createRoom } = useRoom();
  
  return (
    <div>
      <button onClick={() => createRoom({ productDetails: 'Test Room', price: 100 })}>
        Create Room
      </button>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="rooms-count">{rooms.length}</div>
      <ul>
        {rooms.map(room => (
          <li key={room.id} data-testid={`room-${room.id}`}>
            {room.productDetails}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Mock fetch
global.fetch = jest.fn();

describe('RoomContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('trạng thái ban đầu đúng', () => {
    render(
      <RoomProvider>
        <TestComponent />
      </RoomProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    expect(screen.getByTestId('rooms-count')).toHaveTextContent('0');
  });
  
  test('tạo phòng thành công', async () => {
    // Mock response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { id: 'ABC123', productDetails: 'Test Room', price: 100, status: 'pending' }
      })
    });
    
    render(
      <RoomProvider>
        <TestComponent />
      </RoomProvider>
    );
    
    // Click nút tạo phòng
    screen.getByText('Create Room').click();
    
    // Kiểm tra fetch được gọi với đúng dữ liệu
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/rooms'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Test Room')
      })
    );
    
    // Đợi phòng được thêm vào state
    await waitFor(() => {
      expect(screen.getByTestId('rooms-count')).toHaveTextContent('1');
      expect(screen.getByTestId('room-ABC123')).toHaveTextContent('Test Room');
    });
  });
  
  test('xử lý lỗi khi tạo phòng thất bại', async () => {
    // Mock fetch thất bại
    global.fetch.mockRejectedValueOnce(new Error('Failed to create room'));
    
    render(
      <RoomProvider>
        <TestComponent />
      </RoomProvider>
    );
    
    // Click nút tạo phòng
    screen.getByText('Create Room').click();
    
    // Kiểm tra hiển thị lỗi
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to create room');
    });
  });
}); 