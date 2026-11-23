// =============================================================
//  Shared Axios instance
//  - Every request goes to the API GATEWAY (port 5000), never to 5004/5005.
//  - The JWT from Member 1's login is attached automatically.
//  - Errors are turned into one readable message (getErrorMessage).
// =============================================================
import axios from 'axios';
import { API_BASE_URL } from '../config/appConfig';
import { getToken, logout } from '../utils/auth';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Before each request: add "Authorization: Bearer <token>"
httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After each response: if the token is invalid/expired, send the user to login
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      logout();
      window.location.assign('/login?session=expired');
    }
    return Promise.reject(error);
  }
);

/** Turn any Axios error into a message a user can understand */
export const getErrorMessage = (error) => {
  if (error?.isMock) return error.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (!error?.response) {
    return `Cannot reach the API Gateway (${API_BASE_URL}). Make sure the gateway and services are running.`;
  }
  const { data, status } = error.response;
  if (data?.errors?.length) {
    // Validation errors from the backend: show the first two
    return data.errors.slice(0, 2).map((e) => e.message).join(' • ');
  }
  if (status === 404 && !data?.message) return 'The requested resource or route was not found (check the gateway routing).';
  return data?.message || `Request failed (HTTP ${status})`;
};

export default httpClient;
