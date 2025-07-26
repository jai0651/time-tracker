const { ipcMain } = require('electron');

class IPCHandlers {
  constructor() {
    this.handlers = new Map();
  }

  registerHandlers() {
    this.registerHandler('get-api-url', this.handleGetApiUrl.bind(this));
    this.registerHandler('get-app-version', this.handleGetAppVersion.bind(this));
    this.registerHandler('get-platform', this.handleGetPlatform.bind(this));
  }

  registerHandler(channel, handler) {
    if (this.handlers.has(channel)) {
      ipcMain.removeHandler(channel);
    }
    
    ipcMain.handle(channel, handler);
    this.handlers.set(channel, handler);
  }

  handleGetApiUrl() {
    return process.env.API_URL || 'http://localhost:3000';
  }

  handleGetAppVersion() {
    return require('../../package.json').version;
  }

  handleGetPlatform() {
    return process.platform;
  }

  cleanup() {
    this.handlers.forEach((handler, channel) => {
      ipcMain.removeHandler(channel);
    });
    this.handlers.clear();
  }
}

module.exports = IPCHandlers; 