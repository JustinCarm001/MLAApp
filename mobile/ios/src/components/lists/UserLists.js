Data// mobile/src/components/lists/UserList.js
import React from 'react';
import Text from '../basic/Text';
import Image from '../basic/Image';
import Button from '../basic/Button';

const UserCard = ({ user, onPress, onFollow, showFollowButton = true }) => {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
      onClick={onPress}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Avatar */}
        <Image 
          src={user.avatar}
          alt={user.name}
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover'
          }}
          borderRadius={25}
          placeholder="👤"
        />

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text variant="headline" style={{ 
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user.name}
          </Text>
          
          <Text variant="footnote" style={{ marginBottom: '4px' }}>
            @{user.username || user.email.split('@')[0]}
          </Text>
          
          <Text variant="caption">
            {user.videoCount || 0} videos • {user.followers || 0} followers
          </Text>
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <Button
            title={user.isFollowing ? "Following" : "Follow"}
            variant={user.isFollowing ? "secondary" : "primary"}
            onPress={(e) => {
              e.stopPropagation();
              onFollow(user.id);
            }}
            style={{ 
              padding: '8px 16px',
              fontSize: '14px'
            }}
          />
        )}
      </div>
    </div>
  );
};

const UserList = ({ 
  users = [], 
  onUserPress, 
  onUserFollow,
  showFollowButton = true,
  emptyMessage = "No users found",
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
        <Text variant="body">Loading users...</Text>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px',
        textAlign: 'center'
      }}>
        <Text variant="headline" style={{ marginBottom: '8px' }}>
          {emptyMessage}
        </Text>
        <Text variant="footnote">
          Try searching for different users
        </Text>
      </div>
    );
  }

  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id}
          user={user}
          onPress={() => onUserPress(user)}
          onFollow={onUserFollow}
          showFollowButton={showFollowButton}
        />
      ))}
    </div>
  );
};

export default UserList;