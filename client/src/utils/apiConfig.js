// Sử dụng URL tương đối trong production, localhost trong development
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : '/api';

export default API_BASE_URL;
