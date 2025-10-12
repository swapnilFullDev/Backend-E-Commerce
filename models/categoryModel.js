const pool = require('../db');

class CategoryModel {
  // Get all top-level categories (Parent_ID IS NULL)
  static async getCategories() {
    const [rows] = await pool.query(
      "SELECT * FROM Categories WHERE Parent_ID IS NULL AND Status = 'active' ORDER BY Name ASC"
    );
    return rows;
  }

  // Get subcategories by parent ID
  static async getSubcategories(parentId) {
    const [rows] = await pool.execute(
      "SELECT * FROM Categories WHERE Parent_ID = ? AND Status = 'active' ORDER BY Name ASC",
      [parentId]
    );
    return rows;
  }

  static async createCategory({ name, image = null, icon = null, parentId = null, status = 'active' }) {
    const [result] = await pool.execute(
      `INSERT INTO Categories (Name, Image, Icon, Parent_ID, Status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, image, icon, parentId, status]
    );
    return result.insertId; // Return the newly created category ID
  }

  // Optional: Get category by ID
  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM Categories WHERE ID = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = CategoryModel;
