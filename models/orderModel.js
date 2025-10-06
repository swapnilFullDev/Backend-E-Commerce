const pool = require('../config/database');

class OrderModel {
  static async create(orderData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        order_number,
        customer_id,
        store_id,
        total_amount,
        payment_status,
        payment_method,
        order_status,
        commission_earned,
        shipping_address,
        items
      } = orderData;

      const orderQuery = `
        INSERT INTO orders (
          order_number, customer_id, store_id, total_amount, payment_status,
          payment_method, order_status, commission_earned, shipping_address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const orderValues = [
        order_number,
        customer_id,
        store_id,
        total_amount,
        payment_status || 'pending',
        payment_method,
        order_status || 'pending',
        commission_earned || 0,
        JSON.stringify(shipping_address)
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      if (items && items.length > 0) {
        for (const item of items) {
          const itemQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(itemQuery, [
            order.id,
            item.product_id,
            item.quantity,
            item.price,
            item.subtotal
          ]);
        }
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const query = `
      SELECT o.*,
        c.name as customer_name, c.email as customer_email,
        s.store_name,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, c.id, s.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [orderNumber]);
    return result.rows[0];
  }

  static async findByStoreId(storeId, filters = {}) {
    let query = 'SELECT * FROM orders WHERE store_id = $1';
    const values = [storeId];
    let paramIndex = 2;

    if (filters.order_status) {
      query += ` AND order_status = $${paramIndex}`;
      values.push(filters.order_status);
      paramIndex++;
    }

    if (filters.payment_status) {
      query += ` AND payment_status = $${paramIndex}`;
      values.push(filters.payment_status);
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
        if (key === 'shipping_address') {
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
      UPDATE orders
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE orders
      SET order_status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT o.*,
        c.name as customer_name,
        s.store_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN stores s ON o.store_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.order_status) {
      query += ` AND o.order_status = $${paramIndex}`;
      values.push(filters.order_status);
      paramIndex++;
    }

    if (filters.store_id) {
      query += ` AND o.store_id = $${paramIndex}`;
      values.push(filters.store_id);
      paramIndex++;
    }

    query += ' ORDER BY o.created_at DESC';

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

module.exports = OrderModel;
