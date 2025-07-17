// mobile/src/components/basic/Button.js
import React from 'react';

const Button = ({ 
  title, 
  onPress, 
  style = {}, 
  variant = "primary", 
  disabled = false,
  loading = false 
}) => {
  const baseStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1
  };

  const variants = {
    primary: {
      backgroundColor: '#007AFF',
      color: 'white'
    },
    secondary: {
      backgroundColor: '#F2F2F7',
      color: '#007AFF',
      border: '1px solid #007AFF'
    },
    danger: {
      backgroundColor: '#FF3B30',
      color: 'white'
    },
    success: {
      backgroundColor: '#34C759',
      color: 'white'
    }
  };

  return (
    <button 
      style={{...baseStyle, ...variants[variant], ...style}}
      onClick={onPress}
      disabled={disabled || loading}
    >
      {loading ? '...' : title}
    </button>
  );
};

export default Button;