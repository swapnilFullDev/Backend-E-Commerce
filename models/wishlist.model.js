const pool = require('../config/db');

class Wishlist {
  static async create(data) {
    try {
      const sql = `
        INSERT INTO wishlist (userId, productId, productName, productImage, price, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sql, [
        data.userId,
        data.productId,
        data.productName,
        data.productImage,
        data.price,
        data.description,
      ]);
      return result.insertId;
    } catch (error) {
      throw new Error('Error adding item to wishlist: ' + error.message);
    }
  }

  static async getAllByUser(userId) {
    try {
      const sql = 'SELECT * FROM wishlist WHERE userId = ?';
      const [rows] = await pool.query(sql, [userId]);
      return rows;
    } catch (error) {
      throw new Error('Error fetching wishlist: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      const sql = 'SELECT * FROM wishlist WHERE id = ?';
      const [rows] = await pool.query(sql, [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Error fetching wishlist item: ' + error.message);
    }
  }

  static async update(id, data) {
    try {
      const sql = `
        UPDATE wishlist
        SET productName = ?, productImage = ?, price = ?, description = ?
        WHERE id = ?
      `;
      const [result] = await pool.query(sql, [
        data.productName,
        data.productImage,
        data.price,
        data.description,
        id,
      ]);
      return result.affectedRows;
    } catch (error) {
      throw new Error('Error updating wishlist item: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM wishlist WHERE id = ?';
      const [result] = await pool.query(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error('Error deleting wishlist item: ' + error.message);
    }
  }

  static async moveToBuyItem(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch wishlist item
      const [rows] = await connection.query('SELECT * FROM wishlist WHERE id = ?', [id]);
      const item = rows[0];
      if (!item) throw new Error('Wishlist item not found');

      // Insert into buyItem
      const insertSql = `
        INSERT INTO buyItem (userId, productId, productName, productImage, price, description, quantity, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `;
      await connection.query(insertSql, [
        item.userId,
        item.productId,
        item.productName,
        item.productImage,
        item.price,
        item.description,
        1, // default quantity
      ]);

      // Delete from wishlist
      await connection.query('DELETE FROM wishlist WHERE id = ?', [id]);

      await connection.commit();
      return { message: 'Item moved to Buy Item successfully' };
    } catch (error) {
      await connection.rollback();
      throw new Error('Error moving item to Buy Item: ' + error.message);
    } finally {
      connection.release();
    }
  }
}

module.exports = Wishlist;
