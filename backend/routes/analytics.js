import express from 'express';
import auth from '../middleware/auth.js';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// GET /analytics/time-tracking - Get time tracking analytics with filters
router.get('/time-tracking', auth, analyticsController.getTimeTrackingAnalytics);

// GET /analytics/employee-summary - Get employee time summary
router.get('/employee-summary', auth, analyticsController.getEmployeeSummary);

// GET /analytics/project-summary - Get project time summary
router.get('/project-summary', auth, analyticsController.getProjectSummary);

// GET /analytics/daily-summary - Get daily time summary
router.get('/daily-summary', auth, analyticsController.getDailySummary);

export default router; 