const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const ApiService = require('./api-service');

class ScreenshotService {
  constructor() {
    this.apiService = new ApiService();
    this.screenshotInterval = null;
    this.screenshotIntervalMinutes = 0.33; // Default: take screenshot every 20 seconds (for development)
    this.isCapturing = false;
    this.screenshotQueue = [];
    this.uploadQueue = [];
    
  }


  // Start screenshot capture for an activity
  async startScreenshotCapture(activityId) {
    if (this.isCapturing) {
      console.log('Screenshot capture already running');
      return;
    }

    // Check and request permissions first
    const hasPermissions = await this.checkScreenRecordingPermissions();
    if (!hasPermissions) {
      console.log('No screen recording permissions, requesting from user...');
      const permissionResult = await this.requestScreenPermissions();
      
      if (!permissionResult.granted) {
        console.log('Permission denied:', permissionResult.message);
        // Still start capture but with permission flag set to false
        this.permissionDenied = true;
        this.permissionError = permissionResult.message;
      } else {
        console.log('Permission granted:', permissionResult.message);
        this.permissionDenied = false;
        this.permissionError = null;
      }
    } else {
      this.permissionDenied = false;
      this.permissionError = null;
    }

    this.isCapturing = true;
    this.currentActivityId = activityId;
    this.screenshotCount = 0;
    
    console.log(`Starting screenshot capture for activity ${activityId}`);
    
    // Take initial screenshot
    await this.captureAndUploadScreenshot(activityId);
    
    // Set up interval for periodic screenshots
    this.screenshotInterval = setInterval(async () => {
      if (this.isCapturing) {
        await this.captureAndUploadScreenshot(activityId);
      }
    }, this.screenshotIntervalMinutes * 60 * 1000);
  }

  // Stop screenshot capture
  stopScreenshotCapture() {
    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
      this.screenshotInterval = null;
    }
    
    this.isCapturing = false;
    this.currentActivityId = null;
    
