/**
 * API Service for Hockey Live App
 * Handles all communication with the FastAPI backend
 */

// We'll create the config directly in this file for now
const API_CONFIG = {
  base_url: "http://10.0.0.18:8000/api/v1",
  timeout: 30000
};

class ApiService {
  constructor() {
    this.baseURL = "http://10.0.0.18:8000/api/v1";
    this.timeout = 30000;
    this.authToken = null;
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
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
      timeout: this.timeout,
      headers: this.getHeaders(options.headers),
      ...options
    };

    try {
      console.log(`=� API Request: ${options.method || 'GET'} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`=� API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP Error: ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error(`L API Error: ${error.message}`);
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Network error', 0, { originalError: error });
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
   * File upload with multipart/form-data
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      }
    });
  }

  // =================
  // API Endpoints
  // =================

  /**
   * Health check - Test backend connection
   */
  async healthCheck() {
    return this.makeRequest('/health', { method: 'GET' });
  }

  /**
   * Authentication endpoints
   */
  auth = {
    register: async (userData) => {
      return this.post('/auth/register', userData);
    },

    login: async (email, password) => {
      return this.post('/auth/login', { email, password });
    },

    logout: async () => {
      const result = await this.post('/auth/logout');
      this.clearAuthToken();
      return result;
    },

    refreshToken: async (refreshToken) => {
      return this.post('/auth/refresh', { refresh_token: refreshToken });
    },

    forgotPassword: async (email) => {
      return this.post('/auth/forgot-password', { email });
    },

    resetPassword: async (token, newPassword) => {
      return this.post('/auth/reset-password', { token, new_password: newPassword });
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
    create: async (teamData) => {
      return this.post('/teams', teamData);
    },

    get: async (teamId) => {
      return this.get(`/teams/${teamId}`);
    },

    update: async (teamId, teamData) => {
      return this.put(`/teams/${teamId}`, teamData);
    },

    delete: async (teamId) => {
      return this.delete(`/teams/${teamId}`);
    },

    getRoster: async (teamId) => {
      return this.get(`/teams/${teamId}/roster`);
    },

    addPlayer: async (teamId, playerData) => {
      return this.post(`/teams/${teamId}/roster`, playerData);
    },

    updatePlayer: async (teamId, playerId, playerData) => {
      return this.put(`/teams/${teamId}/roster/${playerId}`, playerData);
    },

    removePlayer: async (teamId, playerId) => {
      return this.delete(`/teams/${teamId}/roster/${playerId}`);
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
    },

    getParticipants: async (gameId) => {
      return this.get(`/games/${gameId}/participants`);
    }
  };

  /**
   * Arena configuration endpoints
   */
  arena = {
    getTypes: async () => {
      return this.get('/arena/types');
    },

    getPositions: async (arenaType) => {
      return this.get(`/arena/${arenaType}/positions`);
    },

    validatePosition: async (arenaType, positionData) => {
      return this.post(`/arena/${arenaType}/validate`, positionData);
    },

    getGuidance: async (arenaType, position) => {
      return this.get(`/arena/${arenaType}/guidance`, { position });
    }
  };

  /**
   * Video processing endpoints
   */
  videos = {
    get: async (videoId) => {
      return this.get(`/videos/${videoId}`);
    },

    getGameVideos: async (gameId) => {
      return this.get(`/videos/game/${gameId}`);
    },

    getDownloadUrl: async (videoId) => {
      return this.get(`/videos/${videoId}/download`);
    },

    getStreamUrl: async (videoId) => {
      return this.get(`/videos/${videoId}/stream`);
    },

    delete: async (videoId) => {
      return this.delete(`/videos/${videoId}`);
    },

    share: async (videoId, shareData) => {
      return this.post(`/videos/${videoId}/share`, shareData);
    }
  };

  /**
   * Streaming endpoints
   */
  streaming = {
    start: async (sessionData) => {
      return this.post('/streaming/start', sessionData);
    },

    stop: async (sessionId) => {
      return this.post('/streaming/stop', { session_id: sessionId });
    },

    getStatus: async (sessionId) => {
      return this.get(`/streaming/${sessionId}/status`);
    },

    uploadChunk: async (sessionId, chunkData) => {
      return this.uploadFile(`/streaming/${sessionId}/chunk`, chunkData);
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