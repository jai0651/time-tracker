import api from '../api.js';

class ScreenshotRepository {
  // Get current user's screenshots
  async getMyScreenshots(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.hasPermissions !== undefined && filters.hasPermissions !== '') {
      params.append('hasPermissions', filters.hasPermissions);
    }
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const response = await api.get(`/screenshots/my?${params.toString()}`);
    return response.data;
  }

  // Get screenshots for a specific activity
  async getScreenshotsByActivity(activityId) {
    const response = await api.get(`/screenshots/activity/${activityId}`);
    return response.data;
  }

  // Get screenshot statistics
  async getScreenshotStats(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/screenshots/stats?${params.toString()}`);
    return response.data;
  }

  // Get orphaned screenshots (not linked to activities)
  async getOrphanedScreenshots(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const response = await api.get(`/screenshots/orphaned?${params.toString()}`);
    return response.data;
  }

  // Delete a screenshot
  async deleteScreenshot(screenshotId) {
    const response = await api.delete(`/screenshots/${screenshotId}`);
    return response.data;
  }

  // Update screenshot metadata
  async updateScreenshot(screenshotId, updateData) {
    const response = await api.put(`/screenshots/${screenshotId}`, updateData);
    return response.data;
  }

  // Link screenshots to an activity
  async linkScreenshotsToActivity(screenshotIds, activityId) {
    const response = await api.post(`/screenshots/activity/${activityId}/link`, {
      screenshotIds
    });
    return response.data;
  }

  // Admin: Get all screenshots (for admin users)
  async getAllScreenshots(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.activityId) params.append('activityId', filters.activityId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.hasPermissions !== undefined && filters.hasPermissions !== '') {
      params.append('hasPermissions', filters.hasPermissions);
    }
    if (filters.minFileSize) params.append('minFileSize', filters.minFileSize);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const response = await api.get(`/screenshots/admin/all?${params.toString()}`);
    return response.data;
  }

  // Admin: Get all screenshot statistics (for admin users)
  async getAllScreenshotStats(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/screenshots/admin/stats?${params.toString()}`);
    return response.data;
  }
}

export default new ScreenshotRepository(); 