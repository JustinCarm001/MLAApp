/**
 * TeamStackNavigator - Stack navigation for team management screens
 * Handles navigation between team-related screens using React Navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import team screens
import TeamManagementScreen from '../screens/teams/TeamManagementScreen';
import CreateTeamScreen from '../screens/teams/CreateTeamScreen';
import TeamDetailScreen from '../screens/teams/TeamDetailScreen';
import PlayerManagementScreen from '../screens/teams/PlayerManagementScreen';
import JoinTeamScreen from '../screens/teams/JoinTeamScreen';

const Stack = createStackNavigator();

const TeamStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F5F7FA' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="TeamManagement" 
        component={TeamManagementScreen}
      />
      
      <Stack.Screen 
        name="CreateTeam" 
        component={CreateTeamScreen}
      />
      
      <Stack.Screen 
        name="TeamDetail" 
        component={TeamDetailScreen}
      />
      
      <Stack.Screen 
        name="PlayerManagement" 
        component={PlayerManagementScreen}
      />
      
      <Stack.Screen 
        name="JoinTeam" 
        component={JoinTeamScreen}
      />
    </Stack.Navigator>
  );
};

export default TeamStackNavigator;