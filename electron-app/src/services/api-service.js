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
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header if token exists
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      this.apiClient = axios.create({
        baseURL: `${baseURL}/api/v1`,
        headers
      });

      // Add request interceptor for token
      this.apiClient.interceptors.request.use((config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      });
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
  }

  // Authentication
  async login(email, password) {
    const api = await this.createApiClient();
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  // Employee data
  async getEmployeeData(userId) {
    const api = await this.createApiClient();
    console.log('Making API call with token:', this.authToken ? 'Present' : 'Missing');
    const response = await api.get(`/employee/${userId}`);
    return response.data;
  }

  // Projects and Tasks (for viewing shift assignments)
  async getProjects() {
    const api = await this.createApiClient();
    const response = await api.get('/project');
    return response.data;
  }

  async getTasks(projectId = null) {
    const api = await this.createApiClient();
    const params = projectId ? `?projectId=${projectId}` : '';
    const response = await api.get(`/task${params}`);
    return response.data;
  }

  // Shifts - View scheduled shifts (employees don't create shifts)
  async getTodayShifts() {
    const api = await this.createApiClient();
    const response = await api.get('/shift/today');
    return response.data;
  }

  async getShifts(userId, options = {}) {
    const api = await this.createApiClient();
    const params = new URLSearchParams();
    
    if (userId) params.append('employeeId', userId);
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.taskId) params.append('taskId', options.taskId);
    if (options.start) params.append('start', options.start);
    if (options.end) params.append('end', options.end);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/shift?${params.toString()}`);
    return response.data;
  }

  async getCurrentShift(userId) {
    const api = await this.createApiClient();
    const response = await api.get(`/shift?employeeId=${userId}&limit=1`);
    const shifts = response.data;
    return shifts.length > 0 && !shifts[0].end ? shifts[0] : null;
  }

  // Activities - Work activities during scheduled shifts
  async createActivity(shiftId, description = 'Work activity') {
    const api = await this.createApiClient();
    const response = await api.post('/activity', { 
      shiftId, 
      description,
      start: new Date().toISOString()
    });
    return response.data;
  }

  async endActivity(activityId) {
    const api = await this.createApiClient();
    const response = await api.patch(`/activity/${activityId}/end`);
    return response.data;
  }

  async getActivities(userId, options = {}) {
    const api = await this.createApiClient();
    const params = new URLSearchParams();
    
    if (userId) params.append('employeeId', userId);
    if (options.shiftId) params.append('shiftId', options.shiftId);
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.taskId) params.append('taskId', options.taskId);
    if (options.start) params.append('start', options.start);
    if (options.end) params.append('end', options.end);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const response = await api.get(`/activity?${params.toString()}`);
    return response.data;
  }

  async getCurrentActivity(userId, shiftId) {
    const api = await this.createApiClient();
    const response = await api.get(`/activity?employeeId=${userId}&shiftId=${shiftId}&limit=1`);
    const activities = response.data;
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
}

module.exports = ApiService; 