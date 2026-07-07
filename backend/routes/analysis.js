const express = require('express');
const router = express.Router();
const { 
  analyzeTicker, 
  getCompanyReport, 
  getLiveLogs, 
  getHistory,
  askAi,
  compareCompanies,
  getAutocomplete
} = require('../controllers/analysisController');

router.post('/analyze', analyzeTicker);
router.get('/report/:ticker', getCompanyReport);
router.get('/logs/:ticker', getLiveLogs);
router.get('/history', getHistory);
router.post('/ask', askAi);
router.get('/compare', compareCompanies);
router.get('/autocomplete', getAutocomplete);

module.exports = router;

