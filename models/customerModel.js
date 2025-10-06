const pool = require('../config/database');

class CustomerModel {
  static async create(customerData) {
    const { name, email, phone } = customerData;

    const query = `
      INSERT INTO customers (name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [name, email, phone];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM customers WHERE email = $1';
    const result = await pool.query(query, [email]);
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
      UPDATE customers
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateOrderStats(id, orderAmount) {
    const query = `
      UPDATE customers
      SET order_history = order_history + 1,
          total_spent = total_spent + $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [orderAmount, id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE customers
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM customers WHERE 1=1';
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

  static async getCount() {
    const query = 'SELECT COUNT(*) FROM customers';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = CustomerModel;
