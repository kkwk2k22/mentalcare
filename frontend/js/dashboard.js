// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard components
    initDashboard();
    initPomodoroTimer();
    loadFeaturedArticles();
    loadDailyTip();
    loadTestResults();
});

// Dashboard initialization
function initDashboard() {
    // Update welcome message with user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.username) {
        const welcomeElement = document.querySelector('.welcome-content h2');
        if (welcomeElement) {
            welcomeElement.innerHTML = `<i class="fas fa-user-graduate"></i> Hello, ${user.username}!`;
        }
    }
    
    // Setup refresh tip button
    const refreshTipBtn = document.getElementById('refreshTip');
    if (refreshTipBtn) {
        refreshTipBtn.addEventListener('click', loadDailyTip);
    }
    
    // Setup take test button
    const takeTestBtn = document.querySelector('.btn-take-test');
    if (takeTestBtn) {
        takeTestBtn.addEventListener('click', () => {
            window.location.href = 'test.html';
        });
    }
}

// Load daily tip
async function loadDailyTip() {
    try {
        const response = await fetch(`${API_BASE_URL}/tests/daily-tip`);
        const data = await response.json();
        
        if (data.success && data.tip) {
            document.getElementById('tipTitle').textContent = 'Daily Wellness Tip';
            document.getElementById('tipText').textContent = data.tip.content;
            document.getElementById('tipCategory').textContent = data.tip.category || 'General';
        }
    } catch (error) {
        console.error('Error loading daily tip:', error);
    }
}

// Load test results
async function loadTestResults() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tests/latest`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.latest) {
            updateTestResultUI(data.latest);
        }
    } catch (error) {
        console.error('Error loading test results:', error);
    }
}

function updateTestResultUI(testResult) {
    const statusCircle = document.getElementById('statusCircle');
    const stressLevel = document.getElementById('stressLevel');
    const testDate = document.getElementById('testDate');
    const recommendations = document.getElementById('recommendations');
    
    if (!testResult) return;
    
    // Set stress level and icon
    let icon = 'fa-smile';
    let color = '#10b981';
    
    switch(testResult.level) {
        case 'Low stress':
            icon = 'fa-smile';
            color = '#10b981';
            break;
        case 'Medium stress':
            icon = 'fa-meh';
            color = '#f59e0b';
            break;
        case 'High stress':
            icon = 'fa-frown';
            color = '#ef4444';
            break;
    }
    
    statusCircle.innerHTML = `<i class="fas ${icon}"></i>`;
    statusCircle.style.background = `linear-gradient(135deg, ${color}, ${color}99)`;
    
    stressLevel.textContent = testResult.level;
    
    // Format date
    const date = new Date(testResult.created_at);
    testDate.textContent = `Test taken on ${date.toLocaleDateString()}`;
    
    // Update recommendations
    if (testResult.recommendations) {
        const recList = testResult.recommendations.split('; ');
        recommendations.innerHTML = recList.map(rec => `<p>${rec}</p>`).join('');
    }
}

// Load featured articles
async function loadFeaturedArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/articles`);
        const data = await response.json();
        
        if (data.success && data.articles) {
            displayFeaturedArticles(data.articles.slice(0, 4)); // Show first 4 articles
        }
    } catch (error) {
        console.error('Error loading featured articles:', error);
    }
}

function displayFeaturedArticles(articles) {
    const container = document.getElementById('featuredArticles');
    if (!container) return;
    
    if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">No articles available.</p>';
        return;
    }
    
    const articlesHTML = articles.map(article => `
        <div class="article-card">
            <div class="article-image">
                <img src="${article.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'}" alt="${article.title}">
            </div>
            <div class="article-content">
                <span class="article-category">${article.category_name || 'General'}</span>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <div class="article-meta">
                    <span class="views"><i class="far fa-eye"></i> ${article.read_count || 0} views</span>
                    <div class="article-actions">
                        <a href="article.html?id=${article.id}" class="action-btn">
                            <i class="fas fa-book-open"></i> Read
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = articlesHTML;
}

// Pomodoro Timer
let timer;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let currentMode = 'focus'; // focus, shortBreak, longBreak

function initPomodoroTimer() {
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const timerLabel = document.getElementById('timerLabel');
    
    // Update display
    updateTimerDisplay();
    
    // Start button
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            startTimer();
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }
    });
    
    // Pause button
    pauseBtn.addEventListener('click', () => {
        if (isRunning) {
            pauseTimer();
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        resetTimer();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        updateTimerDisplay();
    });
    
    // Mode buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            modeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Set mode and time
            const time = parseInt(btn.dataset.time);
            setTimerMode(time, btn.textContent.toLowerCase().includes('focus') ? 'focus' : 
                btn.textContent.toLowerCase().includes('short') ? 'shortBreak' : 'longBreak');
            
            // Reset timer
            resetTimer();
            updateTimerDisplay();
        });
    });
    
    function startTimer() {
        isRunning = true;
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                playTimerSound();
                showTimerNotification();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
    }
    
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        switch(currentMode) {
            case 'focus':
                timeLeft = 25 * 60;
                break;
            case 'shortBreak':
                timeLeft = 5 * 60;
                break;
            case 'longBreak':
                timeLeft = 15 * 60;
                break;
        }
    }
    
    function setTimerMode(minutes, mode) {
        currentMode = mode;
        timeLeft = minutes * 60;
        
        // Update label
        switch(mode) {
            case 'focus':
                timerLabel.textContent = 'Focus Time';
                break;
            case 'shortBreak':
                timerLabel.textContent = 'Short Break';
                break;
            case 'longBreak':
                timerLabel.textContent = 'Long Break';
                break;
        }
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        minutesSpan.textContent = minutes.toString().padStart(2, '0');
        secondsSpan.textContent = seconds.toString().padStart(2, '0');
    }
    
    function playTimerSound() {
        // Create audio context for timer sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Audio not supported');
        }
    }
    
    function showTimerNotification() {
        let message = '';
        switch(currentMode) {
            case 'focus':
                message = 'Focus session complete! Take a short break.';
                break;
            case 'shortBreak':
                message = 'Break is over! Ready for another focus session?';
                break;
            case 'longBreak':
                message = 'Long break complete! Ready to focus again?';
                break;
        }
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MentalCare Timer', {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        // Show in-app notification
        showMessage(message, 'info');
    }
}

// Request notification permission
if ('Notification' in window) {
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}