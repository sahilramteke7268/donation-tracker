const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all active campaigns
router.get('/', async (req, res) => {
  try {
    const [campaigns] = await db.query(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const [campaign] = await db.query(
      'SELECT * FROM campaigns WHERE id = ?',
      [req.params.id]
    );
    if (campaign.length === 0)
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;