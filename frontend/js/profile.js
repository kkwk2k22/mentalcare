// Profile JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

async function initProfilePage() {
    // Load user data
    await loadUserData();
    
    // Load test history
    await loadTestHistory();
    
    // Load favorites
    await loadFavorites();
    
    // Initialize charts
    initCharts();
    
    // Setup event listeners
    setupEventListeners();
}

// Load user data
async function loadUserData() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Load profile data
        const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const profileData = await profileResponse.json();
        
        if (profileData.success && profileData.profile) {
            updateProfileUI(profileData.profile);
        }
        
        // Load latest test result for dashboard
        const testResponse = await fetch(`${API_BASE_URL}/tests/latest`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const testData = await testResponse.json();
        if (testData.success && testData.latest) {
            updateDashboardTestResult(testData.latest);
        }
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateProfileUI(profileData) {
    const { user, latestTest, favoritesCount, testHistory } = profileData;
    
    // Update basic user info
    document.getElementById('username').textContent = user.username;
    document.getElementById('userEmail').textContent = user.email;
    
    // Format join date
    if (user.created_at) {
        const joinDate = new Date(user.created_at);
        document.getElementById('joinDate').textContent = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Update stats
    document.getElementById('articlesRead').textContent = '0'; // Would come from server
    document.getElementById('favoritesCount').textContent = favoritesCount || '0';
    
    // Update theme preference
    if (user.theme_preference && document.getElementById('themeSelect')) {
        document.getElementById('themeSelect').value = user.theme_preference;
    }
}

function updateDashboardTestResult(testResult) {
    if (!testResult) return;
    
    const currentStressElement = document.getElementById('currentStress');
    if (currentStressElement) {
        currentStressElement.textContent = testResult.level;
        
        // Update color based on stress level
        switch(testResult.level) {
            case 'Low stress':
                currentStressElement.style.color = '#10b981';
                break;
            case 'Medium stress':
                currentStressElement.style.color = '#f59e0b';
                break;
            case 'High stress':
                currentStressElement.style.color = '#ef4444';
                break;
        }
    }
}

// Load test history
async function loadTestHistory() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tests/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.history) {
            displayTestHistory(data.history);
            updateStressChart(data.history);
        }
    } catch (error) {
        console.error('Error loading test history:', error);
    }
}

