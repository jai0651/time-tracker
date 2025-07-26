class TimerManager {
  constructor(state, uiManager) {
    this.state = state;
    this.uiManager = uiManager;
  }

  startTimer() {
    if (!this.state.canStartTimer()) {
      console.log('Cannot start timer:', {
        selectedProjectId: this.state.selectedProjectId,
        selectedTaskId: this.state.selectedTaskId,
        isTimerRunning: this.state.isTimerRunning
      });
      return;
    }

    console.log('Starting timer...');
    this.state.startTimer();
    this.uiManager.updateTimerControls(this.state);
    this.uiManager.updateTimerDisplay(0);
    this.startOptimizedTimer();
    console.log('Timer started successfully');
  }

  stopTimer() {
    if (!this.state.isTimerRunning) {
      console.log('Timer is not running, cannot stop');
      return;
    }

    console.log('Stopping timer...');
    const timeEntryData = this.state.stopTimer();
    this.uiManager.updateTimerControls(this.state);
    this.uiManager.updateTimerDisplay(this.getElapsedTime());
    this.stopOptimizedTimer();
    console.log('Timer stopped, timeEntryData:', timeEntryData);

    return timeEntryData;
  }

  startOptimizedTimer() {
    console.log('Starting optimized timer loop...');
    const updateTimer = () => {
      if (!this.state.isTimerRunning || !this.state.startTime) {
        console.log('Timer loop stopped: timer not running or no start time');
        return;
      }

      const now = Date.now();
      if (now - this.state.lastTimerUpdate >= this.state.TIMER_UPDATE_THRESHOLD) {
        const elapsed = this.getElapsedTime();
        console.log('Updating timer display, elapsed:', elapsed);
        this.uiManager.updateTimerDisplay(elapsed);
        this.state.lastTimerUpdate = now;
      }

      const animationFrameId = requestAnimationFrame(updateTimer);
      this.state.setAnimationFrameId(animationFrameId);
    };

    requestAnimationFrame(updateTimer);
  }

  stopOptimizedTimer() {
    const animationFrameId = this.state.getAnimationFrameId();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      this.state.setAnimationFrameId(null);
    }
  }

  getElapsedTime() {
    if (!this.state.isTimerRunning || !this.state.startTime) {
      return 0;
    }

    const now = new Date();
    return now.getTime() - this.state.startTime.getTime();
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
  }
}

module.exports = TimerManager; 