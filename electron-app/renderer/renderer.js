const AppController = require('../src/renderer/app-controller');

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AppController();
}); 