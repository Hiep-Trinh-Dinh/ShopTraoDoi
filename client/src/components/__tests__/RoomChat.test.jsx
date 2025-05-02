import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomChat from '../RoomChat';

// Mock WebSocket
class MockWebSocket {
  constructor() {
    this.onmessage = jest.fn();
    this.onopen = jest.fn();
    this.onclose = jest.fn();
    this.onerror = jest.fn();
  }
  
  send = jest.fn();
  close = jest.fn();
}

// Mock fetch API để giả lập tin nhắn
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, text: 'Xin chào', sender: 'user1', timestamp: new Date().toISOString() },
      { id: 2, text: 'Chào bạn', sender: 'user2', timestamp: new Date().toISOString() }
    ])
  })
);

global.WebSocket = MockWebSocket;

describe('RoomChat Component', () => {
  const mockProps = {
    roomId: 'ABC123',
    user: { id: 'user1', name: 'Test User' }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('kết nối WebSocket khi component được mount', async () => {
    render(<RoomChat {...mockProps} />);
    
    // Kiểm tra fetch messages được gọi
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(mockProps.roomId));
    
    // Đợi hiển thị tin nhắn
    await waitFor(() => {
      expect(screen.getByText('Xin chào')).toBeInTheDocument();
      expect(screen.getByText('Chào bạn')).toBeInTheDocument();
    });
  });
  
  test('hiển thị form gửi tin nhắn', () => {
    render(<RoomChat {...mockProps} />);
    
    expect(screen.getByPlaceholderText(/Nhập tin nhắn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gửi/i })).toBeInTheDocument();
  });
});
