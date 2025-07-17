/**
 * AuthContext - Authentication State Management
 * Manages user authentication state, login/logout flows, and token management
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  token: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  RESTORE_SESSION: 'RESTORE_SESSION',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app start
  useEffect(() => {
    restoreSession();
  }, []);

  // Restore session from storage
  const restoreSession = async () => {
    try {
      console.log('🔄 Restoring authentication session...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        
        // Set token in API service
        apiService.setAuthToken(storedToken);
        
        // Validate token by fetching user profile
        try {
          const userProfile = await apiService.users.getProfile();
          
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: {
              user: userProfile,
              token: storedToken,
            },
          });
          
          console.log('✅ Session restored successfully');
        } catch (error) {
          console.warn('⚠️ Stored token is invalid, clearing session');
          await clearStoredSession();
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        console.log('📝 No stored session found');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('❌ Error restoring session:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Starting login process...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await apiService.auth.login(email, password);
      
      if (response.user && response.access_token) {
        // Set token in API service
        apiService.setAuthToken(response.access_token);
        
        // Store session
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token),
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user)),
        ]);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.access_token,
          },
        });

        console.log('✅ Login successful');
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Starting registration process...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await apiService.auth.register(userData);
      
      if (response.user && response.access_token) {
        // Set token in API service
        apiService.setAuthToken(response.access_token);
        
        // Store session
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token),
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user)),
        ]);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.access_token,
          },
        });

        console.log('✅ Registration successful');
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('👋 Starting logout process...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // Call logout API
      try {
        await apiService.auth.logout();
      } catch (error) {
        console.warn('⚠️ Logout API call failed:', error);
      }

      // Clear stored session
      await clearStoredSession();

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local session even if API fails
      await clearStoredSession();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear stored session
  const clearStoredSession = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
      apiService.clearAuthToken();
    } catch (error) {
      console.error('❌ Error clearing stored session:', error);
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      console.log('👤 Updating user profile...');
      const updatedUser = await apiService.users.updateProfile(userData);
      
      // Update stored user
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: updatedUser,
      });

      console.log('✅ User profile updated');
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;