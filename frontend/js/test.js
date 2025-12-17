// Test JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initTestPage();
});

function initTestPage() {
    // Check if user is logged in for test history
    const token = localStorage.getItem('token');
    if (token) {
        loadTestHistory();
    }
    
    // Initialize test questions
    initTestQuestions();
    
    // Setup event listeners
    setupTestEventListeners();
}

// Test questions data
const testQuestions = [
    {
        id: 1,
        question: "How often have you felt nervous or stressed in the past week?",
        options: [
            { text: "Never", value: 1 },
            { text: "Rarely", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Often", value: 4 },
            { text: "Very Often", value: 5 }
        ]
    },
    {
        id: 2,
        question: "How often have you felt that you were unable to control the important things in your life?",
        options: [
            { text: "Never", value: 1 },
            { text: "Rarely", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Often", value: 4 },
            { text: "Very Often", value: 5 }
        ]
    },
    {
        id: 3,
        question: "How often have you felt confident about your ability to handle your personal problems?",
        options: [
            { text: "Very Often", value: 1 },
            { text: "Often", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Rarely", value: 4 },
            { text: "Never", value: 5 }
        ]
    },
    {
        id: 4,
        question: "How often have you felt that things were going your way?",
        options: [
            { text: "Very Often", value: 1 },
            { text: "Often", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Rarely", value: 4 },
            { text: "Never", value: 5 }
        ]
    },
    {
        id: 5,
        question: "How often have you found that you could not cope with all the things that you had to do?",
        options: [
            { text: "Never", value: 1 },
            { text: "Rarely", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Often", value: 4 },
            { text: "Very Often", value: 5 }
        ]
    },
    {
        id: 6,
        question: "How often have you been able to control irritations in your life?",
        options: [
            { text: "Very Often", value: 1 },
            { text: "Often", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Rarely", value: 4 },
            { text: "Never", value: 5 }
        ]
    },
    {
        id: 7,
        question: "How often have you felt that you were on top of things?",
        options: [
            { text: "Very Often", value: 1 },
            { text: "Often", value: 2 },
            { text: "Sometimes", value: 3 },
            { text: "Rarely", value: 4 },
            { text: "Never", value: 5 }
        ]
    }
];

let currentQuestion = 0;
let answers = [];

function initTestQuestions() {
    const startTestBtn = document.getElementById('startTest');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', () => {
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('questionsContainer').style.display = 'block';
            renderQuestion();
        });
    }
}

function renderQuestion() {
    const form = document.getElementById('stressTestForm');
    if (!form) return;
    
    // Clear form
    form.innerHTML = '';
    
    const question = testQuestions[currentQuestion];
    
    const questionHTML = `
        <div class="question">
            <span class="question-number">Question ${currentQuestion + 1} of ${testQuestions.length}</span>
            <h3 class="question-text">${question.question}</h3>
            <div class="options-grid">
                ${question.options.map((option, index) => `
                    <label class="option ${answers[currentQuestion] === option.value ? 'selected' : ''}">
                        <input type="radio" name="question${question.id}" value="${option.value}" 
                               ${answers[currentQuestion] === option.value ? 'checked' : ''}>
                        <span class="option-label">${option.text}</span>
                        <span class="option-value">(${option.value} point${option.value !== 1 ? 's' : ''})</span>
                    </label>
                `).join('')}
            </div>
        </div>
        
        <div class="navigation-buttons">
            <button type="button" class="btn-nav secondary" id="prevBtn" ${currentQuestion === 0 ? 'disabled' : ''}>
                <i class="fas fa-arrow-left"></i> Previous
            </button>
            
            ${currentQuestion < testQuestions.length - 1 ? `
                <button type="button" class="btn-nav" id="nextBtn">
                    Next <i class="fas fa-arrow-right"></i>
                </button>
            ` : `
                <button type="button" class="btn-nav" id="submitBtn">
                    <i class="fas fa-check"></i> Submit Test
                </button>
            `}
        </div>
    `;
    
    form.innerHTML = questionHTML;
    
    // Update progress
    updateProgress();
    
    // Add event listeners
    setupQuestionEventListeners();
}

function setupQuestionEventListeners() {
    // Option selection
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            options.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Get the radio input value
            const input = option.querySelector('input[type="radio"]');
            if (input) {
                input.checked = true;
                answers[currentQuestion] = parseInt(input.value);
            }
        });
    });
    
    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                renderQuestion();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (answers[currentQuestion]) {
                currentQuestion++;
                renderQuestion();
            } else {
                showMessage('Please select an answer before proceeding', 'error');
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (answers[currentQuestion]) {
                submitTest();
            } else {
                showMessage('Please select an answer before submitting', 'error');
            }
        });
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / testQuestions.length) * 100;
    const progressBar = document.getElementById('testProgress');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (currentQuestionSpan) {
        currentQuestionSpan.textContent = currentQuestion + 1;
    }
}

