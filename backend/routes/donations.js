const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Make a donation
router.post('/', async (req, res) => {
  const { campaign_id, donor_name, email, amount } = req.body;

  // Validation
  if (!campaign_id || !donor_name || !email || !amount)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  if (amount <= 0)
    return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ success: false, message: 'Invalid email address' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check campaign exists and is active
    const [campaign] = await conn.query(
      'SELECT * FROM campaigns WHERE id = ? AND is_active = TRUE FOR UPDATE',
      [campaign_id]
    );

    if (campaign.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Campaign not found or closed' });
    }

    // Insert donation
    const donationId = uuidv4();
    await conn.query(
      'INSERT INTO donations (id, campaign_id, donor_name, email, amount) VALUES (?, ?, ?, ?, ?)',
      [donationId, campaign_id, donor_name, email, amount]
    );

    // Update campaign total (handles concurrency safely)
    await conn.query(
      'UPDATE campaigns SET total_raised = total_raised + ? WHERE id = ?',
      [amount, campaign_id]
    );

    await conn.commit();
    res.json({ success: true, message: 'Donation successful!', donationId });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// Get dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    // Overall stats
    const [overall] = await db.query(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(amount) as total_raised,
        AVG(amount) as avg_donation
      FROM donations
    `);

    // Recent donations (masked email)
    const [recent] = await db.query(`
      SELECT 
        donor_name,
        CONCAT(SUBSTRING(email, 1, 2), '***@***.com') as email,
        amount,
        campaign_id,
        created_at
      FROM donations
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Top donors (masked)
    const [topDonors] = await db.query(`
      SELECT 
        donor_name,
        CONCAT(SUBSTRING(email, 1, 2), '***@***.com') as email,
        SUM(amount) as total_donated
      FROM donations
      GROUP BY email, donor_name
      ORDER BY total_donated DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: { overall: overall[0], recent, topDonors }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;