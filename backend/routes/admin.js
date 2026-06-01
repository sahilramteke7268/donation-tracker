const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all donations (admin)
router.get('/donations', async (req, res) => {
  try {
    const [donations] = await db.query(`
      SELECT d.*, c.name as campaign_name 
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Close a campaign
router.patch('/campaigns/:id/close', async (req, res) => {
  try {
    await db.query(
      'UPDATE campaigns SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Campaign closed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reopen a campaign
router.patch('/campaigns/:id/reopen', async (req, res) => {
  try {
    await db.query(
      'UPDATE campaigns SET is_active = TRUE WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Campaign reopened successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get campaign analytics
router.get('/analytics', async (req, res) => {
  try {
    const [analytics] = await db.query(`
      SELECT 
        c.name,
        c.goal_amount,
        c.total_raised,
        c.is_active,
        COUNT(d.id) as donation_count,
        ROUND((c.total_raised / c.goal_amount) * 100, 2) as progress_percent
      FROM campaigns c
      LEFT JOIN donations d ON c.id = d.campaign_id
      GROUP BY c.id
    `);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;