import express from 'express';
import auth from '../middleware/auth.js';
import screenshotController from '../controllers/screenshotController.js';

const router = express.Router();

// POST /screenshots - Create a new screenshot
router.post('/', auth, screenshotController.createScreenshot);

// POST /screenshots/batch - Batch create screenshots
router.post('/batch', auth, screenshotController.batchCreateScreenshots);

// GET /screenshots/my - Get current employee's screenshots
router.get('/my', auth, screenshotController.getMyScreenshots);

// GET /screenshots/stats - Get screenshot statistics
router.get('/stats', auth, screenshotController.getScreenshotStats);

// GET /screenshots/orphaned - Get orphaned screenshots (not linked to activities)
router.get('/orphaned', auth, screenshotController.getOrphanedScreenshots);

// Admin routes
// GET /screenshots/admin/all - Get all screenshots (admin only)
router.get('/admin/all', auth, screenshotController.getAllScreenshots);

// GET /screenshots/admin/stats - Get all screenshot statistics (admin only)
router.get('/admin/stats', auth, screenshotController.getAllScreenshotStats);

// GET /screenshots/activity/:activityId - Get screenshots for a specific activity
router.get('/activity/:activityId', auth, screenshotController.getScreenshotsByActivity);

// PUT /screenshots/:screenshotId - Update screenshot metadata
router.put('/:screenshotId', auth, screenshotController.updateScreenshot);

// DELETE /screenshots/:screenshotId - Delete a screenshot
router.delete('/:screenshotId', auth, screenshotController.deleteScreenshot);

// POST /screenshots/activity/:activityId/link - Link screenshots to an activity
router.post('/activity/:activityId/link', auth, screenshotController.linkScreenshotsToActivity);

export default router; 