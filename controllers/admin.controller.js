const { approveBusinessAndCreateLogin, createSuperAdmin } = require('../models/adminModel');

// ✅ Approve or unverify a business and create login
exports.approveBusinessAndCreateLogin = async (req, res) => {
  const businessId = Number(req.params.id);

  try {
    const result = await approveBusinessAndCreateLogin(businessId);
    res.json({
      message: result.message,
      username: result.username,
      tempPassword: result.tempPassword // In production, consider emailing this instead
    });
  } catch (error) {
    if (error.message === 'Business not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Approval failed', details: error.message });
  }
};

// ✅ Create a Super Admin
exports.createSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = await createSuperAdmin(username, password);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating super admin:', error);
    res.status(500).json({ error: error.message });
  }
};
