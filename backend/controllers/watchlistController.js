const { query } = require('../database/db');

async function getWatchlist(req, res) {
  const { userId } = req.params;
  try {
    const list = await query(`
      SELECT c.*, r.alphalens_score, r.conviction 
      FROM watchlist w
      JOIN companies c ON w.company_id = c.id
      LEFT JOIN analysis_reports r ON r.company_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);
    
    res.json({ watchlist: list });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function addToWatchlist(req, res) {
  const { userId, companyId } = req.body;
  if (!userId || !companyId) {
    return res.status(400).json({ error: 'User ID and Company ID are required' });
  }

  try {
    await query(
      'INSERT IGNORE INTO watchlist (user_id, company_id) VALUES (?, ?)',
      [userId, companyId]
    );
    res.json({ message: 'Added to watchlist' });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function removeFromWatchlist(req, res) {
  const { userId, companyId } = req.body;
  if (!userId || !companyId) {
    return res.status(400).json({ error: 'User ID and Company ID are required' });
  }

  try {
    await query(
      'DELETE FROM watchlist WHERE user_id = ? AND company_id = ?',
      [userId, companyId]
    );
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
