// mobile/src/components/basic/Input.js
import React from 'react';

const Input = ({ 
  placeholder, 
  value, 
  onChangeText, 
  type = "text", 
  style = {},
  error = '',
  label = '' 
}) => {
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${error ? '#FF3B30' : '#C7C7CC'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    ...style
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = error ? '#FF3B30' : '#007AFF';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? '#FF3B30' : '#C7C7CC';
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '16px',
          fontWeight: '500',
          color: '#000'
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && (
        <div style={{ 
          color: '#FF3B30', 
          fontSize: '14px', 
          marginTop: '4px' 
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;