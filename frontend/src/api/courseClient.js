import axios from 'axios';

const courseClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

courseClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduflex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

courseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('eduflex_token');
      localStorage.removeItem('eduflex_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default courseClient;