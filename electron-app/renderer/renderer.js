const { ipcRenderer } = require('electron');
const axios = require('axios');

// State management
let token = localStorage.getItem('token');
let isTimerRunning = false;
let startTime = null;
let timerInterval = null;
let currentSession = null;

// DOM elements
const loginScreen = document.getElementById('login-screen');
const timerScreen = document.getElementById('timer-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const timerError = document.getElementById('timer-error');
const timerSuccess = document.getElementById('timer-success');
const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const logoutBtn = document.getElementById('logout-btn');
const sessionStartDisplay = document.getElementById('session-start').querySelector('.value');
const sessionDurationDisplay = document.getElementById('session-duration').querySelector('.value');

// Initialize app
function init() {
    if (token) {
        showTimerScreen();
    } else {
        showLoginScreen();
    }
}

// Screen management
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    timerScreen.classList.add('hidden');
}

function showTimerScreen() {
    loginScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');
    updateTimerDisplay();
}

// API configuration
async function getApiUrl() {
    return await ipcRenderer.invoke('get-api-url');
}

async function createApiClient() {
    const baseURL = await getApiUrl();
    return axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// Login functionality
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const api = await createApiClient();
        const response = await api.post('/auth/login', { email, password });
        
        token = response.data.token;
        localStorage.setItem('token', token);
        
        showTimerScreen();
        showMessage(timerSuccess, 'Login successful!');
        
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
        showMessage(loginError, errorMessage);
    }
});

// Timer functionality
startBtn.addEventListener('click', () => {
    if (!isTimerRunning) {
        startTimer();
    }
});

stopBtn.addEventListener('click', () => {
    if (isTimerRunning) {
        stopTimer();
    }
});

function startTimer() {
    isTimerRunning = true;
    startTime = new Date();
    currentSession = {
        startTime: startTime,
        startTimestamp: startTime.getTime()
    };
    
    // Update UI
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusDisplay.textContent = 'Timer running...';
    timerDisplay.classList.add('running');
    sessionStartDisplay.textContent = startTime.toLocaleTimeString();
    
    // Start timer interval
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
}

async function stopTimer() {
    if (!isTimerRunning || !currentSession) return;
    
    const endTime = new Date();
    const duration = endTime.getTime() - currentSession.startTimestamp;
    
    // Stop timer
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    
    // Update UI
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusDisplay.textContent = 'Session completed';
    timerDisplay.classList.remove('running');
    
    // Submit time entry
    try {
        const api = await createApiClient();
        await api.post('/time-entries', {
            startTs: currentSession.startTimestamp,
            endTs: endTime.getTime()
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        showMessage(timerSuccess, 'Time entry submitted successfully!');
        
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to submit time entry.';
        showMessage(timerError, errorMessage);
    }
    
    // Reset session
    currentSession = null;
    sessionStartDisplay.textContent = 'Not started';
    sessionDurationDisplay.textContent = '00:00:00';
}

function updateTimerDisplay() {
    if (!isTimerRunning || !startTime) {
        timerDisplay.textContent = '00:00:00';
        return;
    }
    
    const now = new Date();
    const elapsed = now.getTime() - startTime.getTime();
    const duration = formatDuration(elapsed);
    
    timerDisplay.textContent = duration;
    sessionDurationDisplay.textContent = duration;
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const pad = (num) => num.toString().padStart(2, '0');
    
    return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
}

// Logout functionality
logoutBtn.addEventListener('click', () => {
    // Clear state
    token = null;
    localStorage.removeItem('token');
    isTimerRunning = false;
    startTime = null;
    currentSession = null;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reset UI
    timerDisplay.textContent = '00:00:00';
    timerDisplay.classList.remove('running');
    statusDisplay.textContent = 'Ready to start';
    sessionStartDisplay.textContent = 'Not started';
    sessionDurationDisplay.textContent = '00:00:00';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    // Clear messages
    hideMessage(timerError);
    hideMessage(timerSuccess);
    
    // Show login screen
    showLoginScreen();
});

// Message utilities
function showMessage(element, message) {
    element.textContent = message;
    element.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage(element);
    }, 5000);
}

function hideMessage(element) {
    element.classList.remove('show');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init); 