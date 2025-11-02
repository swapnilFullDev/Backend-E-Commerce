const pool = require('../db');
const bcrypt = require('bcrypt');

class DeliveryRiderModel {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await pool.execute(
      `INSERT INTO DeliveryRider
       (Name, Address, Email, Phone, PasswordHash, IsActive, AadharCardNumber, DrivingLicenseNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.address,
        data.email,
        data.phone,
        hashedPassword,
        data.isActive !== undefined ? data.isActive : true,
        data.aadharCardNumber,
        data.drivingLicenseNumber
      ]
    );
    return result.insertId;
  }

  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT ID, Name, Address, Email, Phone, IsActive, AadharCardNumber, DrivingLicenseNumber
       FROM DeliveryRider
       WHERE Name LIKE ? OR Email LIKE ? OR Phone LIKE ?
       ORDER BY ID DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      `SELECT ID, Name, Address, Email, Phone, IsActive, AadharCardNumber, DrivingLicenseNumber
       FROM DeliveryRider WHERE ID = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    let query = `UPDATE DeliveryRider SET Name = ?, Address = ?, Email = ?, Phone = ?, IsActive = ?, AadharCardNumber = ?, DrivingLicenseNumber = ?`;
    const params = [
      data.name,
      data.address,
      data.email,
      data.phone,
      data.isActive,
      data.aadharCardNumber,
      data.drivingLicenseNumber
    ];

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      query += `, PasswordHash = ?`;
      params.push(hashedPassword);
    }
    query += ` WHERE ID = ?`;
    params.push(id);

    await pool.execute(query, params);
  }

  static async delete(id) {
    await pool.execute(
      `DELETE FROM DeliveryRider WHERE ID = ?`,
      [id]
    );
  }
}

module.exports = DeliveryRiderModel;