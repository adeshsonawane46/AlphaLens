const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analysisRoutes = require('./routes/analysis');
const watchlistRoutes = require('./routes/watchlist');
const simulationRoutes = require('./routes/simulation');
const { query } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/simulation', simulationRoutes);

// Health check and db connection test
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'healthy', database: 'ready' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Local in-memory JSON database initialized.');
});

