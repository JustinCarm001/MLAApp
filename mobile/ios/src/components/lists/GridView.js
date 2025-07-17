// mobile/src/components/lists/GridView.js
import React from 'react';
import Text from '../basic/Text';
import Image from '../basic/Image';
import Icon from '../basic/Icon';

const GridItem = ({ item, onPress, type = 'video' }) => {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
      onClick={() => onPress(item)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative' }}>
        <Image 
          src={item.thumbnail}
          alt={item.title}
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover'
          }}
          placeholder="No image"
        />
        
        {type === 'video' && (
          <>
            {/* Play overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30px',
              height: '30px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon name="play" size={16} color="white" />
            </div>
            
            {/* Duration */}
            {item.duration && (
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '10px',
                padding: '2px 4px',
                borderRadius: '3px'
              }}>
                {item.duration}
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px' }}>
        <Text variant="subhead" style={{ 
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.title}
        </Text>
        
        <Text variant="caption">
          {type === 'video' ? `${item.views} views` : item.subtitle}
        </Text>
      </div>
    </div>
  );
};

const GridView = ({ 
  items = [], 
  onItemPress,
  columns = 2,
  type = 'video',
  emptyMessage = "No items found",
  loading = false
}) => {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px'
      }}>
        <Text variant="body">Loading...</Text>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px',
        textAlign: 'center'
      }}>
        <Icon 
          name={type === 'video' ? 'video' : 'image'} 
          size={48} 
          color="#8E8E93" 
          style={{ marginBottom: '16px' }} 
        />
        <Text variant="headline" style={{ marginBottom: '8px' }}>
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '12px',
      padding: '8px'
    }}>
      {items.map(item => (
        <GridItem 
          key={item.id}
          item={item}
          onPress={onItemPress}
          type={type}
        />
      ))}
    </div>
  );
};

export default GridView;