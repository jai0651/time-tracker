const { BrowserWindow } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.mainWindow = null;
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 700,
      minWidth: 600,
      minHeight: 500,
      resizable: true,
      maximizable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
      titleBarStyle: 'default',
      show: false
    });

    this.setupWindowEvents();
    this.loadRenderer();
    
    return this.mainWindow;
  }

  setupWindowEvents() {
    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      if (process.argv.includes('--dev')) {
        console.log('🚀 Electron app started in development mode');
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  loadRenderer() {
    this.mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  openDevTools() {
    if (this.mainWindow && process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  getMainWindow() {
    return this.mainWindow;
  }

  isWindowOpen() {
    return this.mainWindow !== null;
  }
}

module.exports = WindowManager; 