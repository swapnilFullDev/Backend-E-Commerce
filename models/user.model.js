const pool = require('../db');

class User {
  static async create(userData) {
    const sql = `
      INSERT INTO users 
      (fullName, email, password, confirmPassword, phone, address, gender, profileImage, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      userData.fullName,
      userData.email,
      userData.password,
      userData.confirmPassword,
      userData.phone,
      userData.address,
      userData.gender,
      userData.profileImage,
      userData.status || 'Active'
    ];
    const [result] = await pool.execute(sql, values);
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE isDeleted = FALSE`);
    return rows;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ? AND isDeleted = FALSE`, [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE id = ? AND isDeleted = FALSE`, [id]);
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    for (let key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND isDeleted = FALSE`;
    const [result] = await pool.execute(sql, values);
    return result;
  }

  static async softDelete(id) {
    const [result] = await pool.execute(`UPDATE users SET isDeleted = TRUE WHERE id = ?`, [id]);
    return result;
  }

  static async hardDelete(id) {
    const [result] = await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return result;
  }
}

module.exports = User;