    console.log('Screenshot capture stopped');
  }

  // Set screenshot interval (in minutes)
  setScreenshotInterval(minutes) {
    this.screenshotIntervalMinutes = minutes;
    console.log(`Screenshot interval set to ${minutes} minutes`);
  }

  // Capture screenshot and upload to backend
  async captureAndUploadScreenshot(activityId) {
    try {
      console.log('Capturing screenshot...');
      
      const screenshotData = await this.captureScreenshot();
      if (!screenshotData) {
        console.log('Failed to capture screenshot');
        return;
      }

      // Add activity ID to screenshot data
      screenshotData.activityId = activityId;
      
      // Upload to backend
      const uploadResult = await this.uploadScreenshot(screenshotData);
      
      // Increment screenshot count only if upload was successful
      if (uploadResult && uploadResult.id) {
        this.screenshotCount++;
        console.log('Screenshot captured and uploaded successfully');
      } else {
        console.log('Screenshot captured but upload was skipped');
      }
    } catch (error) {
      console.error('Error capturing/uploading screenshot:', error);
      // Don't increment count on error
    }
  }

  // Capture screenshot using IPC call to main process
  async captureScreenshot() {
    try {
      const screenshotData = await ipcRenderer.invoke('capture-screenshot');
      
      // Override permission status based on our stored permission state
      if (this.permissionDenied) {
        screenshotData.hasPermissions = false;
        screenshotData.permissionError = this.permissionError || 'Screen recording permission denied';
      }
      
      // Compress the image data to reduce payload size
      screenshotData.imageUrl = await this.compressImageData(screenshotData.imageUrl);
      screenshotData.fileSize = this.getDataURLSize(screenshotData.imageUrl);
      
      return screenshotData;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      
      // If permission denied or any error, create a placeholder screenshot
      return {
        imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        fileName: `screenshot_${Date.now()}_no_permission.png`,
        fileSize: 95,
        mimeType: 'image/png',
        width: 1,
        height: 1,
        hasPermissions: this.permissionDenied ? false : true,
        permissionError: this.permissionError || 'Screen recording permission denied',
        capturedAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString()
      };
    }
  }

  // Compress image data to reduce payload size
  async compressImageData(dataUrl) {
    try {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Set canvas size to a reasonable size (max 800x600 for compression)
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress the image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG (0.7 quality for good compression)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          // If compression fails, return original data
          resolve(dataUrl);
        };
        
        img.src = dataUrl;
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      return dataUrl; // Return original if compression fails
    }
  }

  // Check if the app has screen recording permissions
  async checkScreenRecordingPermissions() {
    try {
      return await ipcRenderer.invoke('check-screen-permissions');
    } catch (error) {
      console.error('Screen recording permission check failed:', error);
      return false;
    }
  }

  // Request screen recording permissions from user
  async requestScreenPermissions() {
    try {
      const result = await ipcRenderer.invoke('request-screen-permissions');
      return result;
    } catch (error) {
      console.error('Error requesting screen permissions:', error);
      return { granted: false, message: 'Error requesting permission' };
    }
  }

  // Calculate size of data URL in bytes
  getDataURLSize(dataURL) {
    // Remove data URL prefix to get base64 string
    const base64 = dataURL.split(',')[1];
    // Calculate size: base64 is 4/3 the size of the original data
    return Math.ceil((base64.length * 3) / 4);
  }

  // Upload screenshot to backend
  async uploadScreenshot(screenshotData) {
    try {
      // Check if the payload is too large
      const payloadSize = JSON.stringify(screenshotData).length;
      const maxSize = 50 * 1024 * 1024; // 50MB limit
      
      console.log(`📸 [${new Date().toISOString()}] Uploading screenshot (${(payloadSize / 1024).toFixed(2)} KB)`);
      
      if (payloadSize > maxSize) {
        console.warn('⚠️ Screenshot payload too large, skipping upload:', payloadSize, 'bytes');
        return {
          id: `local_${Date.now()}`,
          message: 'Screenshot too large, stored locally only'
        };
      }
      
      const startTime = Date.now();
      const result = await this.apiService.uploadScreenshot(screenshotData);
      const duration = Date.now() - startTime;
      console.log(`✅ [${new Date().toISOString()}] Screenshot uploaded successfully: ${result.id} (${duration}ms)`);
      return result;
    } catch (error) {
      console.error('❌ Failed to upload screenshot:', error);
      
      // If it's a payload too large error, log it but don't throw
      if (error.response && error.response.status === 413) {
        console.warn('⚠️ Screenshot payload too large for server, skipping upload');
        return {
          id: `local_${Date.now()}`,
          message: 'Screenshot too large for server'
        };
      }
      
      throw error;
    }
  }

  // Upload multiple screenshots in batch
  async uploadScreenshotsBatch(screenshotsData) {
    try {
      const result = await this.apiService.uploadScreenshotsBatch(screenshotsData);
      console.log(`Batch uploaded ${result.created.length} screenshots`);
      return result;
    } catch (error) {
      console.error('Failed to upload screenshots batch:', error);
      throw error;
    }
  }

  // Get screenshots for an activity
  async getScreenshots(activityId, options = {}) {
    try {
      return await this.apiService.getScreenshots(activityId, options);
    } catch (error) {
      console.error('Failed to get screenshots:', error);
      throw error;
    }
  }

  // Get screenshot statistics
  async getScreenshotStats(options = {}) {
    try {
      return await this.apiService.getScreenshotStats(options);
    } catch (error) {
      console.error('Failed to get screenshot stats:', error);
      throw error;
    }
  }

  // Delete a screenshot
  async deleteScreenshot(screenshotId) {
    try {
      return await this.apiService.deleteScreenshot(screenshotId);
    } catch (error) {
      console.error('Failed to delete screenshot:', error);
      throw error;
    }
  }

  // Update screenshot metadata
  async updateScreenshot(screenshotId, updateData) {
    try {
      return await this.apiService.updateScreenshot(screenshotId, updateData);
    } catch (error) {
      console.error('Failed to update screenshot:', error);
      throw error;
    }
  }

  // Link screenshots to an activity
  async linkScreenshotsToActivity(screenshotIds, activityId) {
    try {
      return await this.apiService.linkScreenshotsToActivity(screenshotIds, activityId);
    } catch (error) {
      console.error('Failed to link screenshots to activity:', error);
      throw error;
    }
  }

  // Set API service (for dependency injection)
  setApiService(apiService) {
    this.apiService = apiService;
  }

  // Get current capture status
  getCaptureStatus() {
    return {
      isCapturing: this.isCapturing,
      currentActivityId: this.currentActivityId,
      intervalMinutes: this.screenshotIntervalMinutes,
      screenshotCount: this.screenshotCount || 0,
      hasPermissions: !this.permissionDenied,
      permissionError: this.permissionError
    };
  }

  // Cleanup resources
  cleanup() {
    this.stopScreenshotCapture();
  }
}

module.exports = ScreenshotService; 