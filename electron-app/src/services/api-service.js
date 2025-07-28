const { ipcRenderer } = require('electron');
const axios = require('axios');

class ApiService {
  constructor() {
    this.apiClient = null;
    this.authToken = null;
  }

  async createApiClient() {
    if (!this.apiClient) {
      const baseURL = await this.getApiUrl();
      
      this.apiClient = axios.create({
        baseURL: `${baseURL}/api/v1`,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Add request interceptor to always include the token
      this.apiClient.interceptors.request.use((config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      });

      // Add response interceptor for error handling
      this.apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error('API Error:', error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    }
    return this.apiClient;
  }

  async getApiUrl() {
    return await ipcRenderer.invoke('get-api-url');
  }

  setAuthToken(token) {
    this.authToken = token;
    // Reset API client so it will be recreated with the new token
    this.apiClient = null;
  }

  resetApiClient() {
    this.apiClient = null;
    this.authToken = null;
  }

  // Authentication
  async login(email, password) {
    const api = await this.createApiClient();
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  // Employee data
  async getEmployeeData(userId) {
    return this.makeApiCall('get', `/employee/${userId}`);
  }

  // Projects and Tasks (for viewing shift assignments)
  async getProjects() {
    return this.makeApiCall('get', '/project');
  }

  async getTasks(projectId = null) {
    const url = projectId ? `/task?projectId=${projectId}` : '/task';
    return this.makeApiCall('get', url);
  }

  // Shifts - View scheduled shifts (employees don't create shifts)
  async getTodayShifts() {
    return this.makeApiCall('get', '/shift/today');
  }

  async getShifts(userId, options = {}) {
    const params = new URLSearchParams();
    
    if (userId) params.append('employeeId', userId);
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.taskId) params.append('taskId', options.taskId);
    if (options.start) params.append('start', options.start);
    if (options.end) params.append('end', options.end);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const url = `/shift?${params.toString()}`;
    return this.makeApiCall('get', url);
  }

  async getCurrentShift(userId) {
    const url = `/shift?employeeId=${userId}&limit=1`;
    const shifts = await this.makeApiCall('get', url);
    return shifts.length > 0 && !shifts[0].end ? shifts[0] : null;
  }

  // Activities - Work activities during scheduled shifts
  async createActivity(shiftId, description = 'Work activity', startTime = null, endTime = null) {
    const data = { 
      shiftId, 
      description,
      start: startTime || new Date().toISOString(),
      ...(endTime && { end: endTime })
    };
    return this.makeApiCall('post', '/activity', data);
  }

  async endActivity(activityId) {
    return this.makeApiCall('patch', `/activity/${activityId}/end`);
  }

  async getActivities(userId, options = {}) {
    const params = new URLSearchParams();
    
    if (userId) params.append('employeeId', userId);
    if (options.shiftId) params.append('shiftId', options.shiftId);
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.taskId) params.append('taskId', options.taskId);
    if (options.start) params.append('start', options.start);
    if (options.end) params.append('end', options.end);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const url = `/activity?${params.toString()}`;
    return this.makeApiCall('get', url);
  }

  async getCurrentActivity(userId, shiftId) {
    const url = `/activity?employeeId=${userId}&shiftId=${shiftId}&limit=1`;
    const activities = await this.makeApiCall('get', url);
    return activities.length > 0 && !activities[0].end ? activities[0] : null;
  }

  // Legacy time entries (for analytics only)
  async getTimeEntries(userId) {
    const api = await this.createApiClient();
    const response = await api.get(`/time-entries?employeeId=${userId}`);
    return response.data;
  }

  async saveTimeEntry(timeEntryData) {
    const api = await this.createApiClient();
    const response = await api.post('/time-entries', timeEntryData);
    return response.data;
  }

  // Utility methods
  getUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Debug method to check token status
  debugTokenStatus() {
    console.log('Auth Token Status:', {
      hasToken: !!this.authToken,
      tokenLength: this.authToken ? this.authToken.length : 0,
      userId: this.authToken ? this.getUserIdFromToken(this.authToken) : null
    });
  }

  // Test method to verify authentication
  async testAuthentication() {
    try {
      console.log('Testing authentication...');
      this.debugTokenStatus();
      
      // Try to get employee data (this requires authentication)
      const userId = this.getUserIdFromToken(this.authToken);
      if (!userId) {
        console.error('No valid user ID from token');
        return false;
      }
      
      const employee = await this.getEmployeeData(userId);
      console.log('Authentication test successful:', !!employee);
      return true;
    } catch (error) {
      console.error('Authentication test failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Screenshot methods
  async uploadScreenshot(screenshotData) {
    return this.makeApiCall('post', '/screenshots', screenshotData);
  }

  async uploadScreenshotsBatch(screenshotsData) {
    return this.makeApiCall('post', '/screenshots/batch', { screenshots: screenshotsData });
  }

  async getScreenshots(activityId = null, options = {}) {
    const params = new URLSearchParams();
    
    if (activityId) params.append('activityId', activityId);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.hasPermissions !== undefined) params.append('hasPermissions', options.hasPermissions);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const url = activityId ? `/screenshots/activity/${activityId}` : `/screenshots/my?${params.toString()}`;
    return this.makeApiCall('get', url);
  }

  async getScreenshotStats(options = {}) {
    const params = new URLSearchParams();
    
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    
    const url = `/screenshots/stats?${params.toString()}`;
    return this.makeApiCall('get', url);
  }

  async deleteScreenshot(screenshotId) {
    return this.makeApiCall('delete', `/screenshots/${screenshotId}`);
  }

  async updateScreenshot(screenshotId, updateData) {
    return this.makeApiCall('put', `/screenshots/${screenshotId}`, updateData);
  }

  async linkScreenshotsToActivity(screenshotIds, activityId) {
    return this.makeApiCall('post', `/screenshots/activity/${activityId}/link`, { screenshotIds });
  }

  // Enhanced API call with debugging
  async makeApiCall(method, url, data = null) {
    const api = await this.createApiClient();
    
    // Debug token status before making the call
    this.debugTokenStatus();
    
    try {
      const config = {
        method,
        url,
        ...(data && { data })
      };
      
      const startTime = Date.now();
      console.log(`🌐 [${new Date().toISOString()}] Making ${method.toUpperCase()} request to ${url}`);
      
      if (data) {
        const payloadSize = JSON.stringify(data).length;
        console.log(`📦 Payload size: ${(payloadSize / 1024).toFixed(2)} KB`);
      }
      
      const response = await api(config);
      const duration = Date.now() - startTime;
      console.log(`✅ [${new Date().toISOString()}] API call successful: ${method.toUpperCase()} ${url} (${duration}ms)`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [${new Date().toISOString()}] API call failed: ${method.toUpperCase()} ${url} (${duration}ms)`, error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ApiService; 