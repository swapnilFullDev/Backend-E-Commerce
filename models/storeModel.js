const pool = require('../config/database');

class StoreModel {
  static async create(storeData) {
    const {
      owner_id,
      store_name,
      store_address,
      business_number,
      gst_business_id,
      logo_upload,
      contact_number,
      email,
      payment_setting,
      store_banner,
      documents
    } = storeData;

    const query = `
      INSERT INTO stores (
        owner_id, store_name, store_address, business_number, gst_business_id,
        logo_upload, contact_number, email, payment_setting, store_banner, documents
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      owner_id,
      store_name,
      store_address,
      business_number,
      gst_business_id,
      logo_upload,
      contact_number,
      email,
      JSON.stringify(payment_setting || {}),
      store_banner,
      JSON.stringify(documents || [])
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM stores WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByOwnerId(ownerId) {
    const query = 'SELECT * FROM stores WHERE owner_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [ownerId]);
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'payment_setting' || key === 'documents') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(JSON.stringify(updates[key]));
        } else {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
        }
        paramIndex++;
      }
    });

    values.push(id);
    const query = `
      UPDATE stores
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE stores
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM stores WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.owner_id) {
      query += ` AND owner_id = $${paramIndex}`;
      values.push(filters.owner_id);
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

  static async getCount(filters = {}) {
    let query = 'SELECT COUNT(*) FROM stores WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async delete(id) {
    const query = 'DELETE FROM stores WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = StoreModel;
