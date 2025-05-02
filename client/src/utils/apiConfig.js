const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // Sử dụng relative path khi deploy
  : 'http://localhost:5000/api'; // Sử dụng localhost khi dev

export default API_BASE_URL;
