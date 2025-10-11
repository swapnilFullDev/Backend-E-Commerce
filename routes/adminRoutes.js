const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const adminModel = require('../models/adminModel');

// Approve or unverify a business and create login
router.put('/approve/:id', authenticateToken, async (req, res) => {
  const businessId = Number(req.params.id);

  try {
    const result = await adminModel.approveBusinessAndCreateLogin(businessId);

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

module.exports = router;