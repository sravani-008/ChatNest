const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getToken() {
    return localStorage.getItem('chatnest_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('chatnest_token', token);
    } else {
      localStorage.removeItem('chatnest_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        const error = new Error(
          data?.error?.message || `Request failed with status ${response.status}`
        );
        error.code = data?.error?.code || 'REQUEST_FAILED';
        error.status = response.status;
        throw error;
      }

      return data.data;
    } catch (err) {
      // Re-throw with consistent structure
      if (!err.code) {
        err.code = 'NETWORK_ERROR';
        err.message = err.message || 'Network connection error. Is the server running?';
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
