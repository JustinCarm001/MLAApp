/**
 * Hockey Live App - Main Application Component
 * 
 * This is the root component that sets up navigation and authentication flow
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Text
} from 'react-native';

// Import navigation components
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';

// Import auth service (temporarily disabled for testing)
// import authService from './services/authServices';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth service and check for existing login
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Hockey Live App...');
      
      // For now, skip the auth service initialization to test basic flow
      console.log('ℹ️ Skipping auth service for now - going to login screen');
      
      // Always start with login screen for testing
      setIsAuthenticated(false);
      setCurrentUser(null);
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData, token) => {
    try {
      console.log('🔐 Login successful, updating app state...');
      setCurrentUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Failed to handle login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Logging out...');
      // await authService.logout(); // Disabled for testing
      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Even if logout fails, clear the UI state
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading Hockey Live App...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Render appropriate navigator based on auth state */}
      {isAuthenticated ? (
        <AppNavigator 
          user={currentUser} 
          onLogout={handleLogout}
        />
      ) : (
        <AuthNavigator 
          onLogin={handleLogin}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default App;