const express = require('express');
const router = express.Router();
const csvRegistryService = require('../services/csvRegistryService');

// GET /api/products - list all 25 catalogue products
router.get('/', (req, res) => {
  try {
    const products = csvRegistryService.getProducts();
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const products = csvRegistryService.getProducts();
    const product = products.find(p => p.product_id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
