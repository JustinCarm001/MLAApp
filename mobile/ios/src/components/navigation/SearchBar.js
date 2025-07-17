// mobile/src/components/navigation/SearchBar.js
import React, { useState } from 'react';
import Input from '../basic/Input';
import Icon from '../basic/Icon';
import Text from '../basic/Text';

const SearchBar = ({ 
  placeholder = 'Search...',
  onSearch,
  onChangeText,
  value = '',
  suggestions = [],
  onSuggestionPress,
  showSuggestions = false,
  style = {}
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (text) => {
    onChangeText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    onChangeText('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}>
          <Icon name="search" size={18} color="#8E8E93" />
        </div>
        
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={handleSearch}
          style={{
            paddingLeft: '40px',
            paddingRight: value ? '40px' : '16px',
            backgroundColor: '#F2F2F7',
            border: 'none',
            borderRadius: '12px'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        
        {value && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            zIndex: 1
          }}
          onClick={handleClear}
          >
            <Icon name="close" size={18} color="#8E8E93" />
          </div>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && isFocused && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          zIndex: 100,
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              style={{
                padding: '12px 16px',
                borderBottom: index < suggestions.length - 1 ? '1px solid #F2F2F7' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => onSuggestionPress && onSuggestionPress(suggestion)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F2F2F7'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="search" size={16} color="#8E8E93" />
                <Text variant="callout" style={{ margin: 0 }}>
                  {suggestion}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;