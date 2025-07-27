class AppState {
  constructor() {
    this.token = localStorage.getItem('token');
    this.isTimerRunning = false;
    this.startTime = null;
    this.currentSession = null;
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

  // Token management
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  // Timer state
  startTimer() {
    this.isTimerRunning = true;
    this.startTime = new Date();
    this.currentSession = {
      startTime: this.startTime,
      startTimestamp: this.startTime.getTime()
    };
  }

  stopTimer() {
    if (!this.isTimerRunning || !this.currentSession) return null;
    
    const endTime = new Date();
    this.currentSession.endTime = endTime;
    this.isTimerRunning = false;
    
    return {
      startTs: this.currentSession.startTimestamp,
      endTs: endTime.getTime()
    };
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

  canStartActivity() {
    return this.hasSelectedShift() && !this.hasActiveActivity();
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

  canEndActivity() {
    return this.hasActiveActivity();
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

  // Animation frame management
  setAnimationFrameId(id) {
    this.animationFrameId = id;
  }

  getAnimationFrameId() {
    return this.animationFrameId;
  }

  // Reset state
  reset() {
    this.token = null;
    this.isTimerRunning = false;
    this.startTime = null;
    this.currentSession = null;
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