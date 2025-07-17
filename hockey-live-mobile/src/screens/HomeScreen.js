/**
 * HomeScreen - Main dashboard screen
 * Shows overview of teams, recent games, and quick actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { teams } = useTeam();

  const handleNavigateToTeams = () => {
    navigation.navigate('Teams', { screen: 'TeamManagement' });
  };

  const handleCreateTeam = () => {
    navigation.navigate('Teams', { screen: 'CreateTeam' });
  };

  const handleJoinTeam = () => {
    navigation.navigate('Teams', { screen: 'JoinTeam' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hockey Live</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {user?.full_name || 'Coach'}!</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{teams?.length || 0}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Active Games</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Recordings</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard} onPress={handleCreateTeam}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionTitle}>Create Team</Text>
              <Text style={styles.actionSubtitle}>Set up a new hockey team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleJoinTeam}>
              <Text style={styles.actionIcon}>🔗</Text>
              <Text style={styles.actionTitle}>Join Team</Text>
              <Text style={styles.actionSubtitle}>Join an existing team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleNavigateToTeams}>
              <Text style={styles.actionIcon}>🏒</Text>
              <Text style={styles.actionTitle}>Manage Teams</Text>
              <Text style={styles.actionSubtitle}>View and edit your teams</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Teams */}
        {teams && teams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Teams</Text>
            {teams.slice(0, 3).map((team) => (
              <TouchableOpacity 
                key={team.id} 
                style={styles.teamCard}
                onPress={() => navigation.navigate('Teams', { 
                  screen: 'TeamDetail', 
                  params: { team } 
                })}
              >
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamDetails}>
                    {team.league || 'No League'} • {team.age_group || 'No Age Group'}
                  </Text>
                </View>
                <View style={styles.teamStats}>
                  <Text style={styles.teamStat}>
                    {team.players?.length || 0} players
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {teams.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={handleNavigateToTeams}
              >
                <Text style={styles.viewAllText}>View All Teams →</Text>
              </TouchableOpacity>
            )}
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
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

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#5A6C7D',
    textAlign: 'center',
  },

  // Teams
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 2,
  },
  teamDetails: {
    fontSize: 12,
    color: '#5A6C7D',
  },
  teamStats: {
    alignItems: 'flex-end',
  },
  teamStat: {
    fontSize: 12,
    color: '#5A6C7D',
  },
  
  // View All Button
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  viewAllText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;