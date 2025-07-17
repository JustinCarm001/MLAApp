/**
 * TeamDetailScreen - Detailed team view with roster management
 * Shows team information and manages players
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
  RefreshControl,
} from 'react-native';

import { useTeam } from '../../context/TeamContext';

const TeamDetailScreen = ({ navigation, route }) => {
  const { team: routeTeam, onTeamUpdated } = route.params || {};
  const { 
    currentTeam, 
    setCurrentTeam, 
    getTeamDetails, 
    isTeamCreator, 
    getTeamStats,
    loading,
    error,
    addPlayer,
    playersLoading,
    playersError,
    clearError,
    clearPlayersError,
  } = useTeam();

  const [refreshing, setRefreshing] = useState(false);
  const [team, setTeam] = useState(routeTeam || currentTeam);

  useEffect(() => {
    if (routeTeam) {
      setTeam(routeTeam);
      setCurrentTeam(routeTeam);
      loadTeamDetails();
    }
  }, [routeTeam]);

  const loadTeamDetails = async () => {
    if (!team?.id) return;
    
    try {
      const updatedTeam = await getTeamDetails(team.id);
      setTeam(updatedTeam);
    } catch (error) {
      console.error('Error loading team details:', error);
      Alert.alert('Error', 'Failed to load team details. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeamDetails();
    setRefreshing(false);
  };

  const handleAddPlayer = () => {
    navigation.navigate('PlayerManagement', { team, mode: 'add' });
  };

  const handleEditPlayer = (player) => {
    navigation.navigate('PlayerManagement', { team, player, mode: 'edit' });
  };

  const handleEditTeam = () => {
    // TODO: Implement team editing
    Alert.alert('Coming Soon', 'Team editing functionality will be available soon.');
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement team deletion
            Alert.alert('Coming Soon', 'Team deletion functionality will be available soon.');
          }
        }
      ]
    );
  };

  const handleShareTeamCode = () => {
    Alert.alert(
      'Team Code',
      `Share this code with players and parents to join your team:\n\n${team.team_code}`,
      [
        { text: 'OK' }
      ]
    );
  };

  const isCreator = isTeamCreator(team?.id);
  const stats = getTeamStats(team?.id);

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Team not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Details</Text>
        {isCreator && (
          <TouchableOpacity onPress={handleEditTeam} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Team Information */}
        <View style={styles.section}>
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamDetails}>
                  {team.league || 'No League'} • {team.age_group || 'No Age Group'}
                </Text>
                <Text style={styles.teamSeason}>Season: {team.season || 'N/A'}</Text>
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

            {/* Team Code */}
            <TouchableOpacity 
              style={styles.teamCodeContainer}
              onPress={handleShareTeamCode}
            >
              <Text style={styles.teamCodeLabel}>Team Code:</Text>
              <Text style={styles.teamCode}>{team.team_code}</Text>
              <Text style={styles.teamCodeShare}>Tap to share →</Text>
            </TouchableOpacity>

            {/* Arena Information */}
            {team.home_arena && (
              <View style={styles.arenaInfo}>
                <Text style={styles.arenaTitle}>Home Arena</Text>
                <Text style={styles.arenaName}>{team.home_arena}</Text>
                {team.arena_address && (
                  <Text style={styles.arenaAddress}>{team.arena_address}</Text>
                )}
              </View>
            )}

            {/* Coach Information */}
            {team.head_coach_name && (
              <View style={styles.coachInfo}>
                <Text style={styles.coachTitle}>Head Coach</Text>
                <Text style={styles.coachName}>{team.head_coach_name}</Text>
                {team.coach_email && (
                  <Text style={styles.coachContact}>{team.coach_email}</Text>
                )}
                {team.coach_phone && (
                  <Text style={styles.coachContact}>{team.coach_phone}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Team Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.totalPlayers || 0}</Text>
              <Text style={styles.statLabel}>Total Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.skaters || 0}</Text>
              <Text style={styles.statLabel}>Skaters</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.goalies || 0}</Text>
              <Text style={styles.statLabel}>Goalies</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.games || 0}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
          </View>
        </View>

        {/* Roster Section */}
        <View style={styles.section}>
          <View style={styles.rosterHeader}>
            <Text style={styles.sectionTitle}>Roster</Text>
            {isCreator && (
              <TouchableOpacity 
                style={styles.addPlayerButton}
                onPress={handleAddPlayer}
              >
                <Text style={styles.addPlayerText}>+ Add Player</Text>
              </TouchableOpacity>
            )}
          </View>

          {playersLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={24} color="#1B365D" />
              <Text style={styles.loadingText}>Loading players...</Text>
            </View>
          )}

          {playersError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{playersError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  clearPlayersError();
                  handleRefresh();
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!playersLoading && !playersError && (
            <>
              {team.players && team.players.length > 0 ? (
                team.players.map((player, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.playerCard}
                    onPress={() => isCreator && handleEditPlayer(player)}
                  >
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerPosition}>
                        {player.position || 'No Position'} • #{player.number}
                      </Text>
                    </View>
                    {isCreator && (
                      <Text style={styles.editPlayerText}>Edit →</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyRoster}>
                  <Text style={styles.emptyRosterIcon}>🏒</Text>
                  <Text style={styles.emptyRosterTitle}>No Players Yet</Text>
                  <Text style={styles.emptyRosterSubtitle}>
                    {isCreator 
                      ? 'Add players to your team to get started with roster management.'
                      : 'The coach hasn\'t added any players yet.'
                    }
                  </Text>
                  {isCreator && (
                    <TouchableOpacity 
                      style={styles.addFirstPlayerButton}
                      onPress={handleAddPlayer}
                    >
                      <Text style={styles.addFirstPlayerText}>Add First Player</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* Admin Actions */}
        {isCreator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Management</Text>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={handleDeleteTeam}
            >
              <Text style={styles.dangerButtonText}>Delete Team</Text>
            </TouchableOpacity>
          </View>
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
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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

  // Team Card
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  teamDetails: {
    fontSize: 16,
    color: '#5A6C7D',
    marginBottom: 3,
  },
  teamSeason: {
    fontSize: 14,
    color: '#8A9BA8',
  },
  teamColors: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },

  // Team Code
  teamCodeContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  teamCodeLabel: {
    fontSize: 14,
    color: '#5A6C7D',
    marginBottom: 5,
  },
  teamCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  teamCodeShare: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },

  // Arena Info
  arenaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 15,
    marginBottom: 15,
  },
  arenaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  arenaName: {
    fontSize: 16,
    color: '#5A6C7D',
    marginBottom: 3,
  },
  arenaAddress: {
    fontSize: 14,
    color: '#8A9BA8',
  },

  // Coach Info
  coachInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 15,
  },
  coachTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  coachName: {
    fontSize: 16,
    color: '#5A6C7D',
    marginBottom: 3,
  },
  coachContact: {
    fontSize: 14,
    color: '#8A9BA8',
    marginBottom: 2,
  },

  // Statistics
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#5A6C7D',
    textAlign: 'center',
  },

  // Roster
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addPlayerButton: {
    backgroundColor: '#1B365D',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addPlayerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Player Cards
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 3,
  },
  playerPosition: {
    fontSize: 14,
    color: '#5A6C7D',
  },
  editPlayerText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },

  // Empty Roster
  emptyRoster: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyRosterIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyRosterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyRosterSubtitle: {
    fontSize: 16,
    color: '#5A6C7D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  addFirstPlayerButton: {
    backgroundColor: '#1B365D',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  addFirstPlayerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5A6C7D',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1B365D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Danger Actions
  dangerButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TeamDetailScreen;