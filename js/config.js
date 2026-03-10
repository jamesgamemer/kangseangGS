/**
 * Configuration file for Guide System
 * Update these settings to customize the system
 */

const GuideSystemConfig = {
  supabase: {
    enabled: true,
    url: 'https://gzlkdxigiejwwxewyikq.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGtkeGlnaWVqd3d4ZXd5aWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjU2NzMsImV4cCI6MjA4ODU0MTY3M30.62lXidTteew5WB2r3kmm6zqBVHB_6AHLz-vWwj3rRrs',
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
