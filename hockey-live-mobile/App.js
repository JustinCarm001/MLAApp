/**
 * Hockey Live App - Multi-Camera Hockey Game Recording
 * Professional game coverage using multiple parent phones as cameras
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import migrated components
import AuthNavigator from './src/navigation/AuthNavigator';
import TeamManagementScreen from './src/screens/teams/TeamManagementScreen';
import CreateTeamScreen from './src/screens/teams/CreateTeamScreen';
import { ArenaPositioningSystem } from './src/config/arena_positioning';
import GameSyncService from './src/services/gameSync';
import apiService from './src/services/api'; // Import API service

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // Navigation state for team management
  const [navigationStack, setNavigationStack] = useState(['home']);
  const [screenParams, setScreenParams] = useState({});
  
  // App services
  const [arenaPositioning, setArenaPositioning] = useState(null);
  const [gameSync, setGameSync] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize app services and check authentication
  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Hockey Live App...');
      
      // Initialize core services
      const positioning = new ArenaPositioningSystem('standard');
      const sync = new GameSyncService();
      
      setArenaPositioning(positioning);
      setGameSync(sync);
      
      // Check backend connection
      await checkBackendConnection();
      
      // Check for stored authentication
      await loadStoredUser();
      
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  };

  // Load stored user data on app start
  const loadStoredUser = async () => {
    try {
      console.log('🔍 Checking for stored user data...');
      
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      console.log('📱 Stored user exists:', !!storedUser);
      console.log('🎫 Stored token exists:', !!storedToken);
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('👤 Parsed user data:', { email: userData.email, id: userData.id });
          
          // Validate parsed data
          if (userData.email && userData.id && storedToken.length > 10) {
            // FIXED: Set auth token in API service for auto-login
            apiService.setAuthToken(storedToken);
            
            setUser(userData);
            setAuthToken(storedToken);
            setIsLoggedIn(true);
            
            console.log('✅ Auto-login successful');
          } else {
            console.warn('⚠️ Invalid stored data, clearing...');
            await clearStoredData();
          }
        } catch (parseError) {
          console.error('❌ Error parsing stored user data:', parseError);
          await clearStoredData();
        }
      } else {
        console.log('ℹ️ No stored user data found');
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
    }
  };

  // Store user data with validation
  const storeUserData = async (userData, token) => {
    try {
      // Validate data before storing
      if (!userData || typeof userData !== 'object') {
        console.error('❌ Invalid user data for storage:', userData);
        return false;
      }
      
      if (!token || typeof token !== 'string') {
        console.error('❌ Invalid token for storage:', token);
        return false;
      }
      
      console.log('💾 Storing user data:', { 
        email: userData.email, 
        id: userData.id,
        tokenLength: token.length 
      });
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', token);
      
      console.log('✅ User data stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error storing user data:', error);
      return false;
    }
  };

  // Clear stored user data
  const clearStoredData = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      apiService.clearAuthToken(); // Clear API service token too
    } catch (error) {
      console.log('Error clearing stored data:', error);
    }
  };

  const checkBackendConnection = async () => {
    try {
      // Health endpoint is at root level, not under /api/v1
      const response = await fetch('http://10.0.0.18:8000/health');
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  // Authentication handler for AuthNavigator
  const handleLogin = async (userData, token) => {
    try {
      console.log('🔐 Processing login from AuthNavigator...');
      console.log('👤 User data:', { email: userData.email, id: userData.id });
      
      // Set auth token in API service
      apiService.setAuthToken(token);
      
      // Update app state
      setUser(userData);
      setAuthToken(token);
      setIsLoggedIn(true);
      setCurrentScreen('home');
      
      // Store user data for persistence
      const storeSuccess = await storeUserData(userData, token);
      if (!storeSuccess) {
        console.warn('⚠️ Failed to store user data locally');
      }
      
      console.log('✅ Login completed successfully');
      
    } catch (error) {
      console.error('❌ Error processing login:', error);
      Alert.alert('Error', 'Failed to complete login process.');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              console.log('👋 Logging out...');
              
              // Clear API service token
              apiService.clearAuthToken();
              
              // Clear app state
              setUser(null);
              setAuthToken(null);
              setIsLoggedIn(false);
              setCurrentScreen('home');
              setNavigationStack(['home']);
              setScreenParams({});
              
              // Clear stored data
              await clearStoredData();
              
              console.log('✅ Logout successful');
            } catch (error) {
              console.error('❌ Logout error:', error);
              // Still clear UI state even if logout API fails
              setUser(null);
              setAuthToken(null);
              setIsLoggedIn(false);
              setCurrentScreen('home');
            }
          }
        }
      ]
    );
  };

  // Simple navigation system
  const navigation = {
    navigate: (screenName, params = {}) => {
      console.log(`📱 Navigating to: ${screenName}`, params);
      setCurrentScreen(screenName);
      setScreenParams(params);
      setNavigationStack(prev => [...prev, screenName]);
    },
    goBack: () => {
      const newStack = [...navigationStack];
      newStack.pop(); // Remove current screen
      const previousScreen = newStack[newStack.length - 1] || 'home';
      setNavigationStack(newStack);
      setCurrentScreen(previousScreen);
      setScreenParams({});
    }
  };

  // Navigation handlers
  const navigateToHome = () => {
    setCurrentScreen('home');
    setNavigationStack(['home']);
    setScreenParams({});
  };

  // Updated handlers
  const handleNewGame = () => {
    Alert.alert(
      'New Game',
      'Choose an option:',
      [
        { text: 'Start Recording', onPress: () => Alert.alert('Feature Coming Soon', 'Start recording functionality will be implemented next!') },
        { text: 'Join Game', onPress: () => Alert.alert('Feature Coming Soon', 'Join game functionality will be implemented next!') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleMyGames = () => {
    Alert.alert('Feature Coming Soon', 'My Recorded Games will show your game history and allow you to download/share videos.');
  };

  // FIXED: Team Management now actually navigates to the screen
  const handleTeamManagement = () => {
    console.log('🏒 Opening Team Management...');
    navigation.navigate('TeamManagement');
  };

  const handleSettings = () => {
    Alert.alert('Feature Coming Soon', 'Settings will include app preferences, notification settings, video quality options, and account management.');
  };

  // Render main home dashboard
  const renderHomeDashboard = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>🏒 Hockey Live</Text>
          <Text style={styles.userWelcome}>Welcome back, {user?.full_name || 'User'}!</Text>
        </View>
        
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Hockey Live Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Record professional multi-camera hockey games</Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Main Actions</Text>
          
          {/* New Game Button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.newGameAction]} 
            onPress={handleNewGame}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🎬</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>New Game</Text>
                <Text style={styles.buttonSubtitle}>Start recording or join a game session</Text>
              </View>
              <Text style={styles.buttonArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* My Recorded Games Button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.myGamesAction]} 
            onPress={handleMyGames}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>📹</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>My Recorded Games</Text>
                <Text style={styles.buttonSubtitle}>View, download, and share your game videos</Text>
              </View>
              <Text style={styles.buttonArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Team Management Button - NOW WORKING! */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.teamManagementAction]} 
            onPress={handleTeamManagement}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>👥</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Team Management</Text>
                <Text style={styles.buttonSubtitle}>Create teams, add players, manage rosters</Text>
              </View>
              <Text style={styles.buttonArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Games Recorded</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Teams Created</Text>
            </View>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusCard, connectionStatus === 'connected' ? styles.statusConnected : styles.statusDisconnected]}>
            <Text style={styles.statusIcon}>
              {connectionStatus === 'connected' ? '✅' : '⚠️'}
            </Text>
            <Text style={styles.statusText}>
              Backend {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Extra space at bottom */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );

  // Screen rendering logic
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'TeamManagement':
        return (
          <TeamManagementScreen 
            navigation={navigation}
            onBack={navigateToHome}
          />
        );
      
      case 'CreateTeam':
        return (
          <CreateTeamScreen 
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
      
      default:
        return renderHomeDashboard();
    }
  };

  // Main render logic
  if (!isLoggedIn) {
    return <AuthNavigator onLogin={handleLogin} />;
  }

  return renderCurrentScreen();
}

// Enhanced Styles (same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#1B365D',
    paddingVertical: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userWelcome: {
    fontSize: 16,
    color: '#B8D4F0',
    marginTop: 4,
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  settingsIcon: {
    fontSize: 20,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Welcome Card
  welcomeCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Sections
  actionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 15,
    marginLeft: 5,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
  },
  newGameAction: {
    borderLeftColor: '#2E7D32',
  },
  myGamesAction: {
    borderLeftColor: '#1976D2',
  },
  teamManagementAction: {
    borderLeftColor: '#F57C00',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#5A6C7D',
    lineHeight: 18,
  },
  buttonArrow: {
    fontSize: 24,
    color: '#5A6C7D',
    marginLeft: 10,
  },

  // Stats Section
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flex: 0.48,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#5A6C7D',
    textAlign: 'center',
  },

  // Status Section
  statusSection: {
    marginBottom: 30,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusConnected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  statusDisconnected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
  },

  // Logout Button
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
