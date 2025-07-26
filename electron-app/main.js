require('dotenv').config();
const ElectronApp = require('./src/main/app');

// Initialize the Electron app
const app = new ElectronApp();
app.initialize(); 