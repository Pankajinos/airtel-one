const express = require('express');
const router = express.Router();
const store = require('../db/store');
const csvRegistryService = require('../services/csvRegistryService');
const aiService = require('../services/aiService');

// POST /api/business/generate-problems - generate 6 specific problems for this business category using LLM
router.post('/generate-problems', async (req, res) => {
  try {
    const { businessType, businessName, context } = req.body;
    if (!businessType) {
      return res.status(400).json({ success: false, error: 'businessType is required' });
    }
    const problems = await aiService.generateProblemsForBusinessType(businessType, businessName, context);
    res.json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/business - create business profile
router.post('/', async (req, res) => {
  try {
    const profile = await store.saveBusinessProfile(req.body);
    res.status(201).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/business/save-selection - persist selected products to profile in DB
router.post('/save-selection', async (req, res) => {
  try {
    const { profileId, selectedProducts, monthlyTotal, setupTotal } = req.body;
    const updated = await store.updateBusinessProfile(profileId, {
      selectedProducts: selectedProducts || [],
      monthlyTotal: Number(monthlyTotal) || 0,
      setupTotal: Number(setupTotal) || 0,
      selectionSavedAt: new Date().toISOString()
    });
    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/business/sample-leads - demo quick presets from smb_leads.csv
router.get('/sample-leads', (req, res) => {
  try {
    const leads = csvRegistryService.getSampleLeads();
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/business/:id - get profile
router.get('/:id', async (req, res) => {
  try {
    const profile = await store.getBusinessProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Business profile not found' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
