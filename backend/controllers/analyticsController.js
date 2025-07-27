import analyticsService from '../services/analyticsService.js';

class AnalyticsController {
  
  // Get time tracking analytics
  async getTimeTrackingAnalytics(req, res) {
    try {
      const filters = {
        employeeId: req.query.employeeId,
        projectId: req.query.projectId,
        taskId: req.query.taskId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        teamId: req.query.teamId,
        billable: req.query.billable,
        status: req.query.status,
        limit: req.query.limit || 100,
        offset: req.query.offset || 0,
        sortBy: req.query.sortBy || 'start',
        sortOrder: req.query.sortOrder || 'desc',
        groupBy: req.query.groupBy,
        includeDetails: req.query.includeDetails
      };

      const result = await analyticsService.getTimeTrackingAnalytics(
        filters
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching time tracking analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get employee summary
  async getEmployeeSummary(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        employeeId: req.query.employeeId
      };

      const result = await analyticsService.getEmployeeSummary(
        filters, 
        req.userRole, 
        req.userId
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching employee summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get project summary
  async getProjectSummary(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        projectId: req.query.projectId
      };

      const result = await analyticsService.getProjectSummary(
        filters, 
        req.userRole, 
        req.userId
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching project summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get daily summary
  async getDailySummary(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        employeeId: req.query.employeeId
      };

      const result = await analyticsService.getDailySummary(
        filters, 
        req.userRole, 
        req.userId
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AnalyticsController(); 