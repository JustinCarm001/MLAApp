// mobile/src/components/navigation/BackButton.js
import React from 'react';
import Icon from '../basic/Icon';
import Text from '../basic/Text';

const BackButton = ({ 
  onPress, 
  title = 'Back',
  showTitle = true,
  style = {},
  color = '#007AFF'
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        ...style
      }}
      onClick={onPress}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,122,255,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Icon name="back" size={20} color={color} />
      {showTitle && (
        <Text 
          variant="callout" 
          style={{ 
            color: color,
            margin: 0 
          }}
        >
          {title}
        </Text>
      )}
    </div>
  );
};

export default BackButton;