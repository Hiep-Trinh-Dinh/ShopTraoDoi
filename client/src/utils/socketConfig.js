const socketConfig = {
  getSocket: (path = '') => {
    let socketUrl;
    
    if (import.meta.env.DEV) {
      // Môi trường development
      socketUrl = `ws://localhost:5000${path}`;
    } else {
      // Môi trường production - sử dụng URL tương đối
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socketUrl = `${protocol}//${window.location.host}${path}`;
    }
    
    return new WebSocket(socketUrl);
  }
};

export default socketConfig;
