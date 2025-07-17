/**
 * API Test Screen - Test backend connectivity
 * This screen helps verify the mobile app can connect to the FastAPI backend
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import apiService, { ApiError } from '../../services/api';

const ApiTestScreen = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');

  useEffect(() => {
    // Test backend connection on component mount
    testHealthCheck();
  }, []);

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
      
      const response = await apiService.healthCheck();
      console.log('✅ Health check response:', response);
      
      addTestResult('health_check', true, response);
      setBackendStatus('connected');
    } catch (error) {
      console.error('❌ Health check failed:', error);
      addTestResult('health_check', false, null, error.message);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const testApiInfo = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing API info...');
      
      const response = await apiService.get('/');
      console.log('✅ API info response:', response);
      
      addTestResult('api_info', true, response);
    } catch (error) {
      console.error('❌ API info failed:', error);
      addTestResult('api_info', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoints = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing auth endpoints...');
      console.log('📡 API Base URL:', apiService.baseURL);
      
      const userData = {
        email: 'mobile-test@example.com',
        password: 'testpassword123',
        full_name: 'Mobile Test User'
      };
      
      console.log('📤 Sending registration data:', userData);
      console.log('🌐 Full URL will be:', `${apiService.baseURL}/auth/register`);
      
      // Test register endpoint
      const registerResponse = await apiService.auth.register(userData);
      
      console.log('✅ Registration successful:', registerResponse);
      addTestResult('auth_register', true, registerResponse);
      
      // Now test login with the same credentials
      console.log('🔐 Testing login with same credentials...');
      const loginResponse = await apiService.auth.login(userData.email, userData.password);
      console.log('✅ Login successful:', loginResponse);
      addTestResult('auth_login', true, loginResponse);
      
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
      addTestResult('auth_register', false, null, `${error.message} (Status: ${error.status})`);
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    setTestResults({});
    
    // Test all major endpoints
    await testHealthCheck();
    await testApiInfo();
    await testAuthEndpoints();
    
    // Test other placeholder endpoints
    try {
      const teamsResponse = await apiService.teams.create({ name: 'Test Team' });
      addTestResult('teams_create', true, teamsResponse);
    } catch (error) {
      addTestResult('teams_create', false, null, error.message);
    }

    try {
      const gamesResponse = await apiService.games.create({ test: true });
      addTestResult('games_create', true, gamesResponse);
    } catch (error) {
      addTestResult('games_create', false, null, error.message);
    }

    try {
      const arenaResponse = await apiService.arena.getTypes();
      addTestResult('arena_types', true, arenaResponse);
    } catch (error) {
      addTestResult('arena_types', false, null, error.message);
    }

    setLoading(false);
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#F44336';
      default: return '#FF9800';
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
            <Text style={styles.dataText}>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hockey Live API Test</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>
            Backend: {backendStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.backendInfo}>
        <Text style={styles.sectionTitle}>Backend Information</Text>
        <Text style={styles.infoText}>URL: http://10.0.0.18:8000</Text>
        <Text style={styles.infoText}>API Version: v1</Text>
        <Text style={styles.infoText}>Docs: http://10.0.0.18:8000/docs</Text>
      </View>

      <View style={styles.controls}>
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
            Test All Endpoints
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Testing API...</Text>
        </View>
      )}

      <View style={styles.results}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        {Object.keys(testResults).length === 0 && !loading && (
          <Text style={styles.noResults}>No tests run yet. Tap a button above to start testing.</Text>
        )}
        {Object.entries(testResults).map(([testName, result]) =>
          renderTestResult(testName, result)
        )}
      </View>
    </ScrollView>
  );
};

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
  backendInfo: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
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
  },
  controls: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  button: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
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

export default ApiTestScreen;