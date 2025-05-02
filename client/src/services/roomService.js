// client/src/services/roomService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rooms';

class RoomService {
  async createRoom(roomData) {
    try {
      const response = await axios.post(API_URL, roomData);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Room service error:', error);
      throw error;
    }
  }

  async findRoom(roomId) {
    try {
      const response = await axios.get(`${API_URL}/${roomId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProductInfo(roomId, productInfo) {
    try {
      const response = await axios.patch(`${API_URL}/${roomId}/product-info`, {
        productInfo
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async depositPayment(roomId, amount) {
    try {
      const response = await axios.post(`${API_URL}/${roomId}/deposit`, {
        amount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyProduct(roomId, verificationData) {
    try {
      const response = await axios.post(`${API_URL}/${roomId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async confirmTransaction(roomId) {
    try {
      const response = await axios.post(`${API_URL}/${roomId}/confirm`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(roomId, role) {
    try {
      const response = await axios.put(`${API_URL}/${roomId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async updateRoomStatus(roomId, data) {
    try {
      const response = await axios.put(`${API_URL}/${roomId}/status`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  }
}

export default new RoomService(); 