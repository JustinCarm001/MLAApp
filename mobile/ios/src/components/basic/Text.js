// mobile/src/components/basic/Text.js
import React from 'react';

const Text = ({ 
  children, 
  style = {}, 
  variant = "body",
  color = '',
  align = 'left'
}) => {
  const variants = {
    large_title: { 
      fontSize: '34px', 
      fontWeight: 'bold', 
      lineHeight: '1.2',
      marginBottom: '16px' 
    },
    title_1: { 
      fontSize: '28px', 
      fontWeight: 'bold', 
      lineHeight: '1.2',
      marginBottom: '16px' 
    },
    title_2: { 
      fontSize: '22px', 
      fontWeight: '600', 
      lineHeight: '1.3',
      marginBottom: '12px' 
    },
    title_3: { 
      fontSize: '20px', 
      fontWeight: '600', 
      lineHeight: '1.3',
      marginBottom: '12px' 
    },
    headline: { 
      fontSize: '17px', 
      fontWeight: '600', 
      lineHeight: '1.3' 
    },
    body: { 
      fontSize: '17px', 
      lineHeight: '1.5' 
    },
    callout: { 
      fontSize: '16px', 
      lineHeight: '1.4' 
    },
    subhead: { 
      fontSize: '15px', 
      lineHeight: '1.4' 
    },
    footnote: { 
      fontSize: '13px', 
      color: '#8E8E93',
      lineHeight: '1.4' 
    },
    caption: { 
      fontSize: '12px', 
      color: '#8E8E93',
      lineHeight: '1.3' 
    }
  };

  const finalStyle = {
    ...variants[variant],
    color: color || variants[variant].color || '#000',
    textAlign: align,
    margin: variants[variant].marginBottom ? `0 0 ${variants[variant].marginBottom} 0` : '0',
    ...style
  };

  return (
    <div style={finalStyle}>
      {children}
    </div>
  );
};

export default Text;