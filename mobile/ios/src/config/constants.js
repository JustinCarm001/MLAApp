// mobile/src/config/constants.js
export const CONSTANTS = {
  // Storage keys
  STORAGE_KEYS: {
    USER_TOKEN: '@VideoApp:userToken',
    USER_DATA: '@VideoApp:userData',
    THEME_PREFERENCE: '@VideoApp:theme',
    ONBOARDING_COMPLETED: '@VideoApp:onboardingCompleted',
    OFFLINE_VIDEOS: '@VideoApp:offlineVideos'
  },
  
  // File upload
  UPLOAD: {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_FORMATS: ['mp4', 'mov', 'avi', 'mkv', 'm4v'],
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks
    MAX_CONCURRENT_UPLOADS: 3
  },
  
  // Video processing
  PROCESSING: {
    POLL_INTERVAL: 5000, // 5 seconds
    MAX_RETRIES: 10,
    TIMEOUT: 300000 // 5 minutes
  },
  
  // UI Constants
  UI: {
    TAB_BAR_HEIGHT: 80,
    HEADER_HEIGHT: 60,
    GRID_COLUMNS: 2,
    LIST_ITEM_HEIGHT: 100,
    THUMBNAIL_ASPECT_RATIO: 16/9
  },
  
  // Error messages
  ERRORS: {
    NETWORK_ERROR: "Please check your internet connection",
    FILE_TOO_LARGE: "File size exceeds the limit",
    INVALID_FORMAT: "File format not supported",
    UPLOAD_FAILED: "Upload failed. Please try again",
    PROCESSING_FAILED: "Video processing failed",
    LOGIN_FAILED: "Invalid email or password",
    REGISTRATION_FAILED: "Registration failed. Please try again"
  }
};