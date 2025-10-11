const pool = require('../db');

class BusinessModel {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO BusinessDetails 
        (OwnerName, BusinessName, BusinessEmail, BusinessPhoneNo, PersonalPhoneNo, GSTNumber, BusinessDocs, BusinessAddress, BusinessFrontImage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.OwnerName,
        data.BusinessName,
        data.BusinessEmail,
        data.BusinessPhoneNo,
        data.PersonalPhoneNo,
        data.GSTNumber,
        data.BusinessDocs,
        data.BusinessAddress,
        data.BusinessFrontImage
      ]
    );

    // MySQL gives you the inserted ID via result.insertId
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM BusinessDetails ORDER BY ID DESC'
    );
    return rows;
  }

  static async getUnverified() {
    const [rows] = await pool.query(
      'SELECT * FROM BusinessDetails WHERE isVerified = 0 ORDER BY ID DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM BusinessDetails WHERE ID = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE BusinessDetails SET
        OwnerName = ?,
        BusinessName = ?,
        BusinessEmail = ?,
        BusinessPhoneNo = ?,
        PersonalPhoneNo = ?,
        GSTNumber = ?,
        BusinessDocs = ?,
        BusinessAddress = ?,
        BusinessFrontImage = ?
      WHERE ID = ?`,
      [
        data.OwnerName,
        data.BusinessName,
        data.BusinessEmail,
        data.BusinessPhoneNo,
        data.PersonalPhoneNo,
        data.GSTNumber,
        data.BusinessDocs,
        data.BusinessAddress,
        data.BusinessFrontImage,
        id
      ]
    );
  }

  static async delete(id) {
    await pool.execute(
      'DELETE FROM BusinessDetails WHERE ID = ?',
      [id]
    );
  }
}

module.exports = BusinessModel;