async function submitTest() {
    // Check if all questions are answered
    if (answers.length !== testQuestions.length || answers.some(answer => !answer)) {
        showMessage('Please answer all questions before submitting', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        let response;
        
        if (token) {
            // Submit to server if logged in
            response = await fetch(`${API_BASE_URL}/tests/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });
        } else {
            // Calculate locally if not logged in
            const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
            const level = calculateStressLevel(totalScore);
            const recommendations = getRecommendations(level);
            
            response = {
                ok: true,
                json: async () => ({
                    success: true,
                    result: {
                        score: totalScore,
                        level,
                        recommendations,
                        date: new Date().toISOString()
                    }
                })
            };
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.result);
            
            // If not logged in, save locally
            if (!token) {
                saveTestResultLocal(data.result);
            }
            
            // Update test history
            loadTestHistory();
        }
    } catch (error) {
        console.error('Error submitting test:', error);
        showMessage('Error submitting test. Please try again.', 'error');
    }
}

function calculateStressLevel(score) {
    if (score <= 10) return 'Low stress';
    if (score <= 20) return 'Medium stress';
    return 'High stress';
}

function getRecommendations(level) {
    const recommendations = {
        'Low stress': [
            'Continue your healthy habits and stress management techniques',
            'Practice mindfulness and meditation regularly',
            'Maintain a good work-life balance',
            'Stay physically active and eat well',
            'Keep a gratitude journal'
        ],
        'Medium stress': [
            'Take regular breaks during work or study sessions',
            'Practice deep breathing exercises daily',
            'Talk to friends or family about your feelings',
            'Establish a consistent sleep schedule',
            'Try relaxation techniques like progressive muscle relaxation',
            'Consider reducing caffeine intake'
        ],
        'High stress': [
            'Consider speaking with a mental health professional',
            'Practice deep breathing for 5-10 minutes daily',
            'Take time off if possible to recharge',
            'Establish a strong support system',
            'Prioritize self-care activities',
            'Learn to set healthy boundaries',
            'Consider mindfulness-based stress reduction (MBSR)'
        ]
    };
    
    return recommendations[level] || [];
}

function displayResults(result) {
    // Hide questions container
    document.getElementById('questionsContainer').style.display = 'none';
    
    // Show results container
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Update result display
    document.getElementById('finalScore').textContent = result.score;
    document.getElementById('stressLevel').textContent = result.level;
    document.getElementById('levelDescription').textContent = getLevelDescription(result.level);
    document.getElementById('levelDetail').textContent = result.level;
    document.getElementById('stressPercentage').textContent = `${Math.min(result.score * 4, 100)}%`;
    document.getElementById('comparison').textContent = getComparisonText(result.level);
    
    // Format date
    const date = new Date(result.date || new Date());
    document.getElementById('testDate').textContent = `Completed on ${date.toLocaleDateString()}`;
    
    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    if (recommendationsList) {
        recommendationsList.innerHTML = result.recommendations.map(rec => `
            <div class="recommendation">
                <i class="fas fa-check-circle"></i>
                <p>${rec}</p>
            </div>
        `).join('');
    }
    
    // Update UI based on stress level
    updateResultUI(result.level);
    
    // Setup result action buttons
    setupResultActions();
}

function getLevelDescription(level) {
    switch(level) {
        case 'Low stress':
            return 'You are managing stress well. Keep up the good work!';
        case 'Medium stress':
            return 'You are experiencing moderate stress. Some self-care practices could help.';
        case 'High stress':
            return 'You are experiencing high stress levels. Consider implementing stress management strategies.';
        default:
            return '';
    }
}

function getComparisonText(level) {
    switch(level) {
        case 'Low stress':
            return 'Lower than average';
        case 'Medium stress':
            return 'About average';
        case 'High stress':
            return 'Higher than average';
        default:
            return '';
    }
}

function updateResultUI(level) {
    const scoreCircle = document.querySelector('.score-circle .circle');
    if (!scoreCircle) return;
    
    let color;
    switch(level) {
        case 'Low stress':
            color = '#10b981';
            break;
        case 'Medium stress':
            color = '#f59e0b';
            break;
        case 'High stress':
            color = '#ef4444';
            break;
        default:
            color = '#6b7280';
    }
    
    scoreCircle.style.background = `linear-gradient(135deg, ${color}, ${color}99)`;
}

function setupResultActions() {
    const saveResultsBtn = document.getElementById('saveResults');
    const retakeTestBtn = document.getElementById('retakeTest');
    const viewHistoryBtn = document.getElementById('viewHistory');
    
    if (saveResultsBtn) {
        saveResultsBtn.addEventListener('click', () => {
            showMessage('Results saved successfully!', 'success');
        });
    }
    
    if (retakeTestBtn) {
        retakeTestBtn.addEventListener('click', () => {
            // Reset test
            currentQuestion = 0;
            answers = [];
            
            // Hide results, show welcome
            document.getElementById('resultsContainer').style.display = 'none';
            document.getElementById('welcomeScreen').style.display = 'block';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            // Scroll to history section
            document.querySelector('.test-history').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function saveTestResultLocal(result) {
    // Get existing results
    const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    // Add new result
    existingResults.push({
        ...result,
        date: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('testResults', JSON.stringify(existingResults));
}

async function loadTestHistory() {
    const token = localStorage.getItem('token');
    let testHistory = [];
    
    try {
        if (token) {
            // Load from server
            const response = await fetch(`${API_BASE_URL}/tests/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                testHistory = data.history;
            }
        } else {
            // Load from localStorage
            testHistory = JSON.parse(localStorage.getItem('testResults') || '[]');
        }
        
        displayTestHistory(testHistory);
    } catch (error) {
        console.error('Error loading test history:', error);
    }
}

function displayTestHistory(history) {
    const historyContainer = document.getElementById('historyContainer');
    const historyTableBody = document.getElementById('testHistoryBody');
    
    if (!historyContainer || !historyTableBody) return;
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-history">
                <i class="fas fa-clipboard-list"></i>
                <p>No test history yet. Complete your first assessment to track your progress.</p>
            </div>
        `;
        return;
    }
    
    // Update table
    historyTableBody.innerHTML = history.slice(0, 5).map((result, index) => {
        const date = new Date(result.created_at || result.date);
        const formattedDate = date.toLocaleDateString();
        
        let levelClass = '';
        switch(result.level) {
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
        
        // Determine trend
        let trendIcon = 'fa-minus';
        let trendColor = '#6b7280';
        if (index > 0) {
            const prevScore = history[index - 1].score || 0;
            if (result.score < prevScore) {
                trendIcon = 'fa-arrow-down';
                trendColor = '#10b981';
            } else if (result.score > prevScore) {
                trendIcon = 'fa-arrow-up';
                trendColor = '#ef4444';
            }
        }
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${result.score}</td>
                <td><span class="${levelClass}">${result.level}</span></td>
                <td><i class="fas ${trendIcon}" style="color: ${trendColor};"></i></td>
                <td>
                    <button class="action-btn" onclick="viewTestResult(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add CSS for level badges
    const style = document.createElement('style');
    style.textContent = `
        .level-low { color: #10b981; font-weight: 600; }
        .level-medium { color: #f59e0b; font-weight: 600; }
        .level-high { color: #ef4444; font-weight: 600; }
    `;
    document.head.appendChild(style);
}

function viewTestResult(index) {
    // This would normally open a detailed view of the test result
    showMessage(`Viewing test result #${index + 1}`, 'info');
}

function setupTestEventListeners() {
    // Add any additional event listeners here
}