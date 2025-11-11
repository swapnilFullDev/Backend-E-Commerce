const pool = require('../db');
const bcrypt = require('bcrypt');

class UserModel {
  static async getUserByUsername(username) {
    const [rows] = await pool.execute(
      `
      SELECT u.*, b.*
      FROM admin_user u
      JOIN business_details b ON u.businessId = b.id
      WHERE u.email = ?
      `,
      [username]
    );

    return rows[0];
  }

  static async updateUserPassword(email, newPassword) {
    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      `
      UPDATE users
      SET password = ?, confirmPassword = ?
      WHERE email = ?
      `,
      [hashedPassword, hashedPassword, email]
    );

    // result.affectedRows gives the number of updated rows
    if (result.affectedRows === 0) {
      throw new Error('No user found with the provided username and business ID');
    }

    return true;
  }
}

module.exports = UserModel;