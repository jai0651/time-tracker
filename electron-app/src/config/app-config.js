// Centralized application configuration
const AppConfig = {
  // Screenshot Configuration
  screenshot: {
    // Development: 20 seconds for testing
    // Production: 5 minutes for normal use
    intervalSeconds: 20, // 20 seconds
    intervalMinutes: 0.33, // 20 seconds in minutes
    
    // Image compression settings
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.7, // JPEG quality (0.1 to 1.0)
    
    // Upload settings
    maxPayloadSize: 50 * 1024 * 1024, // 50MB
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Timer Configuration
  timer: {
    updateInterval: 100, // Update timer display every 100ms
    screenshotStatusUpdate: 5000, // Update screenshot status every 5 seconds
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // UI Configuration
  ui: {
    messageTimeout: 5000, // Show messages for 5 seconds
    animationDuration: 300, // CSS transitions
  },
  
  // Development Configuration
  development: {
    hotReload: true,
    debugLogging: true,
    devTools: true,
  }
};

// Helper functions
AppConfig.getScreenshotInterval = () => {
  return AppConfig.screenshot.intervalSeconds;
};

AppConfig.getScreenshotIntervalMinutes = () => {
  return AppConfig.screenshot.intervalMinutes;
};

AppConfig.getScreenshotIntervalDisplay = () => {
  const seconds = AppConfig.screenshot.intervalSeconds;
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  AppConfig.screenshot.intervalSeconds = 300; // 5 minutes
  AppConfig.screenshot.intervalMinutes = 5;
  AppConfig.development.debugLogging = false;
  AppConfig.development.devTools = false;
}

module.exports = AppConfig; 