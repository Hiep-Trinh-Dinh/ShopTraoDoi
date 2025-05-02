import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import FindRoom from '../FindRoom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock fetch API
global.fetch = jest.fn();

const renderFindRoomPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <FindRoom />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('FindRoom Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('hiển thị form tìm phòng', () => {
    renderFindRoomPage();
    
    expect(screen.getByLabelText(/Mã phòng/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tìm phòng/i })).toBeInTheDocument();
  });
  
  test('tìm phòng thành công và chuyển hướng', async () => {
    // Mock response cho tìm phòng thành công
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { id: 'ABC123', productDetails: 'Test Product' }
      })
    });
    
    renderFindRoomPage();
    
    // Nhập mã phòng
    userEvent.type(screen.getByLabelText(/Mã phòng/i), 'ABC123');
    
    // Click nút tìm
    userEvent.click(screen.getByRole('button', { name: /Tìm phòng/i }));
    
    // Đợi xử lý hoàn tất
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/room/ABC123');
    });
  });
  
  test('hiển thị lỗi khi không tìm thấy phòng', async () => {
    // Mock response cho tìm phòng thất bại
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    
    renderFindRoomPage();
    
    // Nhập mã phòng
    userEvent.type(screen.getByLabelText(/Mã phòng/i), 'INVALID');
    
    // Click nút tìm
    userEvent.click(screen.getByRole('button', { name: /Tìm phòng/i }));
    
    // Đợi xử lý hoàn tất
    await waitFor(() => {
      expect(screen.getByText(/Không tìm thấy phòng/i)).toBeInTheDocument();
    });
  });
});
