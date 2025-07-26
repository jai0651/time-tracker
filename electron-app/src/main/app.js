const { app } = require('electron');
const WindowManager = require('./window');
const IPCHandlers = require('./ipc-handlers');

class ElectronApp {
  constructor() {
    this.windowManager = new WindowManager();
    this.ipcHandlers = new IPCHandlers();
    this.isDevelopment = process.argv.includes('--dev');
  }

  initialize() {
    this.setupHotReloading();
    this.setupAppEvents();
    this.ipcHandlers.registerHandlers();
  }

  setupHotReloading() {
    if (this.isDevelopment) {
      try {
        const devConfig = require('../../dev.config');
        require('electron-reloader')(module, {
          debug: devConfig.debug,
          watchRenderer: devConfig.watchRenderer,
          ignore: devConfig.ignorePatterns
        });
        console.log('🔥 Hot reloading enabled for development');
      } catch (error) {
        console.log('⚠️  Hot reloading not available:', error.message);
      }
    }
  }

  setupAppEvents() {
    // This method will be called when Electron has finished initialization
    app.whenReady().then(() => {
      this.createMainWindow();
    });

    // Quit when all windows are closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (!this.windowManager.isWindowOpen()) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  createMainWindow() {
    this.windowManager.createMainWindow();
    this.windowManager.openDevTools();
  }

  cleanup() {
    this.ipcHandlers.cleanup();
  }
}

module.exports = ElectronApp; 