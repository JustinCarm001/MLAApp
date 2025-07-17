/**
 * API Service for Hockey Live App - Correct Platform Detection
 * Uses localhost for web browser, 10.0.0.18 for mobile devices
 */

import { Platform } from 'react-native';

class ApiService {
  constructor() {
    this.timeout = 90000; // 1.5 minutes
    this.authToken = null;
    
    // Correct platform detection and URL assignment
    if (Platform.OS === 'web') {
      // Web version runs in browser - use localhost
      this.baseURL = "http://localhost:8000/api/v1";
      console.log('🌐 Web Platform Detected - Using localhost');
    } else {
      // Mobile version (iOS/Android) - use network IP for phone communication
      this.baseURL = "http://10.0.0.18:8000/api/v1";
      console.log('📱 Mobile Platform Detected - Using network IP');
    }
    
    console.log(`📡 Base URL: ${this.baseURL}`);
    console.log(`⏰ Timeout: ${this.timeout / 1000} seconds`);
  }

  /**
   * Test backend connection
   */
  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      const healthUrl = this.baseURL.replace('/api/v1', '/health');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Health check timeout');
        controller.abort();
      }, 10000); // 10 second timeout for health check
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
        return true;
      } else {
        console.log('⚠️ Backend responded but not healthy:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token) {
    this.authToken = token;
    console.log(`🎫 Auth token set: ${token ? token.substring(0, 10) + '...' : 'null'}`);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    console.log('🚫 Clearing auth token');
    this.authToken = null;
  }

  /**
   * Get default headers for API requests
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request to API
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(options.headers),
      ...options
    };

    // Test connection first for authentication requests
    if (options.method === 'POST' && (endpoint.includes('register') || endpoint.includes('login'))) {
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new ApiError('Cannot connect to server. Please check if the backend is running on port 8000.', 0);
      }
    }

    try {
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
      console.log(`📤 Request data:`, options.body ? JSON.parse(options.body) : 'No body');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout reached, aborting...');
        controller.abort();
      }, this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      // Get response text first
      const responseText = await response.text();
      console.log(`📥 Response body:`, responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));

      // Try to parse as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new ApiError('Invalid response format from server', response.status);
      }

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new ApiError(
          data.message || data.detail || `HTTP Error: ${response.status}`,
          response.status,
          data
        );
      }

      console.log(`✅ API Success:`, data);
      return data;

    } catch (error) {
      console.error(`❌ API Error: ${error.message}`);
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout - server is taking too long to respond. Please try again.', 408);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      if (error.message.includes('Network request failed') || 
          error.message.includes('fetch') || 
          error.message.includes('Failed to fetch')) {
        
        const platformHelp = Platform.OS === 'web' 
          ? 'Make sure backend is running on localhost:8000' 
          : 'Make sure your phone and computer are on the same WiFi network';
          
        throw new ApiError(`Cannot connect to server. ${platformHelp}`, 0, { originalError: error });
      }
      
      throw new ApiError(`Unexpected error: ${error.message}`, 0, { originalError: error });
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.makeRequest(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.makeRequest(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Authentication endpoints
   */
  auth = {
    register: async (userData) => {
      console.log('📝 Registering user:', { email: userData.email, full_name: userData.full_name });
      return this.post('/auth/register', userData);
    },

    login: async (email, password) => {
      console.log('🔐 Logging in user:', { email });
      return this.post('/auth/login', { email, password });
    },

    logout: async () => {
      console.log('👋 Logging out user');
      try {
        const result = await this.post('/auth/logout', { token: this.authToken });
        this.clearAuthToken();
        return result;
      } catch (error) {
        // Clear token even if logout API fails
        this.clearAuthToken();
        throw error;
      }
    },

    refreshToken: async (refreshToken) => {
      return this.post('/auth/refresh', { refresh_token: refreshToken });
    }
  };

  /**
   * User management endpoints
   */
  users = {
    getProfile: async () => {
      return this.get('/users/me');
    },

    updateProfile: async (userData) => {
      return this.put('/users/me', userData);
    },

    getTeams: async () => {
      return this.get('/users/me/teams');
    }
  };

  /**
   * Team management endpoints
   */
  teams = {
    getMyTeams: async () => {
      return this.get('/teams/my-teams');
    },

    create: async (teamData) => {
      return this.post('/teams', teamData);
    },

    get: async (teamId) => {
      return this.get(`/teams/${teamId}`);
    },

    join: async (teamCode) => {
      return this.post('/teams/join', { team_code: teamCode });
    },

    addPlayer: async (teamId, playerData) => {
      return this.post(`/teams/${teamId}/players`, playerData);
    }
  };

  /**
   * Game session endpoints
   */
  games = {
    create: async (gameData) => {
      return this.post('/games', gameData);
    },

    get: async (gameId) => {
      return this.get(`/games/${gameId}`);
    },

    join: async (gameId) => {
      return this.post(`/games/${gameId}/join`);
    },

    joinByCode: async (gameCode) => {
      return this.get(`/games/join/${gameCode}`);
    },

    leave: async (gameId) => {
      return this.post(`/games/${gameId}/leave`);
    },

    start: async (gameId) => {
      return this.post(`/games/${gameId}/start`);
    },

    stop: async (gameId) => {
      return this.post(`/games/${gameId}/stop`);
    }
  };
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status = 0, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
export { ApiError };