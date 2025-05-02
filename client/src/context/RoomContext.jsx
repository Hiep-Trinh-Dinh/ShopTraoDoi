import React, { createContext, useContext, useState } from 'react';
import { roomService } from '../services/roomService';
import API_BASE_URL from '../utils/apiConfig';

const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... các hàm xử lý như đã định nghĩa trước ...

  const value = {
    currentRoom,
    loading,
    error,
    createRoom,
    findRoom,
    updateProductInfo,
    depositPayment,
    verifyProduct,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}; 