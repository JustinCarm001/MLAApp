/**
 * CreateTeamScreen - Team creation interface
 * Allows users to create new hockey teams with all details
 */

import React, { useState } from 'react';
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
  Platform
} from 'react-native';

import { useTeam } from '../../context/TeamContext';

const CreateTeamScreen = ({ navigation, route }) => {
  const { onTeamCreated } = route.params || {};
  const { createTeam, loading: teamLoading, error: teamError, clearError } = useTeam();
  
  const [formData, setFormData] = useState({
    name: '',
    league: '',
    age_group: '',
    season: '2024-2025',
    home_arena: '',
    arena_address: '',
    primary_color: '#1B365D',
    secondary_color: '#FFFFFF',
    head_coach_name: '',
    coach_email: '',
    coach_phone: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ageGroups = [
    'U6', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 
    'Junior', 'Adult Rec', 'Adult Competitive'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    }

    if (formData.coach_email && !/\S+@\S+\.\S+/.test(formData.coach_email)) {
      newErrors.coach_email = 'Please enter a valid email address';
    }

    if (formData.coach_phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.coach_phone.replace(/\s|-|\(|\)/g, ''))) {
      newErrors.coach_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log('🏒 Creating team with data:', formData);

    try {
      const newTeam = await createTeam(formData);
      console.log('✅ Team created successfully:', newTeam);

      Alert.alert(
        'Team Created!',
        `${formData.name} has been created successfully!\n\nTeam Code: ${newTeam.team_code}\n\nShare this code with parents and players to join your team.`,
        [
          {
            text: 'View Team',
            onPress: () => {
              if (onTeamCreated) {
                onTeamCreated();
              }
              navigation.navigate('TeamDetail', { team: newTeam });
            }
          },
          {
            text: 'Back to Teams',
            onPress: () => {
              if (onTeamCreated) {
                onTeamCreated();
              }
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating team:', error);
      Alert.alert(
        'Error Creating Team',
        error.message || 'Failed to create team. Please try again.',
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

  const renderAgeGroupPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>Age Group</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageGroupScroll}>
        {ageGroups.map((age) => (
          <TouchableOpacity
            key={age}
            style={[
              styles.ageGroupOption,
              formData.age_group === age && styles.ageGroupSelected
            ]}
            onPress={() => updateFormData('age_group', age)}
          >
            <Text style={[
              styles.ageGroupText,
              formData.age_group === age && styles.ageGroupTextSelected
            ]}>
              {age}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderColorPickers = () => (
    <View style={styles.colorSection}>
      <Text style={styles.sectionTitle}>Team Colors</Text>
      <View style={styles.colorRow}>
        <View style={styles.colorPickerContainer}>
          <Text style={styles.label}>Primary Color</Text>
          <View style={styles.colorPreview}>
            <View style={[styles.colorSwatch, { backgroundColor: formData.primary_color }]} />
            <TextInput
              style={styles.colorInput}
              value={formData.primary_color}
              onChangeText={(value) => updateFormData('primary_color', value)}
              placeholder="#1B365D"
              maxLength={7}
            />
          </View>
        </View>
        
        <View style={styles.colorPickerContainer}>
          <Text style={styles.label}>Secondary Color</Text>
          <View style={styles.colorPreview}>
            <View style={[styles.colorSwatch, { backgroundColor: formData.secondary_color }]} />
            <TextInput
              style={styles.colorInput}
              value={formData.secondary_color}
              onChangeText={(value) => updateFormData('secondary_color', value)}
              placeholder="#FFFFFF"
              maxLength={7}
            />
          </View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Create Team</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Team Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                placeholder="Enter team name (e.g., Maple Leafs U12)"
                maxLength={100}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>League/Organization</Text>
              <TextInput
                style={styles.textInput}
                value={formData.league}
                onChangeText={(value) => updateFormData('league', value)}
                placeholder="Enter league name (e.g., Metro Minor Hockey)"
                maxLength={100}
              />
            </View>

            {renderAgeGroupPicker()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Season</Text>
              <TextInput
                style={styles.textInput}
                value={formData.season}
                onChangeText={(value) => updateFormData('season', value)}
                placeholder="2024-2025"
                maxLength={20}
              />
            </View>
          </View>

          {/* Arena Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arena Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Home Arena</Text>
              <TextInput
                style={styles.textInput}
                value={formData.home_arena}
                onChangeText={(value) => updateFormData('home_arena', value)}
                placeholder="Enter arena name (e.g., Scotiabank Arena)"
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Arena Address (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.arena_address}
                onChangeText={(value) => updateFormData('arena_address', value)}
                placeholder="Enter arena address"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Team Colors */}
          {renderColorPickers()}

          {/* Coach Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coach Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Head Coach Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.head_coach_name}
                onChangeText={(value) => updateFormData('head_coach_name', value)}
                placeholder="Enter head coach name"
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Coach Email</Text>
              <TextInput
                style={[styles.textInput, errors.coach_email && styles.inputError]}
                value={formData.coach_email}
                onChangeText={(value) => updateFormData('coach_email', value)}
                placeholder="Enter coach email address"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={255}
              />
              {errors.coach_email && <Text style={styles.errorText}>{errors.coach_email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Coach Phone</Text>
              <TextInput
                style={[styles.textInput, errors.coach_phone && styles.inputError]}
                value={formData.coach_phone}
                onChangeText={(value) => updateFormData('coach_phone', value)}
                placeholder="Enter coach phone number"
                keyboardType="phone-pad"
                maxLength={20}
              />
              {errors.coach_phone && <Text style={styles.errorText}>{errors.coach_phone}</Text>}
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, (loading || teamLoading) && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || teamLoading}
          >
            {loading || teamLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Team</Text>
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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

  // Age Group Picker
  pickerContainer: {
    marginBottom: 20,
  },
  ageGroupScroll: {
    marginTop: 5,
  },
  ageGroupOption: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  ageGroupSelected: {
    backgroundColor: '#1B365D',
    borderColor: '#1B365D',
  },
  ageGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
  },
  ageGroupTextSelected: {
    color: 'white',
  },

  // Color Pickers
  colorSection: {
    marginBottom: 30,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorPickerContainer: {
    flex: 0.48,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 10,
    padding: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  colorInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
  },

  // Create Button
  createButton: {
    backgroundColor: '#1B365D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateTeamScreen;