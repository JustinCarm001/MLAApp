/**
 * Hockey Live App - Expo Version
 * This is the main App.js file for your Expo project
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
  Alert
} from 'react-native';

const API_BASE_URL = 'http://localhost:8000';
const API_V1_URL = `${API_BASE_URL}/api/v1`;

export default function App() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');

  useEffect(() => {
    // Test backend connection on app start
    testHealthCheck();
  }, []);

  // Make API request
  const makeApiRequest = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_V1_URL}${endpoint}`;
    
    try {
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error(`❌ API Error:`, error);
      return { success: false, error: error.message };
    }
  };

  // Add test result
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
      } else {
        addTestResult('health_check', false, null, response.error);
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
      addTestResult('health_check', false, null, error.message);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const testApiInfo = async () => {
    setLoading(true);
    const result = await makeApiRequest('/');
    addTestResult('api_info', result.success, result.data, result.error);
    setLoading(false);
  };

  const testAuthEndpoints = async () => {
    setLoading(true);
    
    const registerResult = await makeApiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword',
        full_name: 'Test User'
      })
    });
    addTestResult('auth_register', registerResult.success, registerResult.data, registerResult.error);
    
    setLoading(false);
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    setTestResults({});
    
    await testHealthCheck();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testApiInfo();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAuthEndpoints();
    
    // Test other endpoints
    const teamsResult = await makeApiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Team' })
    });
    addTestResult('teams_create', teamsResult.success, teamsResult.data, teamsResult.error);

    const gamesResult = await makeApiRequest('/games', {
      method: 'POST',
      body: JSON.stringify({ test: true })
    });
    addTestResult('games_create', gamesResult.success, gamesResult.data, gamesResult.error);

    const arenaResult = await makeApiRequest('/arena/types');
    addTestResult('arena_types', arenaResult.success, arenaResult.data, arenaResult.error);
    
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
            <Text style={styles.statusText}>
              {result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.timestamp}>Tested at: {result.timestamp}</Text>
        
        {result.success && result.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataLabel}>Response:</Text>
            <Text style={styles.dataText} numberOfLines={10}>
              {JSON.stringify(result.data, null, 2)}
            </Text>
          </View>
        )}
        
        {!result.success && result.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏒 Hockey Live API Test</Text>
        <Text style={styles.subtitle}>Mobile + Backend Integration</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Backend Info */}
        <View style={styles.backendInfo}>
          <Text style={styles.sectionTitle}>🔗 Backend Information</Text>
          <Text style={styles.infoText}>API URL: {API_BASE_URL}</Text>
          <Text style={styles.infoText}>API Version: v1</Text>
          <Text style={styles.infoText}>Health: {API_BASE_URL}/health</Text>
          <Text style={styles.infoText}>Docs: {API_BASE_URL}/docs</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>🧪 API Tests</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={testHealthCheck}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Health Check</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={testApiInfo}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test API Info</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={testAuthEndpoints}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Auth Endpoints</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={testAllEndpoints}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              🚀 Test All Endpoints
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => setTestResults({})}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Testing API...</Text>
          </View>
        )}

        {/* Results */}
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>📊 Test Results</Text>
          {Object.keys(testResults).length === 0 && !loading && (
            <Text style={styles.noResults}>No tests run yet. Tap a button above to start testing.</Text>
          )}
          {Object.entries(testResults).map(([testName, result]) =>
            renderTestResult(testName, result)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    marginBottom: 10,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  backendInfo: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  controls: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  primaryButtonText: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  results: {
    margin: 15,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  testResult: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dataText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
  },
});