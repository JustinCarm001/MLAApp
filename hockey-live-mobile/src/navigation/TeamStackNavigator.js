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
        headerShown: false, // We'll use custom headers in each screen
        cardStyle: { backgroundColor: '#F5F7FA' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animationEnabled: true,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen 
        name="TeamManagement" 
        component={TeamManagementScreen}
        options={{
          title: 'Team Management',
        }}
      />
      
      <Stack.Screen 
        name="CreateTeam" 
        component={CreateTeamScreen}
        options={{
          title: 'Create Team',
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      
      <Stack.Screen 
        name="TeamDetail" 
        component={TeamDetailScreen}
        options={{
          title: 'Team Details',
        }}
      />
      
      <Stack.Screen 
        name="PlayerManagement" 
        component={PlayerManagementScreen}
        options={{
          title: 'Player Management',
        }}
      />
      
      <Stack.Screen 
        name="JoinTeam" 
        component={JoinTeamScreen}
        options={{
          title: 'Join Team',
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

export default TeamStackNavigator;