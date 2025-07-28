import api from '../api.js';

class DownloadRepository {
  // Get desktop app download info
  async getDesktopAppInfo() {
    try {
      const response = await api.get('/downloads/desktop-app/info');
      return response.data;
    } catch (error) {
      console.error('Error getting desktop app info:', error);
      throw error;
    }
  }

  // Download desktop app
  async downloadDesktopApp() {
    try {
      const response = await api.get('/downloads/desktop-app', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Time Tracker-1.0.0-arm64.dmg');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading desktop app:', error);
      throw error;
    }
  }

  // Get download URL for direct link
  getDesktopAppDownloadUrl() {
    return `${api.defaults.baseURL}/downloads/desktop-app`;
  }
}

export default new DownloadRepository(); 