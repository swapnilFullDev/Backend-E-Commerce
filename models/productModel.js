const pool = require('../config/database');

class ProductModel {
  static async create(productData) {
    const {
      store_id,
      category_id,
      subcategory_id,
      name,
      description,
      price,
      stock_quantity,
      images,
      sku
    } = productData;

    const query = `
      INSERT INTO products (
        store_id, category_id, subcategory_id, name, description,
        price, stock_quantity, images, sku
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      store_id,
      category_id,
      subcategory_id,
      name,
      description,
      price,
      stock_quantity || 0,
      JSON.stringify(images || []),
      sku
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, c.name as category_name, s.store_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stores s ON p.store_id = s.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByStoreId(storeId, filters = {}) {
    let query = 'SELECT * FROM products WHERE store_id = $1';
    const values = [storeId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.category_id) {
      query += ` AND category_id = $${paramIndex}`;
      values.push(filters.category_id);
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

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'images') {
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
      UPDATE products
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE products
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async updateStock(id, quantity) {
    const query = `
      UPDATE products
      SET stock_quantity = stock_quantity + $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT p.*, c.name as category_name, s.store_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stores s ON p.store_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND p.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.store_id) {
      query += ` AND p.store_id = $${paramIndex}`;
      values.push(filters.store_id);
      paramIndex++;
    }

    if (filters.category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      values.push(filters.category_id);
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

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

  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ProductModel;
