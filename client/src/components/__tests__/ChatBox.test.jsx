import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatBox from '../ChatBox';

// Mock API calls
global.fetch = jest.fn();

describe('ChatBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ẩn chatbox ban đầu và hiển thị khi click', () => {
    render(<ChatBox />);
    
    // ChatBox ban đầu ở trạng thái ẩn
    expect(screen.queryByText('Trợ lý ShopTraoDoi')).not.toBeInTheDocument();
    
    // Click để hiển thị chatbox
    userEvent.click(screen.getByLabelText('Toggle chat'));
    
    // ChatBox hiển thị với tin nhắn chào mừng
    expect(screen.getByText('Trợ lý ShopTraoDoi')).toBeInTheDocument();
    expect(screen.getByText(/Chào mừng bạn/i)).toBeInTheDocument();
  });
  
  test('gửi tin nhắn và nhận phản hồi', async () => {
    // Mock response từ Gemini API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [
          {
            content: {
              parts: [{ text: 'Tôi có thể giúp gì cho bạn?' }]
            }
          }
        ]
      })
    });
    
    render(<ChatBox />);
    
    // Mở chatbox
    userEvent.click(screen.getByLabelText('Toggle chat'));
    
    // Nhập và gửi tin nhắn
    userEvent.type(screen.getByPlaceholderText(/Nhập tin nhắn/i), 'Làm sao để tạo phòng?');
    userEvent.click(screen.getByRole('button', { name: /Gửi/i }));
    
    // Kiểm tra tin nhắn người dùng đã hiển thị
    expect(screen.getByText('Làm sao để tạo phòng?')).toBeInTheDocument();
    
    // Kiểm tra fetch được gọi
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('gemini'),
      expect.any(Object)
    );
    
    // Đợi phản hồi hiển thị
    await waitFor(() => {
      expect(screen.getByText('Tôi có thể giúp gì cho bạn?')).toBeInTheDocument();
    });
  });
  
  test('xử lý lỗi API và sử dụng fallback', async () => {
    // Mock lỗi API
    global.fetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<ChatBox />);
    
    // Mở chatbox
    userEvent.click(screen.getByLabelText('Toggle chat'));
    
    // Nhập và gửi tin nhắn
    userEvent.type(screen.getByPlaceholderText(/Nhập tin nhắn/i), 'Hướng dẫn trao đổi');
    userEvent.click(screen.getByRole('button', { name: /Gửi/i }));
    
    // Đợi phản hồi fallback hiển thị
    await waitFor(() => {
      expect(screen.getByText(/Quy trình trao đổi/i)).toBeInTheDocument();
    });
  });
}); 