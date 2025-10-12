const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {approveBusinessAndCreateLogin,createSuperAdmin} = require('../models/adminModel');

// Approve or unverify a business and create login
router.put('/approve/:id', authenticateToken, async (req, res) => {
  const businessId = Number(req.params.id);

  try {
    const result = await approveBusinessAndCreateLogin(businessId);

    res.json({
      message: result.message,
      username: result.username,
      tempPassword: result.tempPassword // In production, consider sending securely (e.g., email)
    });
  } catch (error) {
    if (error.message === 'Business not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Approval failed', details: error.message });
  }
});

// POST
router.post('/super', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = await createSuperAdmin(username, password);
    res.status(201).json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;