/**
 * AuthNavigator - Authentication Flow Navigation
 * Handles navigation between login, signup, and forgot password screens using React Navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F5F7FA' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Login',
        }}
      />
      
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{
          title: 'Sign Up',
        }}
      />
      
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;