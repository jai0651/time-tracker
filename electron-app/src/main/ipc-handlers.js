const { ipcMain } = require('electron');

class IPCHandlers {
  constructor() {
    this.handlers = new Map();
  }

  registerHandlers() {
    this.registerHandler('get-api-url', this.handleGetApiUrl.bind(this));
    this.registerHandler('get-app-version', this.handleGetAppVersion.bind(this));
    this.registerHandler('get-platform', this.handleGetPlatform.bind(this));
    this.registerHandler('check-screen-permissions', this.handleCheckScreenPermissions.bind(this));
    this.registerHandler('request-screen-permissions', this.handleRequestScreenPermissions.bind(this));
    this.registerHandler('capture-screenshot', this.handleCaptureScreenshot.bind(this));
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

  async handleCheckScreenPermissions() {
    try {
      const { desktopCapturer } = require('electron');
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 100, height: 100 }
      });
      return sources.length > 0;
    } catch (error) {
      console.error('Screen permission check failed:', error);
      return false;
    }
  }

  async handleRequestScreenPermissions() {
    try {
      const { desktopCapturer, dialog } = require('electron');
      
      // First try to get sources to see if we already have permission
      try {
        const sources = await desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: { width: 100, height: 100 }
        });
        
        if (sources.length > 0) {
          return { granted: true, message: 'Permission already granted' };
        }
      } catch (error) {
        // Permission not granted, proceed to request
      }

      // Show dialog to user explaining the need for screen recording permission
      const result = await dialog.showMessageBox({
        type: 'info',
        title: 'Screen Recording Permission Required',
        message: 'Time Tracker needs screen recording permission to capture screenshots during your work activities.',
        detail: 'This helps provide visual context for your time tracking. Screenshots are only taken when you are actively working and are uploaded securely to your organization.',
        buttons: ['Grant Permission', 'Deny Permission', 'Learn More'],
        defaultId: 0,
        cancelId: 1
      });

      if (result.response === 0) {
        // User chose to grant permission
        // On macOS, this will trigger the system permission dialog
        try {
          const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 100, height: 100 }
          });
          
          if (sources.length > 0) {
            return { granted: true, message: 'Permission granted successfully' };
          } else {
            return { granted: false, message: 'Permission was denied by the system' };
          }
        } catch (error) {
          return { granted: false, message: 'Permission was denied by the system' };
        }
      } else if (result.response === 1) {
        // User explicitly denied permission
        return { granted: false, message: 'Permission denied by user' };
      } else {
        // User chose "Learn More"
        return { granted: false, message: 'User requested more information' };
      }
    } catch (error) {
      console.error('Error requesting screen permissions:', error);
      return { granted: false, message: 'Error requesting permission' };
    }
  }

  async handleCaptureScreenshot() {
    try {
      const { desktopCapturer } = require('electron');
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 800, height: 600 } // Smaller initial size for better performance
      });

      if (sources.length === 0) {
        throw new Error('No screen sources found');
      }

      const source = sources[0];
      const hasPermissions = await this.handleCheckScreenPermissions();
      
      return {
        imageUrl: source.thumbnail.toDataURL(),
        fileName: `screenshot_${Date.now()}.jpg`, // Changed to jpg for compression
        fileSize: this.getDataURLSize(source.thumbnail.toDataURL()),
        mimeType: 'image/jpeg', // Changed to jpeg for compression
        width: source.thumbnail.getSize().width,
        height: source.thumbnail.getSize().height,
        hasPermissions: hasPermissions,
        permissionError: hasPermissions ? null : 'Screen recording permission denied',
        capturedAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  getDataURLSize(dataURL) {
    const base64 = dataURL.split(',')[1];
    return Math.ceil((base64.length * 3) / 4);
  }

  cleanup() {
    this.handlers.forEach((handler, channel) => {
      ipcMain.removeHandler(channel);
    });
    this.handlers.clear();
  }
}

module.exports = IPCHandlers; 