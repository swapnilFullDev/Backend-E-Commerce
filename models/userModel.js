const pool = require('../db');
const bcrypt = require('bcrypt');

class UserModel {
  // This project uses an `admin_user` table for logins (see schema). Query that table
  // and join `business_details` (if present). Avoid failing the entire request if
  // `business_details` table is missing.
  static async getUserByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT a.*, b.*
       FROM admin_user a
       LEFT JOIN business_details b ON a.businessId = b.id
       WHERE a.username = ? OR a.email = ?
       LIMIT 1`,
      [username, username]
    );

    return rows[0] || null;
  }

  // Update password for admin user. Use passwordHash column from admin_user.
  static async updateUserPassword(username, businessId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      `UPDATE admin_user SET passwordHash = ? WHERE (username = ? OR email = ?) AND (businessId = ?)`,
      [hashedPassword, username, username, businessId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No admin user found with the provided username/email and business ID');
    }

    return true;
  }
}

module.exports = UserModel;