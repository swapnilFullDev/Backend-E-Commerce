const pool = require('../db');

class CategoryModel {
  // Get all top-level categories (Parent_ID IS NULL)
  static async getCategories(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const searchParm = `%${search}%`;
    const sql = `SELECT * FROM Categories 
       WHERE Parent_ID IS NULL AND Name LIKE ? 
       ORDER BY Name ASC 
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}
       `;
    const [rows] = await pool.execute(sql,[searchParm]);
    return rows;
  }
  

  // Get subcategories by parent ID
  static async getSubcategories(parentId) {
    const [rows] = await pool.execute(
      "SELECT * FROM Categories WHERE Parent_ID = ? ORDER BY Name ASC",
      [parentId]
    );
    return rows;
  }s

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

  static async updateCategory(id, { name, image, icon, status }) {
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
  
    if (name !== undefined) {
      fields.push('Name = ?');
      values.push(name);
    }
    if (image !== undefined) {
      fields.push('Image = ?');
      values.push(image);
    }
    if (icon !== undefined) {
      fields.push('Icon = ?');
      values.push(icon);
    }
    if (status !== undefined) {
      fields.push('Status = ?');
      values.push(status);
    }
  
    if (fields.length === 0) {
      throw new Error('No fields provided to update');
    }
  
    values.push(id); // for WHERE clause
  
    const sql = `UPDATE Categories SET ${fields.join(', ')} WHERE ID = ?`;
    await pool.execute(sql, values);
  }

   // 🆕 Check if category has subcategories
   static async hasSubcategories(categoryId) {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM Categories WHERE Parent_ID = ?",
      [categoryId]
    );
    return rows[0].count > 0;
  }


    // 🆕 Check if category has linked products
    static async hasProducts(categoryId) {
        const [rows] = await pool.execute(
          "SELECT COUNT(*) AS count FROM Products WHERE Category_ID = ?",
          [categoryId]
        );
        return rows[0].count > 0;
      }

      // 🆕 Delete category safely
  static async deleteCategory(categoryId) {
    const hasSub = await this.hasSubcategories(categoryId);
    if (hasSub) {
      const error = new Error('Cannot delete category with existing subcategories.');
      error.code = 'HAS_SUBCATEGORIES';
      throw error;
    }

    const hasProd = await this.hasProducts(categoryId);
    if (hasProd) {
      const error = new Error('Cannot delete category linked to products.');
      error.code = 'HAS_PRODUCTS';
      throw error;
    }

    await pool.execute("DELETE FROM Categories WHERE ID = ?", [categoryId]);
    return true;
  }
}

module.exports = CategoryModel;
