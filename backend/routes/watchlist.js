const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');

router.get('/:userId', getWatchlist);
router.post('/add', addToWatchlist);
router.post('/remove', removeFromWatchlist);

module.exports = router;
