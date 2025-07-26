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
        baseURL,
        headers
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
    const response = await api.get(`/employees/${userId}`);
    return response.data;
  }

  // Time entries
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