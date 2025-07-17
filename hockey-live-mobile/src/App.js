/**
 * App - Main application component
 * Sets up providers and navigation using React Navigation
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './context';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  useEffect(() => {
    console.log('🚀 Hockey Live App starting...');
  }, []);

  return (
    <AppProviders>
      <StatusBar style="light" backgroundColor="#1B365D" />
      <AppNavigator />
    </AppProviders>
  );
};

export default App;