import screenshotService from '../services/screenshotService.js';

class ScreenshotController {
  
  // Create a new screenshot
  async createScreenshot(req, res) {
    try {
      const {
        activityId,
        imageUrl,
        thumbnailUrl,
        fileName,
        fileSize,
        mimeType,
        width,
        height,
        hasPermissions,
        permissionError,
        capturedAt,
        uploadedAt
      } = req.body;

      if (!imageUrl || !fileName || !fileSize || !mimeType) {
        return res.status(400).json({ 
          error: 'Missing required fields: imageUrl, fileName, fileSize, mimeType' 
        });
      }

      const screenshotData = {
        activityId,
        employeeId: req.userId,
        imageUrl,
        thumbnailUrl,
        fileName,
        fileSize: parseInt(fileSize),
        mimeType,
        width: parseInt(width) || 0,
        height: parseInt(height) || 0,
        hasPermissions: hasPermissions || false,
        permissionError,
        capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
        uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date()
      };

      const screenshot = await screenshotService.createScreenshot(screenshotData);
      
      res.status(201).json(screenshot);
    } catch (error) {
      console.error('Error creating screenshot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get screenshots for an activity
  async getScreenshotsByActivity(req, res) {
    try {
      const { activityId } = req.params;
      
      if (!activityId) {
        return res.status(400).json({ error: 'Activity ID is required' });
      }

      const screenshots = await screenshotService.getScreenshotsByActivity(
        activityId, 
        req.userId
      );
      
      res.json({ screenshots });
    } catch (error) {
      console.error('Error fetching screenshots by activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get screenshots for current employee
  async getMyScreenshots(req, res) {
    try {
      const filters = {
        activityId: req.query.activityId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        hasPermissions: req.query.hasPermissions,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await screenshotService.getScreenshotsByEmployee(
        req.userId, 
        filters
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching employee screenshots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get screenshot statistics
  async getScreenshotStats(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const stats = await screenshotService.getScreenshotStats(
        req.userId, 
        filters
      );
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching screenshot stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Get all screenshots (for admin users)
  async getAllScreenshots(req, res) {
    try {
      const filters = {
        employeeId: req.query.employeeId,
        activityId: req.query.activityId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        hasPermissions: req.query.hasPermissions,
        minFileSize: req.query.minFileSize,
        sortBy: req.query.sortBy || 'capturedAt',
        sortOrder: req.query.sortOrder || 'desc',
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await screenshotService.getAllScreenshots(filters);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching all screenshots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Get screenshot statistics for all employees
  async getAllScreenshotStats(req, res) {
    try {
      const filters = {
        employeeId: req.query.employeeId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const stats = await screenshotService.getAllScreenshotStats(filters);
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching all screenshot stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete a screenshot
  async deleteScreenshot(req, res) {
    try {
      const { screenshotId } = req.params;
      
      if (!screenshotId) {
        return res.status(400).json({ error: 'Screenshot ID is required' });
      }

      const result = await screenshotService.deleteScreenshot(
        screenshotId, 
        req.userId
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: 'Screenshot not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Update screenshot metadata
  async updateScreenshot(req, res) {
    try {
      const { screenshotId } = req.params;
      const updateData = req.body;
      
      if (!screenshotId) {
        return res.status(400).json({ error: 'Screenshot ID is required' });
      }

      const screenshot = await screenshotService.updateScreenshot(
        screenshotId, 
        req.userId, 
        updateData
      );
      
      res.json(screenshot);
    } catch (error) {
      console.error('Error updating screenshot:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: 'Screenshot not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Link screenshots to an activity
  async linkScreenshotsToActivity(req, res) {
    try {
      const { activityId } = req.params;
      const { screenshotIds } = req.body;
      
      if (!activityId) {
        return res.status(400).json({ error: 'Activity ID is required' });
      }

      if (!screenshotIds || !Array.isArray(screenshotIds)) {
        return res.status(400).json({ error: 'screenshotIds array is required' });
      }

      const result = await screenshotService.linkScreenshotsToActivity(
        screenshotIds, 
        activityId, 
        req.userId
      );
      
      res.json({
        success: true,
        linkedCount: result.count,
        message: `Linked ${result.count} screenshots to activity`
      });
    } catch (error) {
      console.error('Error linking screenshots to activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get orphaned screenshots (not linked to any activity)
  async getOrphanedScreenshots(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await screenshotService.getOrphanedScreenshots(
        req.userId, 
        filters
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching orphaned screenshots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Batch create screenshots (for bulk upload)
  async batchCreateScreenshots(req, res) {
    try {
      const { screenshots } = req.body;
      
      if (!screenshots || !Array.isArray(screenshots)) {
        return res.status(400).json({ error: 'screenshots array is required' });
      }

      const createdScreenshots = [];
      const errors = [];

      for (const screenshotData of screenshots) {
        try {
          const {
            activityId,
            imageUrl,
            thumbnailUrl,
            fileName,
            fileSize,
            mimeType,
            width,
            height,
            hasPermissions,
            permissionError,
            capturedAt,
            uploadedAt
          } = screenshotData;

          if (!imageUrl || !fileName || !fileSize || !mimeType) {
            errors.push({
              index: screenshots.indexOf(screenshotData),
              error: 'Missing required fields'
            });
            continue;
          }

          const data = {
            activityId,
            employeeId: req.userId,
            imageUrl,
            thumbnailUrl,
            fileName,
            fileSize: parseInt(fileSize),
            mimeType,
            width: parseInt(width) || 0,
            height: parseInt(height) || 0,
            hasPermissions: hasPermissions || false,
            permissionError,
            capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
            uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date()
          };

          const screenshot = await screenshotService.createScreenshot(data);
          createdScreenshots.push(screenshot);
        } catch (error) {
          errors.push({
            index: screenshots.indexOf(screenshotData),
            error: error.message
          });
        }
      }

      res.status(201).json({
        created: createdScreenshots,
        errors: errors,
        summary: {
          total: screenshots.length,
          created: createdScreenshots.length,
          errors: errors.length
        }
      });
    } catch (error) {
      console.error('Error batch creating screenshots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ScreenshotController(); 