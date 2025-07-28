class TimerManager {
  constructor(state, uiManager) {
    this.state = state;
    this.uiManager = uiManager;
  }

  startTimer() {
    // Recache DOM elements to ensure timer display is found
    this.uiManager.recacheAndVerifyTimer();
    
    // Start the optimized timer loop
    this.startOptimizedTimer();
  }

  stopTimer() {
    // Stop the animation frame loop
    this.stopOptimizedTimer();
    
    // Get the final elapsed time
    const finalElapsed = this.getElapsedTime();
    
    // Update the display one last time
    this.uiManager.updateTimerDisplay(finalElapsed);
  }

  startOptimizedTimer() {
    let frameCount = 0;
    let lastElapsed = 0;
    let lastScreenshotUpdate = 0;
    
    const updateTimer = () => {
      frameCount++;
      
      if (!this.state.isTimerRunning) {
        return;
      }

      // Update timer display every frame for smoother updates
      const elapsed = this.getElapsedTime();
      
      // Only update if elapsed time changed significantly
      if (Math.abs(elapsed - lastElapsed) > 100) { // Update every 100ms
        this.uiManager.updateTimerDisplay(elapsed);
        lastElapsed = elapsed;
      }

      // Update screenshot count every 5 seconds
      if (elapsed - lastScreenshotUpdate > 5000) {
        this.updateScreenshotStatus();
        lastScreenshotUpdate = elapsed;
      }

      const animationFrameId = requestAnimationFrame(updateTimer);
      this.state.setAnimationFrameId(animationFrameId);
    };

    requestAnimationFrame(updateTimer);
  }

  updateScreenshotStatus() {
    // This will be called by the app controller
    if (this.state.screenshotService) {
      const captureStatus = this.state.screenshotService.getCaptureStatus();
      this.uiManager.updateScreenshotStatus(
        captureStatus.isCapturing,
        captureStatus.screenshotCount,
        captureStatus.hasPermissions,
        captureStatus.intervalMinutes
      );
    }
  }

  // Manual timer update for testing
  manualUpdateTimer() {
    if (this.state.isTimerRunning && this.state.startTime) {
      const elapsed = this.getElapsedTime();
      this.uiManager.updateTimerDisplay(elapsed);
    }
  }

  stopOptimizedTimer() {
    const animationFrameId = this.state.getAnimationFrameId();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      this.state.setAnimationFrameId(null);
    }
  }

  getElapsedTime() {
    // Return total elapsed time including all sessions and current session
    return this.state.getTotalElapsedTime();
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