/**
 * Context Providers Export
 * Centralized export for all context providers
 */

export { AuthProvider, useAuth } from './AuthContext';
export { TeamProvider, useTeam } from './TeamContext';

// Combined provider component for easy app-wide setup
import React from 'react';
import { AuthProvider } from './AuthContext';
import { TeamProvider } from './TeamContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <TeamProvider>
        {children}
      </TeamProvider>
    </AuthProvider>
  );
};