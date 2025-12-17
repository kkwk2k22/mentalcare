// Articles JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initArticlesPage();
});

async function initArticlesPage() {
    // Load categories
    await loadCategories();
    
    // Load articles
    await loadArticles();
    
    // Load popular articles
    await loadPopularArticles();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update reading progress
    updateReadingProgress();
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/articles/categories`);
        const data = await response.json();
        
        if (data.success && data.categories) {
            displayCategories(data.categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    const filterButtons = document.querySelector('.filter-buttons');
    
    if (!categoryList || !filterButtons) return;
    
    // Clear existing content
    categoryList.innerHTML = '';
    
    // Add "All Categories" item
    const allCategoriesHTML = `
        <div class="category-item active" data-category="all">
            <span>All Categories</span>
            <span class="category-count" id="allCount">0</span>
        </div>
    `;
    categoryList.innerHTML += allCategoriesHTML;
    
    // Add each category
    categories.forEach(category => {
        const categoryHTML = `
            <div class="category-item" data-category="${category.id}">
                <span>${category.name}</span>
                <span class="category-count" id="cat${category.id}Count">0</span>
            </div>
        `;
        categoryList.innerHTML += categoryHTML;
    });
    
    // Add click event listeners
    const categoryItems = categoryList.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            categoryItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Filter articles
            const categoryId = item.dataset.category;
            filterArticles(categoryId);
            
            // Update filter buttons
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                if (btn.dataset.category === categoryId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    });
}

// Load articles
async function loadArticles(categoryId = 'all') {
    try {
        let url = `${API_BASE_URL}/articles`;
        if (categoryId !== 'all') {
            url += `?category=${categoryId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.articles) {
            displayArticles(data.articles);
            updateCategoryCounts(data.articles);
        }
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

function displayArticles(articles) {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = `
            <div class="no-articles">
                <i class="fas fa-book"></i>
                <p>No articles found</p>
            </div>
        `;
        return;
    }
    
    const articlesHTML = articles.map(article => `
        <div class="article-card" data-id="${article.id}">
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
                        <button class="action-btn favorite-btn" data-id="${article.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    articlesGrid.innerHTML = articlesHTML;
    
    // Add event listeners to favorite buttons
    const favoriteBtns = articlesGrid.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(btn.dataset.id, btn);
        });
    });
}

function updateCategoryCounts(articles) {
    // Count articles per category
    const counts = {
        'all': articles.length
    };
    
    articles.forEach(article => {
        const categoryId = article.category_id || 'uncategorized';
        counts[categoryId] = (counts[categoryId] || 0) + 1;
    });
    
    // Update category counts
    Object.keys(counts).forEach(categoryId => {
        const countElement = document.getElementById(`${categoryId === 'all' ? 'all' : 'cat' + categoryId}Count`);
        if (countElement) {
            countElement.textContent = counts[categoryId];
        }
    });
}

// Load popular articles
async function loadPopularArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/articles`);
        const data = await response.json();
        
        if (data.success && data.articles) {
            displayPopularArticles(data.articles);
        }
    } catch (error) {
        console.error('Error loading popular articles:', error);
    }
}

function displayPopularArticles(articles) {
    const popularContainer = document.getElementById('popularArticles');
    if (!popularContainer) return;
    
    // Sort by read count and take top 5
    const popularArticles = [...articles]
        .sort((a, b) => (b.read_count || 0) - (a.read_count || 0))
        .slice(0, 5);
    
    if (popularArticles.length === 0) {
        popularContainer.innerHTML = '<p class="no-articles">No popular articles</p>';
        return;
    }
    
    const articlesHTML = popularArticles.map(article => `
        <div class="popular-article">
            <img src="${article.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'}" alt="${article.title}">
            <div class="popular-info">
                <h4>${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''}</h4>
                <span class="views">${article.read_count || 0} views</span>
            </div>
        </div>
    `).join('');
    
    popularContainer.innerHTML = articlesHTML;
}

// Filter articles
function filterArticles(categoryId) {
    const articlesGrid = document.getElementById('articlesGrid');
    const articleCards = articlesGrid.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        if (categoryId === 'all') {
            card.style.display = 'block';
        } else {
            // This would normally check the article's category
            // For now, show all articles
            card.style.display = 'block';
        }
    });
    
    // Update URL without reloading
    const url = new URL(window.location);
    if (categoryId === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', categoryId);
    }
    window.history.pushState({}, '', url);
}

// Search articles
function searchArticles(query) {
    const articlesGrid = document.getElementById('articlesGrid');
    const articleCards = articlesGrid.querySelectorAll('.article-card');
    
    if (!query.trim()) {
        // Show all articles if search is empty
        articleCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    const searchTerm = query.toLowerCase();
    articleCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Toggle favorite
async function toggleFavorite(articleId, button) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
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
            const icon = button.querySelector('i');
            if (data.isFavorited) {
                icon.className = 'fas fa-heart';
                icon.style.color = '#ef4444';
                showMessage('Added to favorites', 'success');
            } else {
                icon.className = 'far fa-heart';
                icon.style.color = '';
                showMessage('Removed from favorites', 'info');
            }
            
            // Update favorites section
            await updateFavoritesSection();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showMessage('Error updating favorite', 'error');
    }
}

// Update favorites section
async function updateFavoritesSection() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/articles/user/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const favoritesSection = document.getElementById('favoritesSection');
        
        if (favoritesSection) {
            if (data.success && data.articles && data.articles.length > 0) {
                const favoritesHTML = data.articles.slice(0, 3).map(article => `
                    <div class="popular-article">
                        <img src="${article.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'}" alt="${article.title}">
                        <div class="popular-info">
                            <h4>${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''}</h4>
                            <span class="views">${article.read_count || 0} views</span>
                        </div>
                    </div>
                `).join('');
                
                favoritesSection.innerHTML = favoritesHTML;
            } else {
                favoritesSection.innerHTML = '<p>No favorite articles yet</p>';
            }
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Update reading progress
function updateReadingProgress() {
    // This would normally fetch user's reading history from the server
    // For now, use mock data
    const articlesRead = parseInt(localStorage.getItem('articlesRead') || '0');
    const totalArticles = 50; // Mock total articles
    
    const articlesReadElement = document.getElementById('articlesRead');
    const progressFill = document.getElementById('progressFill');
    
    if (articlesReadElement) {
        articlesReadElement.textContent = `${articlesRead} articles read`;
    }
    
    if (progressFill) {
        const percentage = Math.min((articlesRead / totalArticles) * 100, 100);
        progressFill.style.width = `${percentage}%`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Filter articles
            filterArticles(btn.dataset.category);
            
            // Update category list
            const categoryItems = document.querySelectorAll('.category-item');
            categoryItems.forEach(item => {
                if (item.dataset.category === btn.dataset.category) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchArticles(e.target.value);
        });
    }
    
    // Load favorites section if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        updateFavoritesSection();
    }
}