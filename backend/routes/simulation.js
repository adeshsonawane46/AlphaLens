const express = require('express');
const router = express.Router();
const { getSimulationHistory, saveSimulation } = require('../controllers/simulationController');

router.get('/:userId', getSimulationHistory);
router.post('/save', saveSimulation);

module.exports = router;
