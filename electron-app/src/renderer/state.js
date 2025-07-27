class AppState {
  constructor() {
    this.token = this.loadTokenFromStorage();
    this.isTimerRunning = false;
    this.startTime = null;
    this.endTime = null;
    this.currentSession = null;
    this.timerSessions = []; // Array to store multiple sessions
    this.totalElapsedTime = 0; // Total accumulated time
    this.employee = null;
    this.currentShift = null;
    this.currentActivity = null;
    this.shifts = [];
    this.activities = [];
    
    // Performance optimizations
    this.lastTimerUpdate = 0;
    this.TIMER_UPDATE_THRESHOLD = 100;
    this.animationFrameId = null;
  }

  // Token persistence with validation
  loadTokenFromStorage() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Validate token format (basic check)
        const parts = token.split('.');
        if (parts.length === 3) {
          return token;
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
    }
    return null;
  }

  // Token management
  setToken(token) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  getToken() {
    return this.token;
  }

  // Check if token is valid (not expired)
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired (with 5 minute buffer)
      if (payload.exp && payload.exp < (currentTime + 300)) {
        this.clearInvalidToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.clearInvalidToken();
      return false;
    }
  }

  // Get user ID from token
  getUserIdFromToken() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Timer state
  startTimer() {
    this.isTimerRunning = true;
    this.startTime = new Date();
    this.endTime = null;
    this.currentSession = {
      startTime: this.startTime,
      startTimestamp: this.startTime.getTime(),
      id: Date.now() // Unique session ID
    };
  }

  stopTimer() {
    if (!this.isTimerRunning || !this.currentSession) return null;
    
    this.endTime = new Date();
    this.currentSession.endTime = this.endTime;
    this.currentSession.endTimestamp = this.endTime.getTime();
    this.currentSession.duration = this.endTime.getTime() - this.currentSession.startTimestamp;
    
    // Add session to sessions array
    this.timerSessions.push({ ...this.currentSession });
    
    // Update total elapsed time
    this.totalElapsedTime += this.currentSession.duration;
    
    this.isTimerRunning = false;
    this.currentSession = null;
    
    return {
      sessionId: this.currentSession?.id,
      startTs: this.currentSession?.startTimestamp,
      endTs: this.endTime.getTime(),
      duration: this.currentSession?.duration,
      totalElapsed: this.totalElapsedTime
    };
  }

  // Get current session elapsed time (for display)
  getCurrentSessionElapsed() {
    if (!this.isTimerRunning || !this.currentSession) {
      return 0;
    }
    const now = new Date();
    return now.getTime() - this.currentSession.startTimestamp;
  }

  // Get total elapsed time including current session
  getTotalElapsedTime() {
    let total = this.totalElapsedTime;
    if (this.isTimerRunning && this.currentSession) {
      total += this.getCurrentSessionElapsed();
    }
    return total;
  }

  // Clear all sessions (when activity is saved)
  clearTimerSessions() {
    this.timerSessions = [];
    this.totalElapsedTime = 0;
    this.currentSession = null;
    this.isTimerRunning = false;
    this.startTime = null;
    this.endTime = null;
  }

  // Employee data
  setEmployeeData(employee) {
    this.employee = employee;
  }

  // Shift management (employees view scheduled shifts)
  setCurrentShift(shift) {
    this.currentShift = shift;
  }

  getCurrentShift() {
    return this.currentShift;
  }

  hasSelectedShift() {
    return this.currentShift !== null;
  }

  // Timer controls
  canStartTimer() {
    return this.hasSelectedShift() && !this.isTimerRunning;
  }

  canEndTimer() {
    return this.isTimerRunning;
  }

  canSaveActivity() {
    return this.hasSelectedShift() && this.timerSessions.length > 0 && !this.isTimerRunning;
  }

  // Activity management (employees create activities within shifts)
  setCurrentActivity(activity) {
    this.currentActivity = activity;
  }

  getCurrentActivity() {
    return this.currentActivity;
  }

  hasActiveActivity() {
    return this.currentActivity && !this.currentActivity.end;
  }

  // Shifts history
  setShifts(shifts) {
    this.shifts = shifts;
  }

  getShifts() {
    return this.shifts;
  }

  getTodayShifts() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.shifts.filter(shift => {
      const shiftStart = new Date(shift.start);
      return shiftStart >= startOfDay && shiftStart <= endOfDay;
    });
  }

  // Activities
  setActivities(activities) {
    this.activities = activities;
  }

  getActivities() {
    return this.activities;
  }

  // Get timer session data for saving
  getTimerSession() {
    if (!this.startTime || !this.endTime) return null;
    
    return {
      shiftId: this.currentShift?.id,
      start: this.startTime.toISOString(),
      end: this.endTime.toISOString(),
      duration: this.endTime.getTime() - this.startTime.getTime()
    };
  }

  // Animation frame management
  setAnimationFrameId(id) {
    this.animationFrameId = id;
  }

  getAnimationFrameId() {
    return this.animationFrameId;
  }

  // Clear invalid token
  clearInvalidToken() {
    this.token = null;
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error removing token from storage:', error);
    }
  }

  // Reset state
  reset() {
    this.clearInvalidToken();
    this.isTimerRunning = false;
    this.startTime = null;
    this.endTime = null;
    this.currentSession = null;
    this.timerSessions = [];
    this.totalElapsedTime = 0;
    this.employee = null;
    this.currentShift = null;
    this.currentActivity = null;
    this.shifts = [];
    this.activities = [];
    this.lastTimerUpdate = 0;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

module.exports = AppState; 