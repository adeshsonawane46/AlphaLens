const { query } = require('../database/db');

async function getSimulationHistory(req, res) {
  const { userId } = req.params;
  try {
    const history = await query(`
      SELECT s.*, c.ticker, c.name 
      FROM simulation_history s
      JOIN companies c ON s.company_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
      LIMIT 10
    `, [userId]);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching simulation history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveSimulation(req, res) {
  const { userId, companyId, parameters, resultScore } = req.body;
  if (!companyId || resultScore === undefined || !parameters) {
    return res.status(400).json({ error: 'Missing simulation data' });
  }

  try {
    const result = await query(
      'INSERT INTO simulation_history (user_id, company_id, parameters, result_score) VALUES (?, ?, ?, ?)',
      [userId || null, companyId, JSON.stringify(parameters), resultScore]
    );
    res.json({
      message: 'Simulation saved successfully',
      simulationId: result.insertId
    });
  } catch (error) {
    console.error('Error saving simulation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getSimulationHistory,
  saveSimulation
};
