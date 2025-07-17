/**
 * Hockey Live App - Clean Expo Version
 * Copy this into your new Expo project's App.js
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
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

// Use your computer's IP address instead of localhost for physical device testing
// To find your IP: Run 'ipconfig' in command prompt and look for IPv4 Address
const API_BASE_URL = 'http://localhost:8000';  // Change to your computer's IP if testing on device
const API_V1_URL = `${API_BASE_URL}/api/v1`;

export default function App() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');

  useEffect(() => {
    // Auto-test connection when app loads
    setTimeout(() => {
      testHealthCheck();
    }, 1000);
  }, []);

  // Make API request with better error handling
  const makeApiRequest = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_V1_URL}${endpoint}`;
    
    try {
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error(`❌ API Error:`, error);
      
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - is your backend running?';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error - check if backend is running at ' + API_BASE_URL;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Add test result to state
  const addTestResult = (testName, success, data, error = null) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: {
        success,
        data,
        error,
        timestamp: new Date().toLocaleTimeString()
      }
    }));
  };

  const testHealthCheck = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing health check...');
      
      const response = await makeApiRequest(`${API_BASE_URL}/health`);
      console.log('✅ Health check response:', response);
      
      if (response.success) {
        addTestResult('health_check', true, response.data);
        setBackendStatus('connected');
        Alert.alert(
          'Success! 🎉', 
          `Connected to FastAPI backend!\n\nService: ${response.data.service}\nVersion: ${response.data.version}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        addTestResult('health_check', false, null, response.error);
        setBackendStatus('disconnected');
        Alert.alert(
          'Connection Failed ❌', 
          `Cannot reach backend at ${API_BASE_URL}\n\nError: ${response.error}\n\nMake sure your FastAPI server is running!`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
      addTestResult('health_check', false, null, error.message);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const testApiEndpoints = async () => {
    setLoading(true);
    
    // Test API Info
    const apiInfoResult = await makeApiRequest('/');
    addTestResult('api_info', apiInfoResult.success, apiInfoResult.data, apiInfoResult.error);
    
    // Test Auth Register
    const authResult = await makeApiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@hockeylive.com',
        password: 'TestPassword123',
        full_name: 'Hockey Test User'
      })
    });
    addTestResult('auth_register', authResult.success, authResult.data, authResult.error);
    
    // Test Teams endpoint
    const teamsResult = await makeApiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lightning U16',
        league: 'Metro Hockey League',
        age_group: 'U16'
      })
    });
    addTestResult('teams_create', teamsResult.success, teamsResult.data, teamsResult.error);
    
    // Test Games endpoint
    const gamesResult = await makeApiRequest('/games', {
      method: 'POST',
      body: JSON.stringify({
        home_team: 'Lightning',
        away_team: 'Thunder',
        arena_type: 'standard'
      })
    });
    addTestResult('games_create', gamesResult.success, gamesResult.data, gamesResult.error);
    
    // Test Arena types
    const arenaResult = await makeApiRequest('/arena/types');
    addTestResult('arena_types', arenaResult.success, arenaResult.data, arenaResult.error);
    
    Alert.alert(
      'API Tests Complete! ✅', 
      'All hockey endpoints have been tested. Check results below!',
      [{ text: 'Awesome!', style: 'default' }]
    );
    
    setLoading(false);
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return '✅ BACKEND CONNECTED';
      case 'disconnected': return '❌ BACKEND DISCONNECTED';
      default: return '🔄 TESTING...';
    }
  };

  const renderTestResult = (testName, result) => {
    if (!result) return null;

    return (
      <View key={testName} style={styles.testResult}>
        <View style={styles.testHeader}>
          <Text style={styles.testName}>{testName.replace('_', ' ').toUpperCase()}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: result.success ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.badgeText}>
              {result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.timestamp}>Tested at: {result.timestamp}</Text>
        
        {result.success && result.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataLabel}>✨ Response Data:</Text>
            <ScrollView horizontal style={styles.dataScroll}>
              <Text style={styles.dataText}>
                {JSON.stringify(result.data, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
        
        {!result.success && result.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorLabel}>❌ Error Details:</Text>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏒 Hockey Live</Text>
        <Text style={styles.subtitle}>Mobile ↔ Backend API Test</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>🔗 Connection Info</Text>
          <Text style={styles.infoItem}>🖥️  Backend URL: {API_BASE_URL}</Text>
          <Text style={styles.infoItem}>📱  Device: {Platform.OS}</Text>
          <Text style={styles.infoItem}>⚡  Framework: React Native + Expo</Text>
          <Text style={styles.infoItem}>🎯  API Version: v1</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={testHealthCheck}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              🔄 Test Connection
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]} 
            onPress={testApiEndpoints}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              🚀 Test All Hockey APIs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => {
              setTestResults({});
              setBackendStatus('unknown');
              Alert.alert('Cleared! 🧹', 'All test results have been cleared');
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🧹 Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Testing API Connection...</Text>
            <Text style={styles.loadingSubtext}>Connecting to FastAPI backend</Text>
          </View>
        )}

        {/* Test Results */}
        <View style={styles.resultsCard}>
          <Text style={styles.cardTitle}>📊 Test Results</Text>
          {Object.keys(testResults).length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>🎯 No tests run yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap "Test Connection" to start!</Text>
            </View>
          )}
          {Object.entries(testResults).map(([testName, result]) =>
            renderTestResult(testName, result)
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🏒 Hockey Live App</Text>
          <Text style={styles.footerSubtext}>FastAPI Backend Integration Test</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBDEFB',
    marginBottom: 15,
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionButton: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  primaryButtonText: {
    color: 'white',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  testResult: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  dataScroll: {
    maxHeight: 120,
  },
  dataText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
  },
});