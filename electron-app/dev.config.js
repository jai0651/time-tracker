// Development configuration for hot reloading
module.exports = {
  // Watch patterns for electron-reloader
  watchRenderer: true,
  debug: true,
  
  // Files to watch for changes
  watchPatterns: [
    'src/**/*',
    'renderer/**/*',
    'main.js',
    'dev.config.js'
  ],
  
  // Ignore patterns
  ignorePatterns: [
    'node_modules/**/*',
    'releases/**/*',
    'dist/**/*',
    '*.log'
  ],
  
  // Development server settings
  devServer: {
    port: 3000,
    host: 'localhost'
  }
}; 