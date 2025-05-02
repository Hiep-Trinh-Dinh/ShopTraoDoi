import io from 'socket.io-client';

const socketConfig = {
  getSocket: () => {
    const socket = io(process.env.NODE_ENV === 'production' 
      ? '/' 
      : 'http://localhost:5000', 
      {
        path: process.env.NODE_ENV === 'production' ? '/socket.io' : undefined,
        transports: ['websocket', 'polling']
      }
    );
    return socket;
  }
};

export default socketConfig;
