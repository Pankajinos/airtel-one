const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/recommendations - get 3 plans (Starter, Recommended, Premium)
router.post('/', async (req, res) => {
  try {
    const profile = req.body || {};
    const recommendations = await aiService.getRecommendations(profile);
    res.json({
      success: true,
      recommendations
    });
  } catch (err) {
    console.error('[Recommendations Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
