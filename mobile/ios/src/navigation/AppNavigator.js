// mobile/src/navigation/AppNavigator.js
import React, { useState } from 'react';
import TabBar from '../components/navigation/TabBar';
import Header from '../components/navigation/Header';

// Import screens (we'll create these next)
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import UploadScreen from '../screens/main/UploadScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const AppNavigator = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'upload', icon: 'plus', label: 'Upload' },
    { id: 'profile', icon: 'user', label: 'Profile' }
  ];

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    setNavigationHistory(prev => [...prev, tabId]);
  };

  const handleBackPress = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setCurrentTab(newHistory[newHistory.length - 1]);
    }
  };

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'home': return 'Your Videos';
      case 'search': return 'Search';
      case 'upload': return 'Upload Video';
      case 'profile': return 'Profile';
      default: return 'App';
    }
  };

  const showBackButton = navigationHistory.length > 1;

  const renderCurrentScreen = () => {
    const screenProps = {
      user,
      onNavigate: handleTabChange,
      onLogout
    };

    switch (currentTab) {
      case 'home':
        return <HomeScreen {...screenProps} />;
      case 'search':
        return <SearchScreen {...screenProps} />;
      case 'upload':
        return <UploadScreen {...screenProps} />;
      case 'profile':
        return <ProfileScreen {...screenProps} />;
      default:
        return <HomeScreen {...screenProps} />;
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <Header
        title={getHeaderTitle()}
        showBackButton={showBackButton}
        onBackPress={handleBackPress}
        rightButtonIcon={currentTab === 'profile' ? 'settings' : ''}
        onRightButtonPress={() => console.log('Settings pressed')}
      />

      {/* Screen Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        paddingBottom: '80px', // Space for tab bar
        backgroundColor: '#F2F2F7'
      }}>
        {renderCurrentScreen()}
      </div>

      {/* Tab Bar */}
      <TabBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        tabs={tabs}
        badges={{
          home: 0,
          search: 0,
          upload: 0,
          profile: 0
        }}
      />
    </div>
  );
};

export default AppNavigator;