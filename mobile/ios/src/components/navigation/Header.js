// mobile/src/components/navigation/Header.js
import React from 'react';
import Text from '../basic/Text';
import Icon from '../basic/Icon';
import Button from '../basic/Button';

const HeaderButton = ({ icon, onPress, style = {} }) => {
  return (
    <div 
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style
      }}
      onClick={onPress}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
    >
      <Icon name={icon} size={20} color="#000" />
    </div>
  );
};

const Header = ({ 
  title = '',
  subtitle = '',
  showBackButton = false,
  onBackPress,
  rightButton = null,
  rightButtonIcon = '',
  onRightButtonPress,
  backgroundColor = 'white',
  style = {}
}) => {
  return (
    <div style={{
      backgroundColor: backgroundColor,
      padding: '12px 20px',
      paddingTop: 'calc(12px + env(safe-area-inset-top))',
      borderBottom: '1px solid #E5E5EA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      ...style
    }}>
      {/* Left side */}
      <div style={{ flex: 1 }}>
        {showBackButton ? (
          <HeaderButton 
            icon="back" 
            onPress={onBackPress}
          />
        ) : (
          <div style={{ width: '40px' }} />
        )}
      </div>

      {/* Center - Title */}
      <div style={{ 
        flex: 2, 
        textAlign: 'center',
        minWidth: 0 
      }}>
        <Text 
          variant="headline" 
          style={{ 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            variant="caption" 
            style={{ 
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {subtitle}
          </Text>
        )}
      </div>

      {/* Right side */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'flex-end' 
      }}>
        {rightButton || (rightButtonIcon && (
          <HeaderButton 
            icon={rightButtonIcon} 
            onPress={onRightButtonPress}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;
