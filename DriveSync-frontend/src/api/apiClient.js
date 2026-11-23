import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // API Gateway URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;