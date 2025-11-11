const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// ✅ Login User
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {    
    const user = await UserModel.getUserByUsername(username);
    console.log(user);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check account status
    if (user.status === 'Inactive' || user.isDeleted === 1) {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        business_id: user.businessId,
        business_name: user.business_name
      },
      JWT_SECRET,
      { expiresIn: '6h' }
    );

    res.json({
      token,
      email: user.email,
      name: user.username,
      role: user.role,
      business_id: user.businessId,
      businessName: user.business_name,
      message: 'Login successful'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

// ✅ Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Email not found' });
    }

    if (user.status === 'Inactive' || user.isDeleted === 1) {
      return res.status(403).json({ error: 'Account is inactive. Cannot reset password.' });
    }

    await UserModel.updateUserPassword(email, newPassword);

    res.json({
      message: 'Password reset successful.'
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Password reset failed', details: err.message });
  }
};