// mobile/src/components/navigation/TabBar.js
import React from 'react';
import Text from '../basic/Text';
import Icon from '../basic/Icon';

const TabItem = ({ icon, label, isActive, onPress, badge = 0 }) => {
  return (
    <div 
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onClick={onPress}
    >
      <div style={{ position: 'relative' }}>
        <Icon 
          name={icon} 
          size={24} 
          color={isActive ? '#007AFF' : '#8E8E93'} 
        />
        {badge > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-6px',
            backgroundColor: '#FF3B30',
            color: 'white',
            borderRadius: '10px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </div>
      
      <Text 
        variant="caption" 
        style={{ 
          marginTop: '4px',
          color: isActive ? '#007AFF' : '#8E8E93',
          fontSize: '10px'
        }}
      >
        {label}
      </Text>
    </div>
  );
};

const TabBar = ({ 
  currentTab, 
  onTabChange,
  tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'upload', icon: 'plus', label: 'Upload' },
    { id: 'profile', icon: 'user', label: 'Profile' }
  ],
  badges = {}
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #E5E5EA',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100
    }}>
      {tabs.map(tab => (
        <TabItem
          key={tab.id}
          icon={tab.icon}
          label={tab.label}
          isActive={currentTab === tab.id}
          onPress={() => onTabChange(tab.id)}
          badge={badges[tab.id] || 0}
        />
      ))}
    </div>
  );
};

export default TabBar;