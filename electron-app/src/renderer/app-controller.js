const AppState = require('./state');
const ApiService = require('../services/api-service');
const TimerManager = require('./timer-manager');
const UIManager = require('./ui-manager');

class AppController {
  constructor() {
    this.state = new AppState();
    this.apiService = new ApiService();
    this.uiManager = new UIManager();
    this.timerManager = new TimerManager(this.state, this.uiManager);
    
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();

    // Sidebar navigation
    document.getElementById('nav-timer').addEventListener('click', () => {
      this.uiManager.showScreen('timer-screen');
      this.uiManager.setActiveSidebarLink('nav-timer');
    });
    document.getElementById('nav-history').addEventListener('click', () => {
      this.uiManager.showScreen('history-screen');
      this.uiManager.setActiveSidebarLink('nav-history');
      this.loadTimeEntries();
    });

    if (this.state.getToken()) {
      this.showTimerScreen();
      this.uiManager.setActiveSidebarLink('nav-timer');
      this.loadEmployeeData();
    } else {
      this.showLoginScreen();
    }
  }

  setupEventListeners() {
    // Login form
    this.uiManager.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
    
    // Timer controls
    this.uiManager.elements.startBtn.addEventListener('click', this.handleStartTimer.bind(this));
    this.uiManager.elements.stopBtn.addEventListener('click', this.handleStopTimer.bind(this));
    this.uiManager.elements.saveEntryBtn.addEventListener('click', this.handleSaveTimeEntry.bind(this));
    
    // Logout
    this.uiManager.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    
    // Project/Task selection
    this.uiManager.elements.projectSelect.addEventListener('change', this.handleProjectChange.bind(this));
    this.uiManager.elements.taskSelect.addEventListener('change', this.handleTaskChange.bind(this));
  }

  // Authentication
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await this.apiService.login(email, password);
      this.state.setToken(response.token);
      this.apiService.setAuthToken(response.token);
      
      this.showTimerScreen();
      this.uiManager.showMessage('timerSuccess', 'Login successful!');
      await this.loadEmployeeData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      this.uiManager.showMessage('loginError', errorMessage);
    }
  }

  // Timer management
  handleStartTimer() {
    this.timerManager.startTimer();
    this.uiManager.updateTimerStatus('Timer running...', true);
    // Fix: Get startTime after timer is started
    if (this.state.startTime) {
      this.uiManager.updateSessionInfo(this.state.startTime.toLocaleTimeString());
    }
  }

  handleStopTimer() {
    const timeEntryData = this.timerManager.stopTimer();
    this.uiManager.updateTimerStatus('Session completed', false);
    
    if (timeEntryData) {
      const duration = this.timerManager.formatDuration(timeEntryData.endTs - timeEntryData.startTs);
      this.uiManager.updateSessionInfo(this.state.startTime.toLocaleTimeString(), duration);
    }
  }

  async handleSaveTimeEntry() {
    if (!this.state.currentSession?.endTime) return;
    
    try {
      const timeEntryData = {
        startTs: this.state.currentSession.startTimestamp,
        endTs: this.state.currentSession.endTime.getTime(),
        projectId: this.state.selectedProjectId,
        taskId: this.state.selectedTaskId
      };
      
      await this.apiService.saveTimeEntry(timeEntryData);
      this.uiManager.showMessage('timerSuccess', 'Time entry saved!');
      await this.loadTimeEntries();
      this.uiManager.elements.saveEntryBtn.disabled = true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save time entry.';
      this.uiManager.showMessage('timerError', errorMessage);
    }
  }

  // Data loading
  async loadEmployeeData() {
    try {
      const userId = this.apiService.getUserIdFromToken(this.state.getToken());
      if (!userId) throw new Error('Invalid token');
      
      const employee = await this.apiService.getEmployeeData(userId);
      this.state.setEmployeeData(employee);
      
      this.uiManager.populateProjectDropdown(this.state.getProjects(), this.state.selectedProjectId);
      this.uiManager.populateTaskDropdown(this.state.getFilteredTasks(), this.state.selectedTaskId);
      this.uiManager.updateTimerControls(this.state);
      
      await this.loadTimeEntries();
    } catch (error) {
      this.uiManager.showMessage('timerError', 'Failed to load employee data.');
    }
  }

  async loadTimeEntries() {
    try {
      const userId = this.apiService.getUserIdFromToken(this.state.getToken());
      if (!userId) return;
      
      const timeEntries = await this.apiService.getTimeEntries(userId);
      this.state.setTimeEntries(timeEntries);
      this.uiManager.renderTimeEntryHistory(timeEntries);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  }

  // Selection handlers
  handleProjectChange() {
    const projectId = this.uiManager.elements.projectSelect.value;
    this.state.setSelectedProject(projectId);
    this.uiManager.populateTaskDropdown(this.state.getFilteredTasks(), null);
    this.uiManager.updateTimerControls(this.state);
  }

  handleTaskChange() {
    const taskId = this.uiManager.elements.taskSelect.value;
    this.state.setSelectedTask(taskId);
    this.uiManager.updateTimerControls(this.state);
  }

  // Logout
  handleLogout() {
    this.state.reset();
    this.apiService.resetApiClient();
    this.uiManager.resetUI();
    this.showLoginScreen();
  }

  // Screen management
  showLoginScreen() {
    this.uiManager.showLoginScreen();
  }

  showTimerScreen() {
    this.uiManager.showTimerScreen();
    // Recache DOM elements after showing the app layout
    this.uiManager.cacheDOMElements();
  }
}

module.exports = AppController; 