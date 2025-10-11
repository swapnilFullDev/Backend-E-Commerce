const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Expected format: "Bearer <token>"
  
    if (!token) { 
      return res.status(401).json({ message: 'Access token missing' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
  
      req.user = user; // You can now access userId, username, etc. from req.user
      next();
    });
  }
  
  module.exports = {
    authenticateToken
  }