// routes/debug.js
const router = require('express').Router();
const { cache } = require('../middleware/cache');

// simple cached endpoint: current time (MISS then HIT)
router.get('/cached-time', 
  cache((req) => 'debug:cached-time', 30),     // 30s TTL
  (req, res) => res.json({ now: new Date().toISOString() })
);

module.exports = router;
