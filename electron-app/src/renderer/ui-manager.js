class UIManager {
  constructor() {
    this.elements = {};
    this.cacheDOMElements();
  }

  cacheDOMElements() {
    this.elements = {
      loginScreen: document.getElementById('login-screen'),
      timerScreen: document.getElementById('timer-screen'),
      historyScreen: document.getElementById('history-screen'),
      shiftsScreen: document.getElementById('shifts-screen'),
      appLayout: document.getElementById('app-layout'),
      loginForm: document.getElementById('login-form'),
      loginError: document.getElementById('login-error'),
      timerError: document.getElementById('timer-error'),
      timerSuccess: document.getElementById('timer-success'),
      timerDisplay: document.getElementById('timer'),
      statusDisplay: document.getElementById('status'),
      startActivityBtn: document.getElementById('start-activity-btn'),
      endActivityBtn: document.getElementById('end-activity-btn'),
      saveActivityBtn: document.getElementById('save-activity-btn'),
      logoutBtn: document.getElementById('logout-btn'),
      shiftSelect: document.getElementById('shift-select'),
      shiftInfo: document.getElementById('shift-info'),
      shiftProject: document.getElementById('shift-project'),
      shiftTask: document.getElementById('shift-task'),
      shiftStart: document.getElementById('shift-start'),
      shiftEnd: document.getElementById('shift-end'),
      activityInfo: document.getElementById('activity-info'),
      activityStart: document.getElementById('activity-start'),
      activityDuration: document.getElementById('activity-duration'),
      shiftsList: document.getElementById('shifts-list'),
      activitiesList: document.getElementById('activities-list')
    };
    
  }

  // Test timer display directly
  testTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = '00:01:30';
      return true;
    } else {
      return false;
    }
  }

  // Recache elements and verify timer display
  recacheAndVerifyTimer() {
    this.cacheDOMElements();
    const timerElement = document.getElementById('timer');
    return !!this.elements.timerDisplay;
  }

  // Screen management
  showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-layout').classList.add('hidden');
  }

  showTimerScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-layout').classList.remove('hidden');
    this.showScreen('timer-screen');
    // Recache elements after showing the app layout
    this.cacheDOMElements();
  }

  // Timer display updates
  updateTimerDisplay(elapsed) {
    if (!this.elements.timerDisplay) {
      return;
    }

    const duration = this.formatDuration(elapsed);
    this.elements.timerDisplay.textContent = duration;
    
    if (this.elements.activityDuration) {
      this.elements.activityDuration.textContent = duration;
    }
  }

  updateActivityControls(state) {
    if (!this.elements.startActivityBtn || !this.elements.endActivityBtn || !this.elements.saveActivityBtn) {
      console.warn('Activity control elements not found');
      return;
    }

    const canStart = state.canStartTimer();
    const canEnd = state.canEndTimer();
    const canSave = state.canSaveActivity();
    
    this.elements.startActivityBtn.disabled = !canStart;
    this.elements.endActivityBtn.disabled = !canEnd;
    this.elements.saveActivityBtn.disabled = !canSave;
  }

  updateTimerStatus(status, isRunning = false) {
    if (!this.elements.statusDisplay || !this.elements.timerDisplay) {
      console.warn('Timer status elements not found');
      return;
    }

    this.elements.statusDisplay.textContent = status;
    
    if (isRunning) {
      this.elements.timerDisplay.classList.add('running');
    } else {
      this.elements.timerDisplay.classList.remove('running');
    }
  }

  updateShiftInfo(shift) {
    if (!this.elements.shiftInfo || !shift) return;

    this.elements.shiftInfo.classList.remove('hidden');
    this.elements.shiftProject.textContent = shift.project?.name || 'No project';
    this.elements.shiftTask.textContent = shift.task?.name || 'No task';
    this.elements.shiftStart.textContent = this.formatDateTime(shift.start);
    this.elements.shiftEnd.textContent = shift.end ? this.formatDateTime(shift.end) : 'Not set';
  }

  updateActivityInfo(activity) {
    if (!this.elements.activityInfo || !activity) return;

    this.elements.activityInfo.classList.remove('hidden');
    
    if (activity.sessions) {
      // Display session information
      const sessionCount = activity.sessionCount || 0;
      const totalElapsed = activity.totalElapsed || 0;
      
      this.elements.activityStart.textContent = `${sessionCount} session(s)`;
      this.elements.activityDuration.textContent = this.formatDuration(totalElapsed);
    } else {
      // Display single activity information
      this.elements.activityStart.textContent = this.formatDateTime(activity.start);
      
      if (activity.end) {
        const duration = new Date(activity.end) - new Date(activity.start);
        this.elements.activityDuration.textContent = this.formatDuration(duration);
      } else {
        this.elements.activityDuration.textContent = 'In progress...';
      }
    }
  }

  // Shift dropdown management
  populateShiftDropdown(shifts, selectedShiftId) {
    if (!this.elements.shiftSelect) return;

    this.elements.shiftSelect.innerHTML = '<option value="">Select a shift</option>';
    
    shifts.forEach(shift => {
      const option = document.createElement('option');
      option.value = shift.id;
      option.textContent = `${shift.project?.name || 'No project'} - ${shift.task?.name || 'No task'} (${this.formatDateTime(shift.start)})`;
      if (shift.id === selectedShiftId) {
        option.selected = true;
      }
      this.elements.shiftSelect.appendChild(option);
    });
  }

  // Shifts list rendering
  renderShiftsList(shifts) {
    if (!this.elements.shiftsList) return;

    this.elements.shiftsList.innerHTML = '';
    
    if (shifts.length === 0) {
      this.elements.shiftsList.innerHTML = '<div class="empty-state">No shifts found</div>';
      return;
    }

    shifts.forEach(shift => {
      const shiftCard = document.createElement('div');
      shiftCard.className = 'shift-card';
      
      const status = this.getShiftStatus(shift);
      
      shiftCard.innerHTML = `
        <div class="shift-header">
          <h3>${shift.project?.name || 'No project'} - ${shift.task?.name || 'No task'}</h3>
          <span class="status-badge ${status.status}">${status.label}</span>
        </div>
        <div class="shift-details">
          <div class="detail-item">
            <span class="label">Start:</span>
            <span class="value">${this.formatDateTime(shift.start)}</span>
          </div>
          <div class="detail-item">
            <span class="label">End:</span>
            <span class="value">${shift.end ? this.formatDateTime(shift.end) : 'Not set'}</span>
          </div>
          <div class="detail-item">
            <span class="label">Team:</span>
            <span class="value">${shift.teamId}</span>
          </div>
        </div>
        <div class="shift-actions">
          <button class="btn btn-primary btn-sm create-activity-btn" data-shift-id="${shift.id}">
            Create Activity
          </button>
        </div>
      `;
      
      this.elements.shiftsList.appendChild(shiftCard);
    });
  }

  // Activities list rendering
  renderActivitiesList(activities) {
    if (!this.elements.activitiesList) return;

    this.elements.activitiesList.innerHTML = '';
    
    if (activities.length === 0) {
      this.elements.activitiesList.innerHTML = '<div class="empty-state">No activities found</div>';
      return;
    }

    activities.forEach(activity => {
      const activityCard = document.createElement('div');
      activityCard.className = 'activity-card';
      
      const duration = activity.end ? 
        new Date(activity.end) - new Date(activity.start) : 
        new Date() - new Date(activity.start);
      
      activityCard.innerHTML = `
        <div class="activity-header">
          <h3>${activity.description || 'Work activity'}</h3>
          <span class="status-badge ${activity.end ? 'completed' : 'active'}">
            ${activity.end ? 'Completed' : 'Active'}
          </span>
        </div>
        <div class="activity-details">
          <div class="detail-item">
            <span class="label">Start:</span>
            <span class="value">${this.formatDateTime(activity.start)}</span>
          </div>
          <div class="detail-item">
            <span class="label">End:</span>
            <span class="value">${activity.end ? this.formatDateTime(activity.end) : 'In progress'}</span>
          </div>
          <div class="detail-item">
            <span class="label">Duration:</span>
            <span class="value">${this.formatDuration(duration)}</span>
          </div>
        </div>
      `;
      
      this.elements.activitiesList.appendChild(activityCard);
    });
  }

  getShiftStatus(shift) {
    const now = new Date();
    const start = new Date(shift.start);
    const end = shift.end ? new Date(shift.end) : null;

    if (end) return { status: 'ended', label: 'Ended' };
    if (start > now) return { status: 'scheduled', label: 'Scheduled' };
    return { status: 'active', label: 'Active' };
  }

  // Message display
  showMessage(elementType, message) {
    const element = this.elements[elementType];
    if (element) {
      element.textContent = message;
      element.classList.remove('hidden');
      
      // Auto-hide success messages
      if (elementType === 'timerSuccess') {
        setTimeout(() => this.hideMessage(elementType), 3000);
      }
    }
  }

  hideMessage(elementType) {
    const element = this.elements[elementType];
    if (element) {
      element.classList.add('hidden');
    }
  }

  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
  }

  resetUI() {
    this.hideMessage('loginError');
    this.hideMessage('timerError');
    this.hideMessage('timerSuccess');
    
    if (this.elements.timerDisplay) {
      this.elements.timerDisplay.textContent = '00:00:00';
      this.elements.timerDisplay.classList.remove('running');
    }
    
    if (this.elements.statusDisplay) {
      this.elements.statusDisplay.textContent = 'Select a shift to start activity';
    }
  }

  showScreen(screenId) {
    // Hide all screens
    const screens = ['shifts-screen', 'timer-screen', 'history-screen'];
    screens.forEach(screen => {
      const element = document.getElementById(screen);
      if (element) {
        element.classList.add('hidden');
      }
    });
    
    // Show the requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
    }
  }

  setActiveSidebarLink(linkId) {
    // Remove active class from all sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to the clicked link
    const targetLink = document.getElementById(linkId);
    if (targetLink) {
      targetLink.classList.add('active');
    }
  }
}

module.exports = UIManager; 