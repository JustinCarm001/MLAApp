/**
 * JoinTeamScreen - Team joining interface
 * Allows users to join teams using a team code
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useTeam } from '../../context/TeamContext';

const JoinTeamScreen = ({ navigation, route }) => {
  const { onTeamJoined } = route.params || {};
  const { joinTeam, loading, error, clearError } = useTeam();
  
  const [teamCode, setTeamCode] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [errors, setErrors] = useState({});

  const validateTeamCode = () => {
    const newErrors = {};

    if (!teamCode.trim()) {
      newErrors.teamCode = 'Team code is required';
    } else if (teamCode.trim().length !== 6) {
      newErrors.teamCode = 'Team code must be 6 characters long';
    } else if (!/^[A-Z0-9]+$/.test(teamCode.trim().toUpperCase())) {
      newErrors.teamCode = 'Team code can only contain letters and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinTeam = async () => {
    if (!validateTeamCode()) {
      return;
    }

    setJoiningTeam(true);
    console.log('🔗 Joining team with code:', teamCode.trim().toUpperCase());

    try {
      const joinedTeam = await joinTeam(teamCode.trim().toUpperCase());
      
      Alert.alert(
        'Successfully Joined Team!',
        `You've joined "${joinedTeam.name}". You can now participate in team activities and view team information.`,
        [
          {
            text: 'View Team',
            onPress: () => {
              if (onTeamJoined) {
                onTeamJoined();
              }
              navigation.navigate('TeamDetail', { team: joinedTeam });
            }
          },
          {
            text: 'Back to Teams',
            onPress: () => {
              if (onTeamJoined) {
                onTeamJoined();
              }
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error joining team:', error);
      
      let errorMessage = 'Failed to join team. Please try again.';
      
      if (error.message.includes('Invalid team code')) {
        errorMessage = 'Invalid team code. Please check the code and try again.';
      } else if (error.message.includes('already a member')) {
        errorMessage = 'You are already a member of this team.';
      }
      
      Alert.alert('Error Joining Team', errorMessage, [{ text: 'OK' }]);
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleCodeChange = (value) => {
    // Auto-uppercase and limit to 6 characters
    const formattedValue = value.toUpperCase().slice(0, 6);
    setTeamCode(formattedValue);
    
    // Clear error when user starts typing
    if (errors.teamCode) {
      setErrors(prev => ({
        ...prev,
        teamCode: null
      }));
    }
    
    // Clear context error
    if (error) {
      clearError();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Team</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsIcon}>🔗</Text>
            <Text style={styles.instructionsTitle}>Join a Hockey Team</Text>
            <Text style={styles.instructionsText}>
              Enter the 6-character team code provided by your coach or team administrator to join the team.
            </Text>
          </View>

          {/* Team Code Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Team Code</Text>
            <TextInput
              style={[styles.teamCodeInput, errors.teamCode && styles.inputError]}
              value={teamCode}
              onChangeText={handleCodeChange}
              placeholder="ABC123"
              placeholderTextColor="#8A9BA8"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              textAlign="center"
            />
            {errors.teamCode && (
              <Text style={styles.errorText}>{errors.teamCode}</Text>
            )}
            
            <Text style={styles.inputHint}>
              Team codes are 6 characters long and contain only letters and numbers
            </Text>
          </View>

          {/* Context Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.clearErrorButton}
                onPress={clearError}
              >
                <Text style={styles.clearErrorText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Join Button */}
          <TouchableOpacity
            style={[styles.joinButton, (joiningTeam || loading) && styles.joinButtonDisabled]}
            onPress={handleJoinTeam}
            disabled={joiningTeam || loading}
          >
            {joiningTeam || loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.joinButtonText}>Join Team</Text>
            )}
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              • Ask your coach or team administrator for the team code
            </Text>
            <Text style={styles.helpText}>
              • Make sure you're entering the code exactly as provided
            </Text>
            <Text style={styles.helpText}>
              • Team codes are case-insensitive but must be exactly 6 characters
            </Text>
          </View>

          {/* Alternative Actions */}
          <View style={styles.alternativeActions}>
            <Text style={styles.alternativeTitle}>Don't have a team code?</Text>
            <TouchableOpacity 
              style={styles.alternativeButton}
              onPress={() => navigation.navigate('CreateTeam')}
            >
              <Text style={styles.alternativeButtonText}>Create Your Own Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  flex1: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: '#1B365D',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },

  // Instructions
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Input Section
  inputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 15,
    textAlign: 'center',
  },
  teamCodeInput: {
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderRadius: 16,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B365D',
    backgroundColor: 'white',
    fontFamily: 'monospace',
    letterSpacing: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  inputHint: {
    fontSize: 12,
    color: '#8A9BA8',
    textAlign: 'center',
    marginTop: 8,
  },

  // Error Display
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
  },
  clearErrorButton: {
    backgroundColor: '#F44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  clearErrorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Join Button
  joinButton: {
    backgroundColor: '#1B365D',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Help Section
  helpSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#5A6C7D',
    marginBottom: 8,
    lineHeight: 20,
  },

  // Alternative Actions
  alternativeActions: {
    alignItems: 'center',
  },
  alternativeTitle: {
    fontSize: 16,
    color: '#5A6C7D',
    marginBottom: 15,
  },
  alternativeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1B365D',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  alternativeButtonText: {
    color: '#1B365D',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JoinTeamScreen;