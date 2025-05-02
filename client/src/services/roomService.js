// client/src/services/roomService.js
import API_BASE_URL from '../utils/apiConfig';

export const getRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

class RoomService {
  async createRoom(roomData) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create room');
      }
      
      return data.data;
    } catch (error) {
      console.error('Room service error:', error);
      throw error;
    }
  }

  async findRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProductInfo(roomId, productInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/product-info`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productInfo })
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async depositPayment(roomId, amount) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyProduct(roomId, verificationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationData)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async confirmTransaction(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/confirm`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(roomId, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error updating role:', data.message);
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async updateRoomStatus(roomId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error updating room status:', data.message);
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  }
}

export default new RoomService(); 