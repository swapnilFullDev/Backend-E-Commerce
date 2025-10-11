const pool = require('../db');
const bcrypt = require('bcrypt');

class UserModel {
  static async getUserByUsername(username) {
    const [rows] = await pool.execute(
      `
      SELECT u.*, b.isVerified
      FROM Users u
      JOIN BusinessDetails b ON u.BusinessId = b.ID
      WHERE u.Username = ?
      `,
      [username]
    );

    return rows[0];
  }

  static async updateUserPassword(username, businessId, newPassword) {
    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      `
      UPDATE Users
      SET PasswordHash = ?
      WHERE Username = ? AND BusinessId = ?
      `,
      [hashedPassword, username, businessId]
    );

    // result.affectedRows gives the number of updated rows
    if (result.affectedRows === 0) {
      throw new Error('No user found with the provided username and business ID');
    }

    return true;
  }
}

module.exports = UserModel;