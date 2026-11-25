import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // API Gateway URL
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
