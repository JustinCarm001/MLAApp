/**
 * TeamManagementScreen - Main team management interface
 * Shows user's teams and allows creating new teams
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
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import { useTeam } from '../../context/TeamContext';
import { useFocusEffect } from '@react-navigation/native';

const TeamManagementScreen = ({ navigation }) => {
  const { teams, loading, error, loadTeams, clearError } = useTeam();
  const [refreshing, setRefreshing] = useState(false);

  // Load teams when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTeams();
    }, [loadTeams])
  );

  const handleLoadTeams = async () => {
    try {
      await loadTeams();
    } catch (error) {
      console.error('❌ Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleLoadTeams();
    setRefreshing(false);
  };

  const handleCreateTeam = () => {
    navigation.navigate('CreateTeam', { onTeamCreated: handleLoadTeams });
  };

  const handleTeamPress = (team) => {
    navigation.navigate('TeamDetail', { team, onTeamUpdated: handleLoadTeams });
  };

  const renderTeamCard = (team) => (
    <TouchableOpacity 
      key={team.id} 
      style={styles.teamCard}
      onPress={() => handleTeamPress(team)}
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamDetails}>
            {team.league || 'No League'} • {team.age_group || 'No Age Group'}
          </Text>
          <Text style={styles.teamCode}>Team Code: {team.team_code}</Text>
        </View>
        <View style={styles.teamColors}>
          {team.primary_color && (
            <View 
              style={[styles.colorSwatch, { backgroundColor: team.primary_color }]} 
            />
          )}
          {team.secondary_color && (
            <View 
              style={[styles.colorSwatch, { backgroundColor: team.secondary_color }]} 
            />
          )}
        </View>
      </View>
      
      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{team.players?.length || 0}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {team.players?.filter(p => p.position === 'Goalie').length || 0}
          </Text>
          <Text style={styles.statLabel}>Goalies</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
      </View>
      
      <Text style={styles.viewTeamText}>Tap to manage team →</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🏒</Text>
      <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create your first hockey team to get started with game recording and roster management.
      </Text>
      <TouchableOpacity 
        style={styles.createFirstTeamButton}
        onPress={handleCreateTeam}
      >
        <Text style={styles.createFirstTeamText}>Create Your First Team</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Teams</Text>
        </View>
        <TouchableOpacity onPress={handleCreateTeam} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={24} color="#1B365D" />
            <Text style={styles.loadingText}>Loading your teams...</Text>
          </View>
        ) : teams.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.teamsHeader}>
              <Text style={styles.teamsTitle}>Your Teams ({teams.length})</Text>
              <Text style={styles.teamsSubtitle}>
                Manage rosters, add players, and organize your hockey teams
              </Text>
            </View>
            
            {teams.map(renderTeamCard)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  // Header
  header: {
    backgroundColor: '#1B365D',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#5A6C7D',
  },

  // Teams Header
  teamsHeader: {
    marginBottom: 20,
  },
  teamsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  teamsSubtitle: {
    fontSize: 16,
    color: '#5A6C7D',
    lineHeight: 22,
  },

  // Team Cards
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  teamDetails: {
    fontSize: 14,
    color: '#5A6C7D',
    marginBottom: 3,
  },
  teamCode: {
    fontSize: 12,
    color: '#8A9BA8',
    fontFamily: 'monospace',
  },
  teamColors: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },

  // Team Stats
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  statLabel: {
    fontSize: 12,
    color: '#5A6C7D',
    marginTop: 3,
  },
  viewTeamText: {
    textAlign: 'center',
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createFirstTeamButton: {
    backgroundColor: '#1B365D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  createFirstTeamText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TeamManagementScreen;