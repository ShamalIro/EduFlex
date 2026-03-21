import axios from 'axios';

// Create axios instance with UserService base URL
const client = axios.create({
  baseURL: 'http://localhost:4001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add JWT token to request headers if it exists
 */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduflex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle response errors globally
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized - clear token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('eduflex_token');
      localStorage.removeItem('eduflex_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
