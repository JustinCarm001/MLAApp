// mobile/src/components/basic/Icon.js
import React from 'react';

const Icon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  style = {} 
}) => {
  // Simple icon system using Unicode symbols
  const icons = {
    home: '🏠',
    user: '👤',
    search: '🔍',
    upload: '⬆️',
    download: '⬇️',
    play: '▶️',
    pause: '⏸️',
    delete: '🗑️',
    edit: '✏️',
    share: '📤',
    back: '←',
    forward: '→',
    up: '↑',
    down: '↓',
    heart: '❤️',
    star: '⭐',
    settings: '⚙️',
    camera: '📷',
    video: '🎥',
    image: '🖼️',
    check: '✓',
    close: '✕',
    menu: '☰',
    plus: '+',
    minus: '-'
  };

  return (
    <span 
      style={{
        fontSize: `${size}px`,
        color: color,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {icons[name] || name}
    </span>
  );
};

export default Icon;