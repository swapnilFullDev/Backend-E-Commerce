const pool = require('../config/database');

class RentalModel {
  static async create(rentalData) {
    const {
      store_id,
      customer_id,
      product_id,
      rental_start_date,
      rental_end_date,
      security_deposit
    } = rentalData;

    const query = `
      INSERT INTO rentals (
        store_id, customer_id, product_id, rental_start_date,
        rental_end_date, security_deposit
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      store_id,
      customer_id,
      product_id,
      rental_start_date,
      rental_end_date,
      security_deposit || 0
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT r.*,
        c.name as customer_name,
        p.name as product_name,
        s.store_name
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN stores s ON r.store_id = s.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByStoreId(storeId, filters = {}) {
    let query = 'SELECT * FROM rentals WHERE store_id = $1';
    const values = [storeId];
    let paramIndex = 2;

    if (filters.return_status) {
      query += ` AND return_status = $${paramIndex}`;
      values.push(filters.return_status);
      paramIndex++;
    }

    query += ' ORDER BY rental_start_date DESC';

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
      UPDATE rentals
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateReturnStatus(id, returnStatus, penalty = 0) {
    const query = `
      UPDATE rentals
      SET return_status = $1, penalty = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [returnStatus, penalty, id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT r.*,
        c.name as customer_name,
        p.name as product_name,
        s.store_name
      FROM rentals r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN stores s ON r.store_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.store_id) {
      query += ` AND r.store_id = $${paramIndex}`;
      values.push(filters.store_id);
      paramIndex++;
    }

    if (filters.return_status) {
      query += ` AND r.return_status = $${paramIndex}`;
      values.push(filters.return_status);
      paramIndex++;
    }

    query += ' ORDER BY r.rental_start_date DESC';

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

module.exports = RentalModel;
