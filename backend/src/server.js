const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const testRoutes = require('./routes/testRoutes');
const profileRoutes = require('./routes/profileRoutes');
const musicRoutes = require('./routes/musicRoutes'); // Добавьте эту строку

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/music', musicRoutes); // Добавьте эту строку

// About endpoint
app.get('/api/about', (req, res) => {
  res.json({
    success: true,
    project: {
      name: 'MentalCare - Student Helper Platform',
      version: '1.0.0',
      description: 'Platform for student mental health and study efficiency',
      features: [
        'Stress management articles',
        'Stress level testing',
        'Focus music',
        'Study tips and motivation'
      ]
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});