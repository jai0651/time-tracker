import api from '../api.js';

// Analytics API Repository
class AnalyticsRepository {
  
  // Get time tracking analytics with filters
  async getTimeTrackingAnalytics(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query parameters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/analytics/time-tracking?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time tracking analytics:', error);
      throw error;
    }
  }

  // Get employee summary
  async getEmployeeSummary(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/analytics/employee-summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee summary:', error);
      throw error;
    }
  }

  // Get project summary
  async getProjectSummary(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/analytics/project-summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project summary:', error);
      throw error;
    }
  }

  // Get daily summary
  async getDailySummary(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/analytics/daily-summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw error;
    }
  }

  // Helper method to format duration for display
  formatDuration(milliseconds) {
    if (!milliseconds) return '00:00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  // Helper method to format duration in hours
  formatDurationHours(milliseconds) {
    if (!milliseconds) return '0.00';
    
    const hours = milliseconds / (1000 * 60 * 60);
    return hours.toFixed(2);
  }

  // Helper method to get date range for common periods
  getDateRange(period = 'thisWeek') {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        now.setDate(now.getDate() - 1);
        now.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        break;
      case 'lastWeek':
        const lastWeek = new Date(start);
        lastWeek.setDate(start.getDate() - 7);
        const lastDay = lastWeek.getDay();
        const lastDiff = lastWeek.getDate() - lastDay + (lastDay === 0 ? -6 : 1);
        lastWeek.setDate(lastDiff);
        lastWeek.setHours(0, 0, 0, 0);
        start.setDate(lastDiff + 6);
        start.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'lastMonth':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const lastMonth = new Date(start);
        lastMonth.setMonth(lastMonth.getMonth() + 1);
        lastMonth.setDate(0);
        lastMonth.setHours(23, 59, 59, 999);
        break;
      case 'thisYear':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }
}

export default new AnalyticsRepository(); 