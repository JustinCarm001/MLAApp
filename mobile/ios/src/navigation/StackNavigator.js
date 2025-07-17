// mobile/src/navigation/StackNavigator.js
import React, { useState } from 'react';
import Header from '../components/navigation/Header';

const StackNavigator = ({ 
  initialScreen, 
  screens = {},
  screenProps = {},
  onNavigate 
}) => {
  const [currentScreen, setCurrentScreen] = useState(initialScreen);
  const [navigationStack, setNavigationStack] = useState([initialScreen]);
  const [screenData, setScreenData] = useState({});

  const navigate = (screenName, data = {}) => {
    setCurrentScreen(screenName);
    setNavigationStack(prev => [...prev, screenName]);
    setScreenData(prev => ({ ...prev, [screenName]: data }));
    
    if (onNavigate) {
      onNavigate(screenName, data);
    }
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      setCurrentScreen(newStack[newStack.length - 1]);
    }
  };

  const resetToScreen = (screenName, data = {}) => {
    setCurrentScreen(screenName);
    setNavigationStack([screenName]);
    setScreenData({ [screenName]: data });
  };

  const canGoBack = navigationStack.length > 1;

  const renderCurrentScreen = () => {
    const ScreenComponent = screens[currentScreen];
    
    if (!ScreenComponent) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center' 
        }}>
          Screen "{currentScreen}" not found
        </div>
      );
    }

    const props = {
      ...screenProps,
      navigate,
      goBack,
      resetToScreen,
      canGoBack,
      screenData: screenData[currentScreen] || {}
    };

    return <ScreenComponent {...props} />;
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Screen Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#F2F2F7'
      }}>
        {renderCurrentScreen()}
      </div>
    </div>
  );
};

export default StackNavigator;