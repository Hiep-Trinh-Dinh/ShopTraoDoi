const socketConfig = {
  getSocket: () => {
    let socketUrl;
    if (import.meta.env.VITE_API_BASE_URL === '/api') {
      // Production - relative URL
      socketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    } else {
      // Development
      socketUrl = 'ws://localhost:5000';
    }
    
    return new WebSocket(socketUrl);
  }
};

export default socketConfig;
