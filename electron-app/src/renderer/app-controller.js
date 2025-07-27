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
      this.loadShifts();
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
    
    // Activity controls (employees create activities within shifts)
    if (this.uiManager.elements.startActivityBtn) {
      this.uiManager.elements.startActivityBtn.addEventListener('click', this.handleStartActivity.bind(this));
    }
    if (this.uiManager.elements.endActivityBtn) {
      this.uiManager.elements.endActivityBtn.addEventListener('click', this.handleEndActivity.bind(this));
    }
    
    // Shift selection (employees select from scheduled shifts)
    if (this.uiManager.elements.shiftSelect) {
      this.uiManager.elements.shiftSelect.addEventListener('change', this.handleShiftChange.bind(this));
    }
    
    // Logout
    this.uiManager.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
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

  // Activity management (employees create activities within shifts)
  async handleStartActivity() {
    try {
      if (!this.state.currentShift) {
        this.uiManager.showMessage('timerError', 'No shift selected. Please select a shift first.');
        return;
      }
      
      if (this.state.currentActivity) {
        this.uiManager.showMessage('timerError', 'Activity already in progress.');
        return;
      }
      
      const activity = await this.apiService.createActivity(
        this.state.currentShift.id, 
        'Work activity'
      );
      this.state.setCurrentActivity(activity);
      
      this.timerManager.startTimer();
      this.uiManager.updateTimerStatus('Activity started - Working...', true);
      this.uiManager.updateActivityInfo(activity);
      
      this.uiManager.showMessage('timerSuccess', 'Activity started!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to start activity.';
      this.uiManager.showMessage('timerError', errorMessage);
    }
  }

  async handleEndActivity() {
    try {
      if (!this.state.currentActivity) {
        this.uiManager.showMessage('timerError', 'No active activity to end.');
        return;
      }
      
      const endedActivity = await this.apiService.endActivity(this.state.currentActivity.id);
      this.state.setCurrentActivity(null);
      
      this.timerManager.stopTimer();
      this.uiManager.updateTimerStatus('Activity ended', false);
      this.uiManager.updateActivityInfo(endedActivity);
      
      this.uiManager.showMessage('timerSuccess', 'Activity ended!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to end activity.';
      this.uiManager.showMessage('timerError', errorMessage);
    }
  }

  // Shift selection (employees select from scheduled shifts)
  handleShiftChange() {
    const shiftId = this.uiManager.elements.shiftSelect?.value;
    const selectedShift = this.state.shifts.find(shift => shift.id === shiftId);
    
    this.state.setCurrentShift(selectedShift || null);
    this.uiManager.updateShiftInfo(selectedShift);
    this.uiManager.updateTimerControls(this.state);
    
    // Load current activity for selected shift
    if (selectedShift) {
      this.loadCurrentActivity(selectedShift.id);
    }
  }

  // Data loading
  async loadEmployeeData() {
    try {
      const userId = this.apiService.getUserIdFromToken(this.state.getToken());
      if (!userId) throw new Error('Invalid token');
      
      // Load employee data
      const employee = await this.apiService.getEmployeeData(userId);
      this.state.setEmployeeData(employee);
      
      // Load today's scheduled shifts
      await this.loadTodayShifts();
      
      this.uiManager.updateTimerControls(this.state);
      
      await this.loadShifts();
    } catch (error) {
      console.error('Failed to load employee data:', error);
      this.uiManager.showMessage('timerError', 'Failed to load employee data.');
    }
  }

  async loadTodayShifts() {
    try {
      const shifts = await this.apiService.getTodayShifts();
      this.state.setShifts(shifts);
      
      // Populate shift dropdown if it exists
      if (this.uiManager.elements.shiftSelect) {
        this.uiManager.populateShiftDropdown(shifts, this.state.currentShift?.id);
      }
      
      // Auto-select first shift if available
      if (shifts.length > 0 && !this.state.currentShift) {
        this.state.setCurrentShift(shifts[0]);
        this.uiManager.updateShiftInfo(shifts[0]);
      }
    } catch (error) {
      console.error('Failed to load today\'s shifts:', error);
      this.uiManager.showMessage('timerError', 'Failed to load today\'s shifts.');
    }
  }

  async loadCurrentActivity(shiftId) {
    try {
      const userId = this.apiService.getUserIdFromToken(this.state.getToken());
      if (!userId || !shiftId) return;
      
      const currentActivity = await this.apiService.getCurrentActivity(userId, shiftId);
      this.state.setCurrentActivity(currentActivity);
      
      if (currentActivity) {
        this.uiManager.updateActivityInfo(currentActivity);
        this.timerManager.startTimer(); // Resume timer for active activity
      }
    } catch (error) {
      console.error('Failed to load current activity:', error);
    }
  }

  async loadShifts() {
    try {
      const userId = this.apiService.getUserIdFromToken(this.state.getToken());
      if (!userId) return;
      
      const shifts = await this.apiService.getShifts(userId, { limit: 20 });
      this.state.setShifts(shifts);
      this.uiManager.renderShiftHistory(shifts);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    }
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