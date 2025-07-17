// mobile/src/components/lists/VideoList.js
import React, { useState } from 'react';
import Text from '../basic/Text';
import Image from '../basic/Image';
import Icon from '../basic/Icon';

const VideoCard = ({ video, onPress, onDelete, showActions = false }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'processed': return '#34C759';
      case 'processing': return '#FF9500';
      case 'failed': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'processed': return 'Ready';
      case 'processing': return 'Processing...';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
      onClick={onPress}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative' }}>
          <Image 
            src={video.thumbnail}
            alt={video.title}
            style={{
              width: '100px',
              height: '70px',
              objectFit: 'cover'
            }}
            borderRadius={8}
            placeholder="No thumbnail"
          />
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
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '12px',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {video.duration}
          </div>
        </div>

        {/* Video Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text variant="headline" style={{ 
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {video.title}
          </Text>
          
          <Text variant="footnote" style={{ marginBottom: '8px' }}>
            {video.views} views • {new Date(video.uploadDate).toLocaleDateString()}
          </Text>
          
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(video.status)
              }}
            />
            <Text variant="caption">
              {getStatusText(video.status)}
            </Text>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Icon 
              name="delete" 
              size={20} 
              color="#FF3B30"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video.id);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const VideoList = ({ 
  videos = [], 
  onVideoPress, 
  onVideoDelete,
  showActions = false,
  emptyMessage = "No videos found",
  loading = false
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px'
      }}>
        <Text variant="body">Loading videos...</Text>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px',
        textAlign: 'center'
      }}>
        <Icon name="video" size={48} color="#8E8E93" style={{ marginBottom: '16px' }} />
        <Text variant="headline" style={{ marginBottom: '8px' }}>
          {emptyMessage}
        </Text>
        <Text variant="footnote">
          Upload your first video to get started
        </Text>
      </div>
    );
  }

  return (
    <div>
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div style={{ 
          textAlign: 'center', 
          padding: '16px',
          color: '#007AFF'
        }}>
          <Text variant="footnote">Refreshing...</Text>
        </div>
      )}

      {/* Video list */}
      {videos.map(video => (
        <VideoCard 
          key={video.id}
          video={video}
          onPress={() => onVideoPress(video)}
          onDelete={onVideoDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default VideoList;