// Base API URL
const API_BASE_URL = 'http://localhost:5007/api';

// DOM Elements
const authButton = document.getElementById('authButton');
const logoutButton = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');
const themeSelect = document.getElementById('themeSelect');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
    
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (themeSelect) {
        themeSelect.value = newTheme;
    }
    
    updateThemeIcon(newTheme);
    
    // Update theme on server if user is logged in
    if (isLoggedIn()) {
        updateUserTheme(newTheme);
    }
}

function updateThemeIcon(theme) {
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }
}

function updateUserTheme(theme) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(`${API_BASE_URL}/auth/theme`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Theme updated on server');
        }
    })
    .catch(error => console.error('Error updating theme:', error));
}

// Auth State Management
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function updateAuthUI() {
    const isLoggedIn = !!localStorage.getItem('token');
    const user = getUser();
    
    if (authButton) {
        if (isLoggedIn) {
            authButton.innerHTML = `<i class="fas fa-user"></i> ${user?.username || 'Profile'}`;
            authButton.href = 'profile.html';
        } else {
            authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            authButton.href = 'login.html';
        }
    }
    
    if (logoutButton) {
        logoutButton.style.display = isLoggedIn ? 'flex' : 'none';
    }
    
    // Update profile page if exists
    if (window.location.pathname.includes('profile.html') && user) {
        updateProfileUI(user);
    }
}

function updateProfileUI(user) {
    document.getElementById('username').textContent = user.username || 'User';
    document.getElementById('userEmail').textContent = user.email || '';
    
    if (user.created_at) {
        const joinDate = new Date(user.created_at);
        document.getElementById('joinDate').textContent = joinDate.getFullYear();
    }
}

// Login Functionality
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        // Clear previous errors
        clearErrors();
        
        // Validate inputs
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Save theme preference
                if (data.user.theme_preference) {
                    document.documentElement.setAttribute('data-theme', data.user.theme_preference);
                    localStorage.setItem('theme', data.user.theme_preference);
                    updateThemeIcon(data.user.theme_preference);
                }
                
                // Remember me
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Show success message
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showError('passwordError', data.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('passwordError', 'An error occurred. Please try again.');
        }
    });
}

// Registration Functionality
if (registerForm) {
    const passwordInput = document.getElementById('password');
    const strengthText = document.getElementById('strengthText');
    const strengthBar = document.querySelector('.strength-bar');
    
    // Password strength checker
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        
        strengthText.textContent = strength.text;
        strengthBar.style.width = `${strength.score * 25}%`;
        strengthBar.style.backgroundColor = strength.color;
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms')?.checked || false;
        
        // Clear previous errors
        clearErrors();
        
        // Validate inputs
        if (username.length < 3) {
            showError('usernameError', 'Username must be at least 3 characters');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            return;
        }
        
        const passwordStrength = checkPasswordStrength(password);
        if (passwordStrength.score < 2) {
            showError('passwordError', 'Password is too weak');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            return;
        }
        
        if (!terms) {
            showError('confirmPasswordError', 'You must agree to the terms');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success message
                showMessage('Registration successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                if (data.error === 'User already exists') {
                    showError('emailError', 'Email already registered');
                } else if (data.errors) {
                    data.errors.forEach(error => {
                        if (error.param === 'email') {
                            showError('emailError', error.msg);
                        } else if (error.param === 'password') {
                            showError('passwordError', error.msg);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('confirmPasswordError', 'An error occurred. Please try again.');
        }
    });
}

// Logout Functionality
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateAuthUI();
        window.location.href = 'index.html';
    });
}

// Theme Select Change
if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
        
        if (isLoggedIn()) {
            updateUserTheme(theme);
        }
    });
}

// Initialize
function init() {
    initTheme();
    updateAuthUI();
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Check for protected routes
    if (window.location.pathname.includes('profile.html') && !isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Helper Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function checkPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strength = [
        { text: 'None', color: '#ef4444' },
        { text: 'Weak', color: '#f59e0b' },
        { text: 'Fair', color: '#f59e0b' },
        { text: 'Good', color: '#10b981' },
        { text: 'Strong', color: '#10b981' },
        { text: 'Very Strong', color: '#10b981' }
    ];
    
    return {
        score,
        text: strength[score].text,
        color: strength[score].color
    };
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('show');
    });
}

function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#ef4444';
    } else {
        messageDiv.style.backgroundColor = '#3b82f6';
    }
    
    // Add to DOM
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);