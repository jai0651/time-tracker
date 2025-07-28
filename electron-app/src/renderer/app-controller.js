const AppState = require('./state');
const ApiService = require('../services/api-service');
const ScreenshotService = require('../services/screenshot-service');
const TimerManager = require('./timer-manager');
const UIManager = require('./ui-manager');

class AppController {
  constructor() {
    this.state = new AppState();
    this.apiService = new ApiService();
    this.screenshotService = new ScreenshotService();
    this.uiManager = new UIManager();
    this.timerManager = new TimerManager(this.state, this.uiManager);
    
    // Set API service in screenshot service
    this.screenshotService.setApiService(this.apiService);
    
    // Set screenshot service in state for timer manager access
    this.state.screenshotService = this.screenshotService;
    
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();

    // Sidebar navigation
    document.getElementById('nav-shifts').addEventListener('click', () => {
      this.uiManager.showScreen('shifts-screen');
      this.uiManager.setActiveSidebarLink('nav-shifts');
      this.loadShifts();
    });
    document.getElementById('nav-timer').addEventListener('click', () => {
      this.uiManager.showScreen('timer-screen');
      this.uiManager.setActiveSidebarLink('nav-timer');
    });
    document.getElementById('nav-history').addEventListener('click', () => {
      this.uiManager.showScreen('history-screen');
      this.uiManager.setActiveSidebarLink('nav-history');
      this.loadActivities();
    });

    // Check for existing valid token and auto-login
    if (this.state.isTokenValid()) {
      this.autoLogin();
    } else {
      this.showLoginScreen();
    }
  }

  // Auto-login with stored token
  async autoLogin() {
    try {
      const token = this.state.getToken();
      if (!token) {
        this.showLoginScreen();
        return;
      }

      // Set token in API service
      this.apiService.setAuthToken(token);
      
      // Test authentication
      const authTest = await this.apiService.testAuthentication();
      if (authTest) {
        this.showShiftsScreen();
        this.uiManager.setActiveSidebarLink('nav-shifts');
        await this.loadEmployeeData();
      } else {
        this.state.setToken(null);
        this.showLoginScreen();
      }
    } catch (error) {
      this.state.setToken(null);
      this.showLoginScreen();
    }
  }

