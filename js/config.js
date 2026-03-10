/**
 * Configuration file for Guide System
 * Update these settings to customize the system
 */

const GuideSystemConfig = {
  // Supabase Configuration
  supabase: {
    enabled: false, // Set to true to enable Supabase
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
    bucket: 'guide-media'
  },

  // Media Upload Settings
  media: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    imageQuality: 0.8,
    maxImageWidth: 1920,
    maxImageHeight: 1080,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedVideoTypes: ['video/mp4', 'video/webm']
  },

  // UI Settings
  ui: {
    itemsPerPage: 12,
    animationDuration: 300,
    theme: 'dark' // 'dark' or 'light'
  },

  // Editor Settings
  editor: {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxBlocksPerGuide: 100,
    enablePreview: true
  },

  // Guide Settings
  guides: {
    defaultLanguage: 'en',
    enableComments: false,
    enableRatings: false,
    enableSharing: true
  },

  // API Settings
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // Logging
  logging: {
    enabled: true,
    level: 'info' // 'debug', 'info', 'warn', 'error'
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuideSystemConfig;
}
