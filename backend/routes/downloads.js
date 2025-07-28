import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve Electron app downloads
router.get('/desktop-app', (req, res) => {
  try {
    // Path to the built Electron app
    const appPath = path.join(__dirname, '../../electron-app/releases/Time Tracker-1.0.0-arm64.dmg');
    
    // Check if file exists
    if (!fs.existsSync(appPath)) {
      return res.status(404).json({ 
        error: 'Desktop app not found. Please contact administrator.' 
      });
    }

    // Get file stats
    const stat = fs.statSync(appPath);
    const fileSize = stat.size;
    const fileName = 'Time Tracker-1.0.0-arm64.dmg';

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'no-cache');

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(appPath);
    fileStream.pipe(res);

    // Handle errors
    fileStream.on('error', (error) => {
      console.error('Error serving desktop app:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to serve desktop app' });
      }
    });

  } catch (error) {
    console.error('Error serving desktop app:', error);
    res.status(500).json({ error: 'Failed to serve desktop app' });
  }
});

// Get download info (file size, version, etc.)
router.get('/desktop-app/info', (req, res) => {
  try {
    const appPath = path.join(__dirname, '../../electron-app/releases/Time Tracker-1.0.0-arm64.dmg');
    
    if (!fs.existsSync(appPath)) {
      return res.status(404).json({ 
        error: 'Desktop app not found' 
      });
    }

    const stat = fs.statSync(appPath);
    const fileSize = stat.size;
    
    res.json({
      fileName: 'Time Tracker-1.0.0-arm64.dmg',
      fileSize: fileSize,
      fileSizeFormatted: formatFileSize(fileSize),
      version: '1.0.0',
      platform: 'macOS (ARM64)',
      lastModified: stat.mtime,
      downloadUrl: '/api/v1/downloads/desktop-app'
    });

  } catch (error) {
    console.error('Error getting download info:', error);
    res.status(500).json({ error: 'Failed to get download info' });
  }
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router; 