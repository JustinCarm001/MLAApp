// mobile/src/components/basic/Image.js
import React, { useState } from 'react';

const Image = ({ 
  src, 
  alt = '', 
  style = {},
  placeholder = '',
  onPress,
  borderRadius = 0
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const imageStyle = {
    borderRadius: `${borderRadius}px`,
    cursor: onPress ? 'pointer' : 'default',
    transition: 'opacity 0.2s ease',
    ...style
  };

  if (error) {
    return (
      <div 
        style={{
          ...imageStyle,
          backgroundColor: '#F2F2F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8E8E93',
          fontSize: '14px'
        }}
        onClick={onPress}
      >
        {placeholder || 'Image not found'}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div 
          style={{
            ...imageStyle,
            backgroundColor: '#F2F2F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8E8E93',
            fontSize: '14px',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          Loading...
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{
          ...imageStyle,
          opacity: loading ? 0 : 1
        }}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onPress}
      />
    </div>
  );
};

export default Image;