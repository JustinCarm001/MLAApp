/**
 * AuthNavigator - Authentication Flow Navigation
 * Handles navigation between login, signup, and forgot password screens
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// Import auth screens
import LoginScreen from '../Screens/auth/LoginScreen';
import SignupScreen from '../Screens/auth/SignupScreen';
import ForgotPasswordScreen from '../Screens/auth/ForgotPasswordScreen';

const AuthNavigator = ({ onLogin }) => {
  const [currentScreen, setCurrentScreen] = useState('Login');

  // Navigation object to pass to screens
  const navigation = {
    navigate: (screenName, params) => {
      console.log(`📱 Navigating to: ${screenName}`, params);
      setCurrentScreen(screenName);
    },
    goBack: () => {
      setCurrentScreen('Login'); // Default back to login
    }
  };

  // Handle successful login
  const handleLoginSuccess = async (response) => {
    try {
      console.log('✅ Login success in AuthNavigator:', response);
      
      if (response.user && response.access_token) {
        // Call the parent onLogin handler
        await onLogin(response.user, response.access_token);
      } else {
        console.error('❌ Invalid login response in AuthNavigator');
      }
    } catch (error) {
      console.error('❌ Error handling login success:', error);
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return (
          <LoginScreen 
            navigation={navigation}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'Signup':
        return (
          <SignupScreen 
            navigation={navigation}
          />
        );
      case 'ForgotPassword':
        return (
          <ForgotPasswordScreen 
            navigation={navigation}
          />
        );
      default:
        return (
          <LoginScreen 
            navigation={navigation}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AuthNavigator;