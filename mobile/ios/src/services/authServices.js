/**
 * Authentication Services
 * Handles user authentication, token management, and session persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: '@hockey_live_user',
  AUTH_TOKEN: '@hockey_live_token',
  LOGIN_CREDENTIALS: '@hockey_live_credentials'
};

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    this.isInitialized = false;
  }

  /**
   * Initialize auth service - check for stored credentials
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('= Checking for stored user data...');
      
      // Check for stored user data
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      console.log('=ñ Stored user exists:', !!storedUser);
      console.log('<« Stored token exists:', !!storedToken);
      
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.authToken = storedToken;
        apiService.setAuthToken(storedToken);
        
        console.log(' Auth service initialized with stored credentials');
        console.log('=d User:', this.currentUser.full_name);
      } else {
        console.log('9 No stored user data found');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('L Auth initialization failed:', error);
      this.isInitialized = true; // Mark as initialized even if failed
    }
  }

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      console.log('=Ý Registering user:', userData.email);
      
      const response = await apiService.auth.register(userData);
      
      console.log(' Registration successful:', response);
      return response;
    } catch (error) {
      console.error('L Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(email, password, rememberMe = true) {
    try {
      console.log('= Logging in user:', email);
      
      const response = await apiService.auth.login(email, password);
      
      if (response.success === false) {
        throw new Error(response.message || 'Login failed');
      }

      // Check if we have valid user data
      if (!response.user || !response.access_token) {
        console.error('L Invalid login response data');
        console.log('=d Received user data:', {
          email: response.user?.email,
          id: response.user?.id,
          name: response.user?.full_name
        });
        console.log('<« Received token length:', response.access_token?.length);
        throw new Error('Invalid login response data');
      }

      // Store authentication data
      this.currentUser = response.user;
      this.authToken = response.access_token;
      
      // Set token in API service
      apiService.setAuthToken(response.access_token);
      
      // Store in device storage if remember me is enabled
      if (rememberMe) {
        await this.storeAuthData(response.user, response.access_token);
      }
      
      console.log(' Login successful and data stored');
      return response;
    } catch (error) {
      console.error('L Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      console.log('=K Logging out user...');
      
      // Call logout API if we have a token
      if (this.authToken) {
        try {
          await apiService.auth.logout(this.authToken);
        } catch (error) {
          console.warn('  Logout API call failed, continuing with local logout:', error);
        }
      }
      
      // Clear local data
      await this.clearAuthData();
      
      console.log(' Logout successful');
    } catch (error) {
      console.error('L Logout failed:', error);
      // Even if logout fails, clear local data
      await this.clearAuthData();
      throw error;
    }
  }

  /**
   * Store authentication data in device storage
   */
  async storeAuthData(user, token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      console.log('=¾ Auth data stored successfully');
    } catch (error) {
      console.error('L Failed to store auth data:', error);
    }
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.LOGIN_CREDENTIALS
      ]);
      
      this.currentUser = null;
      this.authToken = null;
      apiService.clearAuthToken();
      
      console.log('=Ñ Auth data cleared');
    } catch (error) {
      console.error('L Failed to clear auth data:', error);
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!(this.currentUser && this.authToken);
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current auth token
   */
  getAuthToken() {
    return this.authToken;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      console.log('= Refreshing auth token...');
      
      if (!this.authToken) {
        throw new Error('No token to refresh');
      }
      
      const response = await apiService.auth.refreshToken(this.authToken);
      
      if (response.access_token) {
        this.authToken = response.access_token;
        apiService.setAuthToken(response.access_token);
        
        // Update stored token
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
        
        console.log(' Token refreshed successfully');
        return response;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('L Token refresh failed:', error);
      
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    try {
      console.log('=Ý Updating user profile...');
      
      const response = await apiService.users.updateProfile(userData);
      
      if (response.user) {
        this.currentUser = { ...this.currentUser, ...response.user };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));
      }
      
      console.log(' Profile updated successfully');
      return response;
    } catch (error) {
      console.error('L Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Handle API authentication errors
   */
  async handleAuthError(error) {
    if (error.status === 401) {
      console.log('= Authentication error - attempting token refresh...');
      
      try {
        await this.refreshToken();
        return true; // Token refreshed successfully
      } catch (refreshError) {
        console.log('L Token refresh failed - logging out user');
        await this.logout();
        return false; // Need to login again
      }
    }
    
    return false; // Not an auth error
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;