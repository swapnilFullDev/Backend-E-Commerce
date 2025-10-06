const pool = require('../config/database');

class CategoryModel {
  static async create(categoryData) {
    const { name, image, icon, parent_id } = categoryData;

    const query = `
      INSERT INTO categories (name, image, icon, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, image, icon, parent_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM categories WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null) {
        query += ' AND parent_id IS NULL';
      } else {
        query += ` AND parent_id = $${paramIndex}`;
        values.push(filters.parent_id);
        paramIndex++;
      }
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getWithSubcategories() {
    const query = `
      SELECT c.*,
        json_agg(
          json_build_object(
            'id', sc.id,
            'name', sc.name,
            'image', sc.image,
            'icon', sc.icon,
            'status', sc.status
          )
        ) FILTER (WHERE sc.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN categories sc ON c.id = sc.parent_id
      WHERE c.parent_id IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    values.push(id);
    const query = `
      UPDATE categories
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE categories
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = CategoryModel;
