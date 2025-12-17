
-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    theme_preference VARCHAR(10) DEFAULT 'light'
);

-- Таблица категорий статей
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Вставка категорий
INSERT INTO categories (name, description) VALUES
('Stress Management', 'Techniques and tips for managing stress'),
('Procrastination', 'How to overcome procrastination'),
('Study Tips', 'Effective study techniques'),
('Motivation', 'Ways to stay motivated');

-- Таблица статей
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    read_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых статей
INSERT INTO articles (title, description, content, category_id, image_url) VALUES
('5 Effective Stress Management Techniques', 'Learn practical ways to reduce stress', 'Stress is a common part of student life...', 1, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'),
('Overcoming Procrastination', 'Strategies to beat procrastination', 'Procrastination affects many students...', 2, 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173'),
('Study Smarter, Not Harder', 'Effective study techniques for students', 'Discover methods to improve your study efficiency...', 3, 'https://images.unsplash.com/photo-1456513080510-3449c76e8c32'),
('Finding Motivation in Difficult Times', 'How to stay motivated during challenging periods', 'Motivation can be hard to maintain...', 4, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b');

-- Таблица результатов тестов
CREATE TABLE stress_tests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    level VARCHAR(20) NOT NULL,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица избранных статей
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- Таблица комментариев
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица музыкальных треков
CREATE TABLE music (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    artist VARCHAR(100),
    category VARCHAR(20) NOT NULL,
    embed_url TEXT NOT NULL,
    duration VARCHAR(10)
);

-- Вставка музыкальных треков
INSERT INTO music (title, artist, category, embed_url, duration) VALUES
('Focus Flow', 'Lofi Study', 'Focus', 'https://www.youtube.com/embed/jfKfPfyJRdk', '∞'),
('Deep Concentration', 'Study Music', 'Focus', 'https://www.youtube.com/embed/7NOSDKb0HlU', '2:00:00'),
('Calm Piano', 'Relaxing Music', 'Relax', 'https://www.youtube.com/embed/BHACKCNDMW8', '1:30:00'),
('Sleep Meditation', 'Sleep Music', 'Sleep', 'https://www.youtube.com/embed/aEgyN1H-1Ds', '8:00:00');

-- Таблица советов
CREATE TABLE tips (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка советов
INSERT INTO tips (content, category) VALUES
('Take regular breaks during study sessions - try the Pomodoro technique!', 'Study'),
('Practice deep breathing for 5 minutes when feeling stressed', 'Stress'),
('Break large tasks into smaller, manageable steps', 'Procrastination'),
('Remember why you started your studies - keep your goals visible', 'Motivation');

-- Индексы для улучшения производительности
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_tests_user ON stress_tests(user_id);