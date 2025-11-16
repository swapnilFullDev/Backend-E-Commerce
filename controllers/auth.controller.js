const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// ✅ Login User
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if account is active (admin_user uses `isActive`)
    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id, // admin_user.id
        businessId: user.businessId,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      email: user.email || user.username,
      role: user.role,
      name: user.business_name || (user.business && user.business.business_name) || null
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

// ✅ Reset Password
exports.resetPassword = async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const user = await UserModel.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Username not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive. Cannot reset password.' });
    }

    await UserModel.updateUserPassword(user.username || user.Username || user.email, user.businessId || user.BusinessId, newPassword);

    res.json({
      message: 'Password reset successful.'
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Password reset failed', details: err.message });
  }
};
