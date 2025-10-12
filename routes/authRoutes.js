const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';


// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if account is active
    if (!user.IsActive) {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.UserId, // adjust if your MySQL column is `id`
        businessId: user.BusinessId,
        username: user.Username
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      username: user.Username,
      role: user.Role
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});


// Reset password route
router.post('/reset', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const user = await UserModel.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Username not found' });
    }

    if (!user.IsActive) {
      return res.status(403).json({ error: 'Account is inactive. Cannot reset password.' });
    }

    await UserModel.updateUserPassword(user.Username, user.BusinessId, newPassword);

    res.json({
      message: 'Password reset successful.'
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Password reset failed', details: err.message });
  }
});

module.exports = router;