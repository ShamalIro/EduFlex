import axios from 'axios';

// Simple mock client since we don't have a real backend
// In a real app, this would use axios.create()
class ApiClient {
  static instance;
  baseURL = '/api';

  constructor() {}

  static getInstance() {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  getToken() {
    return localStorage.getItem('eduflex_token');
  }

  // Mock generic request handler
  async request(method, url, data) {
    const token = this.getToken();

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mock 401 if token is missing for protected routes (simplified logic)
    if (url.includes('protected') && !token) {
      throw new Error('Unauthorized');
    }

    return {};
  }

  async get(url) {
    return this.request('GET', url);
  }

  async post(url, data) {
    return this.request('POST', url, data);
  }

  async put(url, data) {
    return this.request('PUT', url, data);
  }

  async delete(url) {
    return this.request('DELETE', url);
  }
}

export const apiClient = ApiClient.getInstance();
