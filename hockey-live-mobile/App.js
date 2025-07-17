/**
 * Hockey Live App - Multi-Camera Hockey Game Recording
 * Professional game coverage using multiple parent phones as cameras
 */

import React from 'react';
import { StatusBar, Platform } from 'react-native';

// Import providers and main navigator
import { AuthProvider } from './src/context/AuthContext';
import { TeamProvider } from './src/context/TeamContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <StatusBar 
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
          backgroundColor="#1B365D"
          translucent={false}
        />
        <AppNavigator />
      </TeamProvider>
    </AuthProvider>
  );
}
