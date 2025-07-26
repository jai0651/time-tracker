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
      appLayout: document.getElementById('app-layout'),
      loginForm: document.getElementById('login-form'),
      loginError: document.getElementById('login-error'),
      timerError: document.getElementById('timer-error'),
      timerSuccess: document.getElementById('timer-success'),
      timerDisplay: document.getElementById('timer'),
      statusDisplay: document.getElementById('status'),
      startBtn: document.getElementById('start-btn'),
      stopBtn: document.getElementById('stop-btn'),
      logoutBtn: document.getElementById('logout-btn'),
      sessionStartDisplay: document.getElementById('session-start'),
      sessionDurationDisplay: document.getElementById('session-duration'),
      projectSelect: document.getElementById('project-select'),
      taskSelect: document.getElementById('task-select'),
      saveEntryBtn: document.getElementById('save-entry-btn'),
      historyList: document.getElementById('history-list')
    };
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
      console.warn('Timer display element not found');
      return;
    }

    const duration = this.formatDuration(elapsed);
    this.elements.timerDisplay.textContent = duration;
    
    if (this.elements.sessionDurationDisplay) {
      this.elements.sessionDurationDisplay.textContent = duration;
    }
  }

  updateTimerControls(state) {
    if (!this.elements.startBtn || !this.elements.stopBtn || !this.elements.saveEntryBtn) {
      console.warn('Timer control elements not found');
      return;
    }

    const canStart = state.canStartTimer();
    this.elements.startBtn.disabled = !canStart;
    this.elements.stopBtn.disabled = !state.isTimerRunning;
    this.elements.saveEntryBtn.disabled = !state.currentSession?.endTime;
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

  updateSessionInfo(startTime, duration) {
    if (!this.elements.sessionStartDisplay || !this.elements.sessionDurationDisplay) {
      console.warn('Session info elements not found');
      return;
    }

    this.elements.sessionStartDisplay.textContent = startTime || 'Not started';
    this.elements.sessionDurationDisplay.textContent = duration || '00:00:00';
  }

  // Dropdown management
  populateProjectDropdown(projects, selectedProjectId) {
    if (!this.elements.projectSelect) return;

    this.elements.projectSelect.innerHTML = '<option value="">Select Project</option>';
    projects.forEach(project => {
      const opt = document.createElement('option');
      opt.value = project.id;
      opt.textContent = project.name;
      this.elements.projectSelect.appendChild(opt);
    });
    this.elements.projectSelect.value = selectedProjectId || '';
  }

  populateTaskDropdown(tasks, selectedTaskId) {
    if (!this.elements.taskSelect) return;

    this.elements.taskSelect.innerHTML = '<option value="">Select Task</option>';
    tasks.forEach(task => {
      const opt = document.createElement('option');
      opt.value = task.id;
      opt.textContent = task.name;
      this.elements.taskSelect.appendChild(opt);
    });
    this.elements.taskSelect.value = selectedTaskId || '';
  }

  // History rendering
  renderTimeEntryHistory(timeEntries) {
    if (!this.elements.historyList) return;

    if (!timeEntries || timeEntries.length === 0) {
      this.elements.historyList.innerHTML = '<div class="text-gray-500 text-sm">No time entries yet.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    timeEntries.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'history-entry';

      const projectName = entry.project?.name || '-';
      const taskName = entry.task?.name || '-';
      const duration = this.formatDuration(entry.endTs - entry.startTs);
      const date = new Date(entry.startTs).toLocaleString();

      div.innerHTML = `
        <div class="entry-row"><span class="entry-label">Project:</span> <span class="entry-value">${projectName}</span></div>
        <div class="entry-row"><span class="entry-label">Task:</span> <span class="entry-value">${taskName}</span></div>
        <div class="entry-row"><span class="entry-label">Duration:</span> <span class="entry-value">${duration}</span></div>
        <div class="entry-date">${date}</div>
      `;

      fragment.appendChild(div);
    });

    this.elements.historyList.innerHTML = '';
    this.elements.historyList.appendChild(fragment);
  }

  // Message management
  showMessage(elementType, message) {
    const element = this.elements[elementType];
    if (!element) return;

    element.textContent = message;
    element.classList.add('show');

    setTimeout(() => {
      this.hideMessage(elementType);
    }, 5000);
  }

  hideMessage(elementType) {
    const element = this.elements[elementType];
    if (element) {
      element.classList.remove('show');
    }
  }

  // Utility methods
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
  }

  // Reset UI
  resetUI() {
    this.updateTimerDisplay(0); // Pass 0 for elapsed time
    this.updateTimerStatus('Ready to start', false);
    this.updateSessionInfo('Not started', '00:00:00');
    this.populateProjectDropdown([], null);
    this.populateTaskDropdown([], null);
    this.renderTimeEntryHistory([]);
    this.hideMessage('timerError');
    this.hideMessage('timerSuccess');
  }

  // Sidebar navigation
  showScreen(screenId) {
    // Hide all screens within app-layout
    ['timer-screen', 'history-screen'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    // Show the requested screen
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('hidden');
  }

  setActiveSidebarLink(linkId) {
    document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(linkId);
    if (btn) btn.classList.add('active');
  }
}

module.exports = UIManager; 