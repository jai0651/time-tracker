class AppState {
  constructor() {
    this.token = localStorage.getItem('token');
    this.isTimerRunning = false;
    this.startTime = null;
    this.currentSession = null;
    this.employee = null;
    this.projects = [];
    this.tasks = [];
    this.timeEntries = [];
    this.selectedProjectId = null;
    this.selectedTaskId = null;
    
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
      startTimestamp: this.startTime.getTime(),
      projectId: this.selectedProjectId,
      taskId: this.selectedTaskId
    };
  }

  stopTimer() {
    if (!this.isTimerRunning || !this.currentSession) return null;
    
    const endTime = new Date();
    this.currentSession.endTime = endTime;
    this.isTimerRunning = false;
    
    return {
      startTs: this.currentSession.startTimestamp,
      endTs: endTime.getTime(),
      projectId: this.selectedProjectId,
      taskId: this.selectedTaskId
    };
  }

  // Employee data
  setEmployeeData(employee) {
    this.employee = employee;
    this.projects = employee.projects || [];
    this.tasks = employee.tasks || [];
  }

  getProjects() {
    return this.projects;
  }

  getTasks() {
    return this.tasks;
  }

  getFilteredTasks() {
    if (!this.selectedProjectId) return this.tasks;
    return this.tasks.filter(task => task.project && task.project.id == this.selectedProjectId);
  }

  // Selection state
  setSelectedProject(projectId) {
    this.selectedProjectId = projectId;
    this.selectedTaskId = null; // Reset task selection when project changes
  }

  setSelectedTask(taskId) {
    this.selectedTaskId = taskId;
  }

  canStartTimer() {
    return this.selectedProjectId && this.selectedTaskId && !this.isTimerRunning;
  }

  // Time entries
  setTimeEntries(entries) {
    this.timeEntries = entries;
  }

  getTimeEntries() {
    return this.timeEntries;
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
    this.projects = [];
    this.tasks = [];
    this.timeEntries = [];
    this.selectedProjectId = null;
    this.selectedTaskId = null;
    this.lastTimerUpdate = 0;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

module.exports = AppState; 