/**
 * PlayerManagementScreen - Add/Edit player interface
 * Allows team creators to add new players or edit existing ones
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useTeam } from '../../context/TeamContext';

const PlayerManagementScreen = ({ navigation, route }) => {
  const { team, player, mode = 'add' } = route.params || {};
  const { addPlayer, playersLoading, playersError, clearPlayersError } = useTeam();
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const positions = [
    'Forward',
    'Defense',
    'Goalie',
    'Center',
    'Left Wing',
    'Right Wing',
    'Left Defense',
    'Right Defense',
  ];

  useEffect(() => {
    if (mode === 'edit' && player) {
      setFormData({
        name: player.name || '',
        number: player.number?.toString() || '',
        position: player.position || '',
      });
    }
  }, [mode, player]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Player name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Player name must be at least 2 characters';
    }

    // Number validation
    if (!formData.number.trim()) {
      newErrors.number = 'Jersey number is required';
    } else {
      const number = parseInt(formData.number);
      if (isNaN(number) || number < 1 || number > 99) {
        newErrors.number = 'Jersey number must be between 1 and 99';
      } else {
        // Check if number is already taken (excluding current player in edit mode)
        const existingPlayer = team.players?.find(p => 
          p.number === number && (mode === 'add' || p.name !== player?.name)
        );
        if (existingPlayer) {
          newErrors.number = `Jersey number ${number} is already taken by ${existingPlayer.name}`;
        }
      }
    }

    // Position validation (optional but if provided, must be valid)
    if (formData.position && !positions.includes(formData.position)) {
      newErrors.position = 'Please select a valid position';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log(`🏒 ${mode === 'add' ? 'Adding' : 'Updating'} player:`, formData);

    try {
      if (mode === 'add') {
        const playerData = {
          name: formData.name.trim(),
          number: parseInt(formData.number),
          position: formData.position.trim() || null,
        };

        await addPlayer(team.id, playerData);
        
        Alert.alert(
          'Player Added!',
          `${formData.name} has been added to ${team.name}.`,
          [
            {
              text: 'Add Another',
              onPress: () => {
                setFormData({ name: '', number: '', position: '' });
                setErrors({});
              }
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        // TODO: Implement player editing
        Alert.alert(
          'Coming Soon',
          'Player editing functionality will be available soon.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error(`❌ Error ${mode === 'add' ? 'adding' : 'updating'} player:`, error);
      Alert.alert(
        'Error',
        error.message || `Failed to ${mode === 'add' ? 'add' : 'update'} player. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const renderPositionPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>Position (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.positionScroll}>
        <TouchableOpacity
          style={[
            styles.positionOption,
            !formData.position && styles.positionSelected
          ]}
          onPress={() => updateFormData('position', '')}
        >
          <Text style={[
            styles.positionText,
            !formData.position && styles.positionTextSelected
          ]}>
            None
          </Text>
        </TouchableOpacity>
        {positions.map((position) => (
          <TouchableOpacity
            key={position}
            style={[
              styles.positionOption,
              formData.position === position && styles.positionSelected
            ]}
            onPress={() => updateFormData('position', position)}
          >
            <Text style={[
              styles.positionText,
              formData.position === position && styles.positionTextSelected
            ]}>
              {position}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add Player' : 'Edit Player'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Team Info */}
          <View style={styles.teamInfo}>
            <Text style={styles.teamInfoTitle}>Adding to Team</Text>
            <Text style={styles.teamInfoName}>{team?.name}</Text>
            <Text style={styles.teamInfoDetails}>
              {team?.league || 'No League'} • {team?.age_group || 'No Age Group'}
            </Text>
          </View>

          {/* Player Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Player Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Player Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                placeholder="Enter player's full name"
                maxLength={100}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Jersey Number *</Text>
              <TextInput
                style={[styles.textInput, styles.numberInput, errors.number && styles.inputError]}
                value={formData.number}
                onChangeText={(value) => updateFormData('number', value)}
                placeholder="1-99"
                keyboardType="numeric"
                maxLength={2}
              />
              {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
            </View>

            {renderPositionPicker()}
          </View>

          {/* Current Roster Preview */}
          {team?.players && team.players.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Roster</Text>
              <View style={styles.rosterPreview}>
                {team.players.map((existingPlayer, index) => (
                  <View key={index} style={styles.rosterItem}>
                    <Text style={styles.rosterPlayerName}>{existingPlayer.name}</Text>
                    <Text style={styles.rosterPlayerInfo}>
                      #{existingPlayer.number} • {existingPlayer.position || 'No Position'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Error Display */}
          {playersError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{playersError}</Text>
              <TouchableOpacity 
                style={styles.clearErrorButton}
                onPress={clearPlayersError}
              >
                <Text style={styles.clearErrorText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (loading || playersLoading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || playersLoading}
          >
            {loading || playersLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'add' ? 'Add Player' : 'Update Player'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Extra space at bottom */}
          <View style={{ height: 50 }} />
        </ScrollView>
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
  },
  
  // Team Info
  teamInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamInfoTitle: {
    fontSize: 12,
    color: '#5A6C7D',
    marginBottom: 5,
  },
  teamInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 3,
  },
  teamInfoDetails: {
    fontSize: 14,
    color: '#5A6C7D',
  },

  // Sections
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 15,
  },

  // Form Inputs
  inputContainer: {
    marginBottom: 20,
  },
  label: {
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
    backgroundColor: 'white',
  },
  numberInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
  },

  // Position Picker
  pickerContainer: {
    marginBottom: 20,
  },
  positionScroll: {
    marginTop: 5,
  },
  positionOption: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  positionSelected: {
    backgroundColor: '#1B365D',
    borderColor: '#1B365D',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
  },
  positionTextSelected: {
    color: 'white',
  },

  // Roster Preview
  rosterPreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rosterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  rosterPlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
    flex: 1,
  },
  rosterPlayerInfo: {
    fontSize: 12,
    color: '#5A6C7D',
  },

  // Error Container
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Submit Button
  submitButton: {
    backgroundColor: '#1B365D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlayerManagementScreen;