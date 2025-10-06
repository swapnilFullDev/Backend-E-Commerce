const pool = require('../config/database');

class AdminModel {
  static async create(adminData) {
    const { email, password_hash, personal_phone, full_name, profile_image } = adminData;
    const query = `
      INSERT INTO admins (email, password_hash, personal_phone, full_name, profile_image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, personal_phone, full_name, profile_image, status, created_at
    `;
    const values = [email, password_hash, personal_phone, full_name, profile_image];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM admins WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, personal_phone, full_name, profile_image, status, created_at FROM admins WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
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
      UPDATE admins
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, personal_phone, full_name, profile_image, status, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE admins
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, status
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT id, email, personal_phone, full_name, profile_image, status, created_at FROM admins WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = AdminModel;
