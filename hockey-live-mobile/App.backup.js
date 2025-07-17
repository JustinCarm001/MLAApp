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
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API service handles all backend communication

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  // Teams state
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Form states - moved to top level to avoid conditional hooks
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [league, setLeague] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [homeArena, setHomeArena] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');

  useEffect(() => {
    checkBackendConnection();
    loadStoredUser();
  }, []);

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
            setUser(userData);
            setAuthToken(storedToken);
            setIsLoggedIn(true);
            setCurrentScreen('home');
            
            console.log('✅ Auto-login successful');
            await loadUserTeams();
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

  // Helper function to clear form fields
  const clearFormFields = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setTeamName('');
    setLeague('');
    setAgeGroup('');
    setHomeArena('');
    setTeamCode('');
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('');
    setShowAddPlayer(false);
  };


  // Authentication functions using the proper API service
  const handleLogin = async (email, password) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      // Import and use the API service
      const apiService = await import('./src/services/api.js').then(m => m.default);
      
      console.log('🔐 Attempting login with API service...');
      const response = await apiService.auth.login(email, password);
      
      console.log('🔍 Full API response:', JSON.stringify(response, null, 2));
      
      // Extract user and token from response
      const userData = response.user;
      const token = response.access_token;
      
      console.log('👤 Received user data:', { 
        email: userData?.email, 
        id: userData?.id, 
        name: userData?.full_name 
      });
      console.log('🎫 Received token length:', token?.length);
      
      // Validate response data
      if (!userData || !token) {
        console.error('❌ Invalid login response data');
        Alert.alert('Error', 'Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }
      
      // Set auth token in API service
      apiService.setAuthToken(token);
      
      setUser(userData);
      setAuthToken(token);
      setIsLoggedIn(true);
      setCurrentScreen('home');
      
      // Store user data for persistence
      const storeSuccess = await storeUserData(userData, token);
      if (!storeSuccess) {
        console.warn('⚠️ Failed to store user data locally');
      }
      
      await loadUserTeams();
      clearFormFields();
      
      console.log('✅ Login process completed successfully');
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.status === 0 || error.isNetworkError) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    }
    
    setLoading(false);
  };

  const handleRegister = async (email, password, fullName) => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Import and use the API service
      const apiService = await import('./src/services/api.js').then(m => m.default);
      
      console.log('📝 Attempting registration with API service...');
      const response = await apiService.auth.register({ 
        email, 
        password, 
        full_name: fullName 
      });
      
      console.log('🔍 Registration response:', JSON.stringify(response, null, 2));
      
      Alert.alert('Success!', 'Account created successfully! Please log in.', [
        { text: 'OK', onPress: () => {
          clearFormFields();
          setCurrentScreen('login');
        }}
      ]);
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.status === 400) {
        errorMessage = 'Email already registered or invalid data. Please check your information.';
      } else if (error.status === 0 || error.isNetworkError) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Registration Failed', errorMessage);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            setUser(null);
            setAuthToken(null);
            setIsLoggedIn(false);
            setCurrentScreen('login');
            setTeams([]);
            setSelectedTeam(null);
            clearFormFields();
            await clearStoredData();
          }
        }
      ]
    );
  };

  // Team management functions
  const loadUserTeams = async () => {
    try {
      const apiService = await import('./src/services/api.js').then(m => m.default);
      const teams = await apiService.users.getTeams();
      setTeams(teams || []);
    } catch (error) {
      console.error('❌ Failed to load teams:', error);
      setTeams([]);
    }
  };

  const createTeam = async (teamData) => {
    if (!teamData.name) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    setLoading(true);
    
    try {
      const apiService = await import('./src/services/api.js').then(m => m.default);
      await apiService.teams.create(teamData);
      
      Alert.alert('Success!', 'Team created successfully!');
      await loadUserTeams();
      clearFormFields();
      setCurrentScreen('teams');
    } catch (error) {
      console.error('❌ Team creation failed:', error);
      
      let errorMessage = 'Failed to create team. Please try again.';
      if (error.isNetworkError) {
        errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
    
    setLoading(false);
  };

  const joinTeam = async (teamCode) => {
    setLoading(true);
    
    try {
      // TODO: Implement team joining with API service
      Alert.alert('Info', 'Team joining functionality will be implemented soon.');
    } catch (error) {
      Alert.alert('Error', 'Failed to join team.');
    }
    
    setLoading(false);
  };

  const addPlayer = async (teamId, playerData) => {
    try {
      // TODO: Implement player management with API service
      Alert.alert('Info', 'Player management functionality will be implemented soon.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add player.');
    }
  };

  // Render Login Screen
  const renderLoginScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
        
        <View style={styles.authHeader}>
          <Text style={styles.authTitle}>🏒 Hockey Live</Text>
          <Text style={styles.authSubtitle}>Professional Game Recording</Text>
        </View>

        <ScrollView style={styles.authContent}>
          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>Welcome Back!</Text>
            <Text style={styles.authCardSubtitle}>Sign in to access your teams</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.authButton, styles.primaryButton]}
              onPress={() => handleLogin(email, password)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => {
                clearFormFields();
                setCurrentScreen('register');
              }}
            >
              <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Render Register Screen
  const renderRegisterScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
        
        <View style={styles.authHeader}>
          <Text style={styles.authTitle}>🏒 Hockey Live</Text>
          <Text style={styles.authSubtitle}>Join the Community</Text>
        </View>

        <ScrollView style={styles.authContent}>
          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>Create Account</Text>
            <Text style={styles.authCardSubtitle}>Start recording amazing games</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.authButton, styles.primaryButton]}
              onPress={() => handleRegister(email, password, fullName)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => {
                clearFormFields();
                setCurrentScreen('login');
              }}
            >
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Render Home Screen (after login)
  const renderHomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>🏒 Hockey Live</Text>
          <Text style={styles.userWelcome}>Welcome back, {user?.full_name || 'User'}!</Text>
        </View>
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.quickStatsCard}>
          <Text style={styles.statsTitle}>Your Hockey Hub</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{teams.length}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Games Recorded</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]} 
            onPress={() => setCurrentScreen('teams')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🏒</Text>
              <View>
                <Text style={styles.buttonTitle}>My Teams</Text>
                <Text style={styles.buttonSubtitle}>Manage your hockey teams</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryAction]} 
            onPress={() => setCurrentScreen('create-team')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>➕</Text>
              <View>
                <Text style={styles.buttonTitle}>Create Team</Text>
                <Text style={styles.buttonSubtitle}>Start a new hockey team</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.tertiaryAction]} 
            onPress={() => setCurrentScreen('join-team')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🔗</Text>
              <View>
                <Text style={styles.buttonTitle}>Join Team</Text>
                <Text style={styles.buttonSubtitle}>Enter a team code</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Render Teams List Screen
  const renderTeamsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.simpleHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.simpleTitle}>My Teams</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('create-team')}>
          <Text style={styles.headerAction}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {teams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>🏒 No teams yet</Text>
            <Text style={styles.emptyStateSubtext}>Create or join your first team to get started!</Text>
          </View>
        ) : (
          teams.map((team) => (
            <TouchableOpacity 
              key={team.id} 
              style={styles.teamCard}
              onPress={() => {
                setSelectedTeam(team);
                setCurrentScreen('team-detail');
              }}
            >
              <View style={styles.teamHeader}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamBadge}>{team.role}</Text>
              </View>
              <Text style={styles.teamInfo}>League: {team.league || 'Not set'}</Text>
              <Text style={styles.teamInfo}>Age Group: {team.age_group || 'Not set'}</Text>
              <Text style={styles.teamInfo}>Players: {team.players?.length || 0}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // Render Create Team Screen
  const renderCreateTeamScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.simpleTitle}>Create Team</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Team Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Team Name *</Text>
              <TextInput
                style={styles.textInput}
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter team name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>League</Text>
              <TextInput
                style={styles.textInput}
                value={league}
                onChangeText={setLeague}
                placeholder="e.g., Metro Hockey League"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age Group</Text>
              <TextInput
                style={styles.textInput}
                value={ageGroup}
                onChangeText={setAgeGroup}
                placeholder="e.g., U16, Bantam, Midget"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Home Arena</Text>
              <TextInput
                style={styles.textInput}
                value={homeArena}
                onChangeText={setHomeArena}
                placeholder="Enter home arena name"
              />
            </View>

            <TouchableOpacity 
              style={[styles.authButton, styles.primaryButton]}
              onPress={() => createTeam({
                name: teamName,
                league: league,
                age_group: ageGroup,
                home_arena: homeArena
              })}
              disabled={loading || !teamName}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authButtonText}>Create Team</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Render Join Team Screen
  const renderJoinTeamScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.simpleTitle}>Join Team</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Join Existing Team</Text>
            <Text style={styles.formSubtitle}>Enter the team code provided by your team manager</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Team Code</Text>
              <TextInput
                style={[styles.textInput, styles.teamCodeInput]}
                value={teamCode}
                onChangeText={setTeamCode}
                placeholder="Enter 6-digit team code"
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            <TouchableOpacity 
              style={[styles.authButton, styles.primaryButton]}
              onPress={() => joinTeam(teamCode)}
              disabled={loading || teamCode.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authButtonText}>Join Team</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Render Team Detail Screen
  const renderTeamDetailScreen = () => {
    const handleAddPlayer = () => {
      if (!playerName || !playerNumber) {
        Alert.alert('Error', 'Please enter player name and number');
        return;
      }

      addPlayer(selectedTeam.id, {
        name: playerName,
        number: parseInt(playerNumber),
        position: playerPosition
      });

      setPlayerName('');
      setPlayerNumber('');
      setPlayerPosition('');
      setShowAddPlayer(false);
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('teams')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.simpleTitle}>{selectedTeam?.name}</Text>
          <TouchableOpacity onPress={() => setShowAddPlayer(true)}>
            <Text style={styles.headerAction}>+ Player</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Team Info Card */}
          <View style={styles.teamInfoCard}>
            <Text style={styles.teamDetailName}>{selectedTeam?.name}</Text>
            <Text style={styles.teamDetailInfo}>League: {selectedTeam?.league || 'Not set'}</Text>
            <Text style={styles.teamDetailInfo}>Age Group: {selectedTeam?.age_group || 'Not set'}</Text>
            <Text style={styles.teamDetailInfo}>Home Arena: {selectedTeam?.home_arena || 'Not set'}</Text>
            <Text style={styles.teamDetailInfo}>Team Code: {selectedTeam?.team_code || 'N/A'}</Text>
          </View>

          {/* Players Section */}
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Players ({selectedTeam?.players?.length || 0})</Text>
            
            {(!selectedTeam?.players || selectedTeam.players.length === 0) ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>🏒 No players yet</Text>
                <Text style={styles.emptyStateSubtext}>Add your first player to get started!</Text>
              </View>
            ) : (
              selectedTeam.players.map((player, index) => (
                <View key={index} style={styles.playerCard}>
                  <View style={styles.playerNumber}>
                    <Text style={styles.playerNumberText}>#{player.number}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerPosition}>{player.position || 'Position not set'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add Player Modal */}
        <Modal visible={showAddPlayer} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Player</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Player Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Enter player name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Jersey Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={playerNumber}
                  onChangeText={setPlayerNumber}
                  placeholder="Enter jersey number"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Position</Text>
                <TextInput
                  style={styles.textInput}
                  value={playerPosition}
                  onChangeText={setPlayerPosition}
                  placeholder="e.g., Forward, Defense, Goalie"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddPlayer(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAddPlayer}
                >
                  <Text style={styles.confirmButtonText}>Add Player</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  // Main render logic
  if (!isLoggedIn) {
    switch (currentScreen) {
      case 'register':
        return renderRegisterScreen();
      default:
        return renderLoginScreen();
    }
  }

  // Logged in screens
  switch (currentScreen) {
    case 'teams':
      return renderTeamsScreen();
    case 'create-team':
      return renderCreateTeamScreen();
    case 'join-team':
      return renderJoinTeamScreen();
    case 'team-detail':
      return renderTeamDetailScreen();
    default:
      return renderHomeScreen();
  }
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  // Authentication Styles
  authHeader: {
    backgroundColor: '#1B365D',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#B8D4F0',
  },
  authContent: {
    flex: 1,
    padding: 20,
  },
  authCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  authCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    textAlign: 'center',
    marginBottom: 8,
  },
  authCardSubtitle: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FAFBFC',
  },
  authButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#1B365D',
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
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
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },

  // Content Styles
  content: {
    flex: 1,
    padding: 20,
  },
  quickStatsCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  statLabel: {
    fontSize: 14,
    color: '#5A6C7D',
    marginTop: 5,
  },

  // Action Buttons
  actionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 15,
  },
  actionButton: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryAction: {
    backgroundColor: '#2E7D32',
  },
  secondaryAction: {
    backgroundColor: '#1976D2',
  },
  tertiaryAction: {
    backgroundColor: '#F57C00',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 20,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Navigation
  simpleHeader: {
    backgroundColor: '#1B365D',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  simpleTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerAction: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Teams
  teamCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    flex: 1,
  },
  teamBadge: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamInfo: {
    fontSize: 14,
    color: '#5A6C7D',
    marginBottom: 4,
  },

  // Forms
  formCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    marginBottom: 25,
  },
  teamCodeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
  },

  // Team Detail
  teamInfoCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  teamDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 15,
    textAlign: 'center',
  },
  teamDetailInfo: {
    fontSize: 16,
    color: '#5A6C7D',
    marginBottom: 8,
  },

  // Players
  playersSection: {
    marginBottom: 20,
  },
  playerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  playerNumber: {
    backgroundColor: '#1B365D',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  playerNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 14,
    color: '#5A6C7D',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  confirmButton: {
    backgroundColor: '#1B365D',
  },
  cancelButtonText: {
    color: '#5A6C7D',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5A6C7D',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#8A9BA8',
    textAlign: 'center',
  },
});