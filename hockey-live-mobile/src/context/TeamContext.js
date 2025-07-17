/**
 * TeamContext - Team Management State Management
 * Manages team data, operations, and player management
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
  playersLoading: false,
  playersError: null,
};

// Action types
const TEAM_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PLAYERS_LOADING: 'SET_PLAYERS_LOADING',
  LOAD_TEAMS_SUCCESS: 'LOAD_TEAMS_SUCCESS',
  LOAD_TEAMS_FAILURE: 'LOAD_TEAMS_FAILURE',
  CREATE_TEAM_SUCCESS: 'CREATE_TEAM_SUCCESS',
  CREATE_TEAM_FAILURE: 'CREATE_TEAM_FAILURE',
  SET_CURRENT_TEAM: 'SET_CURRENT_TEAM',
  JOIN_TEAM_SUCCESS: 'JOIN_TEAM_SUCCESS',
  JOIN_TEAM_FAILURE: 'JOIN_TEAM_FAILURE',
  ADD_PLAYER_SUCCESS: 'ADD_PLAYER_SUCCESS',
  ADD_PLAYER_FAILURE: 'ADD_PLAYER_FAILURE',
  UPDATE_TEAM_SUCCESS: 'UPDATE_TEAM_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_PLAYERS_ERROR: 'CLEAR_PLAYERS_ERROR',
};

// Reducer
const teamReducer = (state, action) => {
  switch (action.type) {
    case TEAM_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case TEAM_ACTIONS.SET_PLAYERS_LOADING:
      return {
        ...state,
        playersLoading: action.payload,
      };

    case TEAM_ACTIONS.LOAD_TEAMS_SUCCESS:
      return {
        ...state,
        teams: action.payload,
        loading: false,
        error: null,
      };

    case TEAM_ACTIONS.LOAD_TEAMS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case TEAM_ACTIONS.CREATE_TEAM_SUCCESS:
      return {
        ...state,
        teams: [...state.teams, action.payload],
        loading: false,
        error: null,
      };

    case TEAM_ACTIONS.CREATE_TEAM_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case TEAM_ACTIONS.SET_CURRENT_TEAM:
      return {
        ...state,
        currentTeam: action.payload,
      };

    case TEAM_ACTIONS.JOIN_TEAM_SUCCESS:
      return {
        ...state,
        teams: [...state.teams, action.payload],
        loading: false,
        error: null,
      };

    case TEAM_ACTIONS.JOIN_TEAM_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case TEAM_ACTIONS.ADD_PLAYER_SUCCESS:
      const updatedTeams = state.teams.map(team => 
        team.id === action.payload.teamId 
          ? { ...team, players: [...(team.players || []), action.payload.player] }
          : team
      );
      
      const updatedCurrentTeam = state.currentTeam && state.currentTeam.id === action.payload.teamId
        ? { ...state.currentTeam, players: [...(state.currentTeam.players || []), action.payload.player] }
        : state.currentTeam;

      return {
        ...state,
        teams: updatedTeams,
        currentTeam: updatedCurrentTeam,
        playersLoading: false,
        playersError: null,
      };

    case TEAM_ACTIONS.ADD_PLAYER_FAILURE:
      return {
        ...state,
        playersLoading: false,
        playersError: action.payload,
      };

    case TEAM_ACTIONS.UPDATE_TEAM_SUCCESS:
      const teamsAfterUpdate = state.teams.map(team => 
        team.id === action.payload.id ? action.payload : team
      );
      
      const currentTeamAfterUpdate = state.currentTeam && state.currentTeam.id === action.payload.id
        ? action.payload
        : state.currentTeam;

      return {
        ...state,
        teams: teamsAfterUpdate,
        currentTeam: currentTeamAfterUpdate,
        loading: false,
        error: null,
      };

    case TEAM_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case TEAM_ACTIONS.CLEAR_PLAYERS_ERROR:
      return {
        ...state,
        playersError: null,
      };

    default:
      return state;
  }
};

// Create context
const TeamContext = createContext();

// TeamProvider component
export const TeamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load teams
  const loadTeams = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('⚠️ User not authenticated, skipping team load');
      return;
    }

    try {
      console.log('📋 Loading user teams...');
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.teams.getMyTeams();
      const teams = response.teams || [];

      dispatch({
        type: TEAM_ACTIONS.LOAD_TEAMS_SUCCESS,
        payload: teams,
      });

      console.log(`✅ Loaded ${teams.length} teams`);
      return teams;
    } catch (error) {
      console.error('❌ Error loading teams:', error);
      dispatch({
        type: TEAM_ACTIONS.LOAD_TEAMS_FAILURE,
        payload: error.message || 'Failed to load teams',
      });
      throw error;
    }
  }, [isAuthenticated]);

  // Create team
  const createTeam = useCallback(async (teamData) => {
    try {
      console.log('🏒 Creating team:', teamData.name);
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.teams.create(teamData);
      const newTeam = response.team;

      dispatch({
        type: TEAM_ACTIONS.CREATE_TEAM_SUCCESS,
        payload: newTeam,
      });

      console.log('✅ Team created successfully');
      return newTeam;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      dispatch({
        type: TEAM_ACTIONS.CREATE_TEAM_FAILURE,
        payload: error.message || 'Failed to create team',
      });
      throw error;
    }
  }, []);

  // Get team details
  const getTeamDetails = useCallback(async (teamId) => {
    try {
      console.log('🔍 Getting team details:', teamId);
      const teamData = await apiService.teams.get(teamId);
      
      dispatch({
        type: TEAM_ACTIONS.SET_CURRENT_TEAM,
        payload: teamData,
      });

      console.log('✅ Team details loaded');
      return teamData;
    } catch (error) {
      console.error('❌ Error getting team details:', error);
      throw error;
    }
  }, []);

  // Join team
  const joinTeam = useCallback(async (teamCode) => {
    try {
      console.log('🔗 Joining team with code:', teamCode);
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.teams.join(teamCode);
      const joinedTeam = response.team;

      dispatch({
        type: TEAM_ACTIONS.JOIN_TEAM_SUCCESS,
        payload: joinedTeam,
      });

      console.log('✅ Successfully joined team');
      return joinedTeam;
    } catch (error) {
      console.error('❌ Error joining team:', error);
      dispatch({
        type: TEAM_ACTIONS.JOIN_TEAM_FAILURE,
        payload: error.message || 'Failed to join team',
      });
      throw error;
    }
  }, []);

  // Add player to team
  const addPlayer = useCallback(async (teamId, playerData) => {
    try {
      console.log('🏒 Adding player to team:', teamId, playerData.name);
      dispatch({ type: TEAM_ACTIONS.SET_PLAYERS_LOADING, payload: true });

      const response = await apiService.teams.addPlayer(teamId, playerData);
      const newPlayer = response.player;

      dispatch({
        type: TEAM_ACTIONS.ADD_PLAYER_SUCCESS,
        payload: {
          teamId,
          player: newPlayer,
        },
      });

      console.log('✅ Player added successfully');
      return newPlayer;
    } catch (error) {
      console.error('❌ Error adding player:', error);
      dispatch({
        type: TEAM_ACTIONS.ADD_PLAYER_FAILURE,
        payload: error.message || 'Failed to add player',
      });
      throw error;
    }
  }, []);

  // Set current team
  const setCurrentTeam = useCallback((team) => {
    dispatch({
      type: TEAM_ACTIONS.SET_CURRENT_TEAM,
      payload: team,
    });
  }, []);

  // Get team by ID
  const getTeamById = useCallback((teamId) => {
    return state.teams.find(team => team.id === teamId);
  }, [state.teams]);

  // Get user role in team
  const getUserRoleInTeam = useCallback((teamId) => {
    const team = getTeamById(teamId);
    return team ? team.role : 'member';
  }, [getTeamById]);

  // Check if user is team creator
  const isTeamCreator = useCallback((teamId) => {
    const team = getTeamById(teamId);
    return team ? team.role === 'creator' : false;
  }, [getTeamById]);

  // Get team statistics
  const getTeamStats = useCallback((teamId) => {
    const team = getTeamById(teamId);
    if (!team) return null;

    const players = team.players || [];
    const goalies = players.filter(p => p.position === 'Goalie');
    const skaters = players.filter(p => p.position !== 'Goalie');

    return {
      totalPlayers: players.length,
      goalies: goalies.length,
      skaters: skaters.length,
      games: 0, // TODO: Implement games count when games are integrated
    };
  }, [getTeamById]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: TEAM_ACTIONS.CLEAR_ERROR });
  }, []);

  // Clear players error
  const clearPlayersError = useCallback(() => {
    dispatch({ type: TEAM_ACTIONS.CLEAR_PLAYERS_ERROR });
  }, []);

  // Context value
  const value = {
    ...state,
    loadTeams,
    createTeam,
    getTeamDetails,
    joinTeam,
    addPlayer,
    setCurrentTeam,
    getTeamById,
    getUserRoleInTeam,
    isTeamCreator,
    getTeamStats,
    clearError,
    clearPlayersError,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

// Custom hook to use team context
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;