  setupEventListeners() {
    // Login form
    this.uiManager.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
    
    // Timer controls (employees start/stop local timer)
    if (this.uiManager.elements.startActivityBtn) {
      this.uiManager.elements.startActivityBtn.addEventListener('click', this.handleStartTimer.bind(this));
    }
    if (this.uiManager.elements.endActivityBtn) {
      this.uiManager.elements.endActivityBtn.addEventListener('click', this.handleEndTimer.bind(this));
    }
    if (this.uiManager.elements.saveActivityBtn) {
      this.uiManager.elements.saveActivityBtn.addEventListener('click', this.handleSaveActivity.bind(this));
    }
    
    // Shift selection (employees select from scheduled shifts)
    if (this.uiManager.elements.shiftSelect) {
      this.uiManager.elements.shiftSelect.addEventListener('change', this.handleShiftChange.bind(this));
    }
    
    // Logout
    this.uiManager.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    
    // Retry permission button
    if (this.uiManager.elements.retryPermissionBtn) {
      this.uiManager.elements.retryPermissionBtn.addEventListener('click', this.handleRetryPermission.bind(this));
    }
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
      
      // Test authentication
      const authTest = await this.apiService.testAuthentication();
      
      this.showShiftsScreen();
      this.uiManager.showMessage('timerSuccess', 'Login successful!');
      await this.loadEmployeeData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      this.uiManager.showMessage('loginError', errorMessage);
    }
  }

  // Timer management (employees start/stop local timer)
  async handleStartTimer() {
    try {
      if (!this.state.hasSelectedShift()) {
        this.uiManager.showMessage('timerError', 'Please select a shift first.');
        return;
      }
      
      if (this.state.isTimerRunning) {
        this.uiManager.showMessage('timerError', 'Timer is already running.');
        return;
      }
      
      // Start local timer state first
      this.state.startTimer();
      
      // Then start the timer manager
      this.timerManager.startTimer();
      
      // Start screenshot capture (will be linked to activity when saved)
      await this.screenshotService.startScreenshotCapture(null); // No activity ID yet
      
      // Update UI
      this.uiManager.updateTimerStatus('Timer started - Working...', true);
      this.uiManager.updateActivityControls(this.state);
      
      // Update screenshot status
      const captureStatus = this.screenshotService.getCaptureStatus();
      this.uiManager.updateScreenshotStatus(
        captureStatus.isCapturing,
        captureStatus.screenshotCount,
        captureStatus.hasPermissions,
        captureStatus.intervalSeconds
      );
      
      // Show permission message
      this.uiManager.showScreenshotPermissionMessage(
        captureStatus.hasPermissions,
        captureStatus.permissionError
      );
      
      this.uiManager.showMessage('timerSuccess', 'Timer started!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to start timer.';
      this.uiManager.showMessage('timerError', errorMessage);
    }
  }

  async handleEndTimer() {
    try {
      if (!this.state.isTimerRunning) {
        this.uiManager.showMessage('timerError', 'No timer running to stop.');
        return;
      }
      
      // Stop timer manager first (while timer is still running)
      this.timerManager.stopTimer();
      
      // Then stop the state timer
      const sessionData = this.state.stopTimer();
      
      // Stop screenshot capture
      this.screenshotService.stopScreenshotCapture();
      
      this.uiManager.updateTimerStatus('Timer stopped', false);
      this.uiManager.updateActivityControls(this.state);
      
      // Hide screenshot status
      this.uiManager.hideScreenshotStatus();
      
      // Update activity info with session details
      this.uiManager.updateActivityInfo({
        sessions: this.state.timerSessions,
        totalElapsed: this.state.totalElapsedTime,
        sessionCount: this.state.timerSessions.length
      });
      
      this.uiManager.showMessage('timerSuccess', `Timer stopped! Session ${sessionData.sessionId} completed. Total: ${this.state.timerSessions.length} sessions`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to stop timer.';
      this.uiManager.showMessage('timerError', errorMessage);
    }
  }

  async handleSaveActivity() {
    try {
      if (!this.state.currentShift) {
        this.uiManager.showMessage('timerError', 'No shift selected.');
        return;
      }
      
      if (this.state.timerSessions.length === 0) {
        this.uiManager.showMessage('timerError', 'No timer sessions to save.');
        return;
      }
      
      // Create activity in backend with total duration
      const totalDuration = this.state.totalElapsedTime;
      const firstSession = this.state.timerSessions[0];
      const lastSession = this.state.timerSessions[this.state.timerSessions.length - 1];
      
      const activity = await this.apiService.createActivity(
        this.state.currentShift.id,
        'Work activity',
        firstSession.startTime.toISOString(),
        lastSession.endTime.toISOString()
      );
      
      this.state.setCurrentActivity(activity);
      
      // Link any orphaned screenshots to this activity
      try {
        const orphanedScreenshots = await this.screenshotService.getScreenshots(null, {
          startDate: firstSession.startTime.toISOString(),
          endDate: lastSession.endTime.toISOString()
        });
        
        if (orphanedScreenshots.screenshots && orphanedScreenshots.screenshots.length > 0) {
          const screenshotIds = orphanedScreenshots.screenshots.map(s => s.id);
          await this.screenshotService.linkScreenshotsToActivity(screenshotIds, activity.id);
          console.log(`Linked ${screenshotIds.length} screenshots to activity ${activity.id}`);
        }
      } catch (screenshotError) {
        console.error('Failed to link screenshots to activity:', screenshotError);
      }
      
      // Clear all timer sessions after saving
      this.state.clearTimerSessions();
      
      // Hide activity info
      if (this.uiManager.elements.activityInfo) {
        this.uiManager.elements.activityInfo.classList.add('hidden');
      }
      
      this.uiManager.updateActivityControls(this.state);
      this.uiManager.showMessage('timerSuccess', `Activity saved successfully! Total time: ${this.formatDuration(totalDuration)}`);
      
      // Refresh activities list
      await this.loadActivities();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save activity.';
      this.uiManager.showMessage('timerError', errorMessage);
    }
  }

  // Helper method to format duration
  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  // Shift selection (employees select from scheduled shifts)
  handleShiftChange() {
    const shiftId = this.uiManager.elements.shiftSelect?.value;
    const selectedShift = this.state.shifts.find(shift => shift.id === shiftId);
    
    this.state.setCurrentShift(selectedShift || null);
    this.uiManager.updateShiftInfo(selectedShift);
    this.uiManager.updateActivityControls(this.state);
    
    // Load current activity for selected shift
    if (selectedShift) {
      this.loadCurrentActivity(selectedShift.id);
    }
  }

  // Handle "Create Activity" button clicks from shifts list
  handleCreateActivity(shiftId) {
    const shift = this.state.shifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    // Switch to timer screen and select this shift
    this.uiManager.showScreen('timer-screen');
    this.uiManager.setActiveSidebarLink('nav-timer');
    
    this.state.setCurrentShift(shift);
    this.uiManager.updateShiftInfo(shift);
    this.uiManager.updateActivityControls(this.state);
    
    // Select the shift in dropdown
    if (this.uiManager.elements.shiftSelect) {
      this.uiManager.elements.shiftSelect.value = shiftId;
    }
    
    // Load current activity for this shift
    this.loadCurrentActivity(shiftId);
  }

  // Data loading
  async loadEmployeeData() {
    try {
      if (!this.state.isTokenValid()) {
        console.error('No valid token available for API calls');
        this.uiManager.showMessage('timerError', 'Authentication token not found or expired. Please login again.');
        return;
      }
      
      const userId = this.state.getUserIdFromToken();
      if (!userId) {
        console.error('Invalid token - could not extract user ID');
        this.uiManager.showMessage('timerError', 'Invalid authentication token. Please login again.');
        return;
      }
      
      // Load employee data
      const employee = await this.apiService.getEmployeeData(userId);
      this.state.setEmployeeData(employee);
      
      // Load today's scheduled shifts
      await this.loadTodayShifts();
      
      this.uiManager.updateActivityControls(this.state);
      
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
      if (!this.state.isTokenValid()) {
        console.error('No valid token for loading current activity');
        return;
      }
      
      const userId = this.state.getUserIdFromToken();
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
      if (!this.state.isTokenValid()) {
        console.error('No valid token available for loading shifts');
        return;
      }
      
      const userId = this.state.getUserIdFromToken();
      if (!userId) {
        console.error('Invalid token for loading shifts');
        return;
      }
      
      const shifts = await this.apiService.getShifts(userId, { limit: 20 });
      this.state.setShifts(shifts);
      this.uiManager.renderShiftsList(shifts);
      
      // Add event listeners to "Create Activity" buttons
      this.setupShiftEventListeners();
    } catch (error) {
      console.error('Failed to load shifts:', error);
    }
  }

  async loadActivities() {
    try {
      if (!this.state.isTokenValid()) {
        console.error('No valid token available for loading activities');
        return;
      }
      
      const userId = this.state.getUserIdFromToken();
      if (!userId) {
        console.error('Invalid token for loading activities');
        return;
      }
      
      const activities = await this.apiService.getActivities(userId, { limit: 20 });
      this.state.setActivities(activities);
      this.uiManager.renderActivitiesList(activities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }

  setupShiftEventListeners() {
    // Remove existing event listeners
    const existingButtons = document.querySelectorAll('.create-activity-btn');
    existingButtons.forEach(btn => {
      btn.removeEventListener('click', this.handleCreateActivityClick.bind(this));
    });
    
    // Add new event listeners
    const buttons = document.querySelectorAll('.create-activity-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', this.handleCreateActivityClick.bind(this));
    });
  }

  handleCreateActivityClick(e) {
    const shiftId = e.target.getAttribute('data-shift-id');
    if (shiftId) {
      this.handleCreateActivity(shiftId);
    }
  }

  // Retry permission request
  async handleRetryPermission() {
    try {
      const permissionResult = await this.screenshotService.requestScreenPermissions();
      
      if (permissionResult.granted) {
        // Update permission status
        this.screenshotService.permissionDenied = false;
        this.screenshotService.permissionError = null;
        
        // Update UI
        const captureStatus = this.screenshotService.getCaptureStatus();
        this.uiManager.updateScreenshotStatus(
          captureStatus.isCapturing,
          captureStatus.screenshotCount,
          captureStatus.hasPermissions,
          captureStatus.intervalSeconds
        );
        
        this.uiManager.showMessage('timerSuccess', 'Screenshot permissions granted! Screenshots will now be captured.');
      } else {
        this.uiManager.showMessage('timerError', `Permission still denied: ${permissionResult.message}`);
      }
    } catch (error) {
      this.uiManager.showMessage('timerError', 'Failed to request permissions. Please try again.');
    }
  }

  // Logout
  handleLogout() {
    // Stop screenshot capture if running
    this.screenshotService.stopScreenshotCapture();
    
    this.state.reset();
    this.apiService.resetApiClient();
    this.uiManager.resetUI();
    this.showLoginScreen();
  }

  // Screen management
  showLoginScreen() {
    this.uiManager.showLoginScreen();
  }

  showShiftsScreen() {
    this.uiManager.showTimerScreen(); // This shows the app layout
    this.uiManager.showScreen('shifts-screen');
    // Recache DOM elements after showing the app layout
    this.uiManager.cacheDOMElements();
    
    // Test timer display
    setTimeout(() => {
      this.uiManager.testTimerDisplay();
    }, 1000);
  }
}

module.exports = AppController; 