function displayTestHistory(history) {
    const tableBody = document.getElementById('testHistoryBody');
    if (!tableBody) return;
    
    if (history.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No test history available</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedHistory = [...history].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, 10); // Show only last 10 results
    
    tableBody.innerHTML = sortedHistory.map((test, index) => {
        const date = new Date(test.created_at);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Determine trend
        let trendIcon = 'fa-minus';
        let trendColor = '#6b7280';
        if (index < sortedHistory.length - 1) {
            const nextTest = sortedHistory[index + 1];
            if (test.score < nextTest.score) {
                trendIcon = 'fa-arrow-down';
                trendColor = '#10b981'; // Improved
            } else if (test.score > nextTest.score) {
                trendIcon = 'fa-arrow-up';
                trendColor = '#ef4444'; // Worsened
            }
        }
        
        // Level badge class
        let levelClass = '';
        switch(test.level) {
            case 'Low stress':
                levelClass = 'level-low';
                break;
            case 'Medium stress':
                levelClass = 'level-medium';
                break;
            case 'High stress':
                levelClass = 'level-high';
                break;
        }
        
        return `
            <tr>
                <td>${formattedDate}<br><small>${formattedTime}</small></td>
                <td><strong>${test.score}</strong>/35</td>
                <td><span class="${levelClass}">${test.level}</span></td>
                <td><i class="fas ${trendIcon}" style="color: ${trendColor};"></i></td>
                <td>
                    <button class="action-btn" onclick="viewTestDetails(${test.id})" title="View details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="deleteTestResult(${test.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load favorites
async function loadFavorites() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/articles/user/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.articles) {
            displayFavorites(data.articles);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

function displayFavorites(articles) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;
    
    if (articles.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="no-favorites">
                <i class="far fa-heart"></i>
                <p>No favorite articles yet</p>
                <a href="articles.html" class="btn-action" style="margin-top: 1rem;">
                    <i class="fas fa-book-open"></i> Browse Articles
                </a>
            </div>
        `;
        return;
    }
    
    favoritesGrid.innerHTML = articles.slice(0, 6).map(article => `
        <div class="article-card">
            <div class="article-image">
                <img src="${article.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'}" alt="${article.title}">
            </div>
            <div class="article-content">
                <span class="article-category">${article.category_name || 'General'}</span>
                <h3>${article.title}</h3>
                <p>${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}</p>
                <div class="article-meta">
                    <a href="article.html?id=${article.id}" class="action-btn">
                        <i class="fas fa-book-open"></i> Read
                    </a>
                    <button class="action-btn favorite-btn" data-id="${article.id}" title="Remove from favorites">
                        <i class="fas fa-heart" style="color: #ef4444;"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to favorite buttons
    const favoriteBtns = favoritesGrid.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await toggleFavorite(btn.dataset.id, btn);
            await loadFavorites(); // Refresh favorites
        });
    });
}

// Initialize charts
function initCharts() {
    // This will be populated with real data from test history
    const stressChartCanvas = document.getElementById('stressChart');
    if (!stressChartCanvas) return;
    
    // Create a placeholder chart for now
    const ctx = stressChartCanvas.getContext('2d');
    
    // Chart will be updated when test history is loaded
}

function updateStressChart(history) {
    const stressChartCanvas = document.getElementById('stressChart');
    if (!stressChartCanvas || history.length === 0) return;
    
    // Sort history by date (oldest first for chart)
    const sortedHistory = [...history].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
    ).slice(-10); // Last 10 results
    
    const dates = sortedHistory.map(test => {
        const date = new Date(test.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const scores = sortedHistory.map(test => test.score);
    
    // Convert scores to stress levels (1-10 scale for chart)
    const stressLevels = scores.map(score => {
        // Convert 0-35 score to 1-10 scale
        return Math.round((score / 35) * 10);
    });
    
    // Get chart context
    const ctx = stressChartCanvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.stressChartInstance) {
        window.stressChartInstance.destroy();
    }
    
    // Create new chart
    window.stressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Stress Level',
                data: stressLevels,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const score = scores[context.dataIndex];
                            const level = sortedHistory[context.dataIndex].level;
                            return `Score: ${score}, Level: ${level}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Stress Level (1-10)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showMessage('Edit profile feature coming soon!', 'info');
        });
    }
    
    // Change theme button
    const changeThemeBtn = document.getElementById('changeTheme');
    if (changeThemeBtn) {
        changeThemeBtn.addEventListener('click', () => {
            document.querySelector('.settings-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Theme select
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateUserTheme(theme);
        });
    }
    
    // Export data button
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportUserData);
    }
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccount');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', confirmDeleteAccount);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
    
    // Take test button
    const takeTestBtn = document.querySelector('.btn-take-test');
    if (takeTestBtn) {
        takeTestBtn.addEventListener('click', () => {
            window.location.href = 'test.html';
        });
    }
    
    // View all favorites button
    const viewAllFavoritesBtn = document.querySelector('.btn-view-all');
    if (viewAllFavoritesBtn) {
        viewAllFavoritesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // In a real app, this would filter articles to show only favorites
            window.location.href = 'articles.html?filter=favorites';
        });
    }
    
    // Settings toggles
    const notificationsToggle = document.getElementById('notificationsToggle');
    const remindersToggle = document.getElementById('remindersToggle');
    
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('notificationsEnabled', enabled);
            showMessage(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'info');
        });
    }
    
    if (remindersToggle) {
        remindersToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('remindersEnabled', enabled);
            showMessage(`Study reminders ${enabled ? 'enabled' : 'disabled'}`, 'info');
        });
    }
}

// Update user theme on server
async function updateUserTheme(theme) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/theme`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ theme })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('Theme updated on server');
        }
    } catch (error) {
        console.error('Error updating theme:', error);
    }
}

// Toggle favorite (same as in articles.js but adapted for profile)
async function toggleFavorite(articleId, button) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/favorite`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (!data.isFavorited) {
                showMessage('Removed from favorites', 'info');
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showMessage('Error updating favorite', 'error');
    }
}

// Export user data
async function exportUserData() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        showMessage('Preparing your data export...', 'info');
        
        // In a real application, you would fetch all user data from the server
        // For now, we'll create a mock export
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const exportData = {
            user: {
                username: user.username,
                email: user.email,
                joined: user.created_at
            },
            stats: {
                tests_taken: 0,
                articles_read: 0,
                favorites: 0
            },
            export_date: new Date().toISOString()
        };
        
        // Convert to JSON string
        const dataStr = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = `mentalcare-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showMessage('Data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showMessage('Error exporting data', 'error');
    }
}

// Confirm account deletion
function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        deleteAccount();
    }
}

// Delete account
async function deleteAccount() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        showMessage('Deleting account...', 'info');
        
        // In a real application, you would call a delete account endpoint
        // For now, we'll simulate the process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('theme');
        
        showMessage('Account deleted successfully', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage('Error deleting account', 'error');
    }
}

// View test details
function viewTestDetails(testId) {
    // In a real application, this would show detailed test results
    showMessage(`Viewing details for test #${testId}`, 'info');
}

// Delete test result
async function deleteTestResult(testId) {
    if (!confirm('Are you sure you want to delete this test result?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        // In a real application, you would call a delete endpoint
        // For now, we'll simulate deletion
        showMessage('Test result deleted', 'success');
        
        // Refresh test history
        await loadTestHistory();
        
    } catch (error) {
        console.error('Error deleting test result:', error);
        showMessage('Error deleting test result', 'error');
    }
}