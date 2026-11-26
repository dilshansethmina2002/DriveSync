import axios from 'axios';
import { API_BASE_URL } from '../config/appConfig';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // API Gateway URL (VITE_API_BASE_URL)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
