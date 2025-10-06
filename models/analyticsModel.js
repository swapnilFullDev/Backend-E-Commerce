const pool = require('../config/database');

class AnalyticsModel {
  static async create(analyticsData) {
    const { store_id, metric_type, metric_value, period, date } = analyticsData;

    const query = `
      INSERT INTO analytics (store_id, metric_type, metric_value, period, date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [store_id, metric_type, metric_value, period, date];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getSalesReport(storeId, startDate, endDate) {
    const query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total_orders,
        SUM(total_amount) as total_sales,
        AVG(total_amount) as average_order_value
      FROM orders
      WHERE store_id = $1
        AND created_at >= $2
        AND created_at <= $3
        AND order_status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const result = await pool.query(query, [storeId, startDate, endDate]);
    return result.rows;
  }

  static async getTopProducts(storeId, limit = 10) {
    const query = `
      SELECT
        p.id,
        p.name,
        p.price,
        COUNT(oi.id) as times_ordered,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.subtotal) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.store_id = $1
        AND o.order_status != 'cancelled'
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [storeId, limit]);
    return result.rows;
  }

  static async getCustomerGrowth(storeId, period = 'monthly') {
    const dateFormat = period === 'daily' ? 'YYYY-MM-DD' : 'YYYY-MM';

    const query = `
      SELECT
        TO_CHAR(c.created_at, $2) as period,
        COUNT(DISTINCT c.id) as new_customers
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.store_id = $1
      GROUP BY TO_CHAR(c.created_at, $2)
      ORDER BY period DESC
    `;

    const result = await pool.query(query, [storeId, dateFormat]);
    return result.rows;
  }

  static async getRevenueByCategory(storeId) {
    const query = `
      SELECT
        c.name as category_name,
        COUNT(oi.id) as total_orders,
        SUM(oi.quantity) as total_items_sold,
        SUM(oi.subtotal) as total_revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.store_id = $1
        AND o.order_status != 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, [storeId]);
    return result.rows;
  }

  static async getStoreSummary(storeId) {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM products WHERE store_id = $1 AND status = 'approved') as total_products,
        (SELECT COUNT(*) FROM orders WHERE store_id = $1) as total_orders,
        (SELECT SUM(total_amount) FROM orders WHERE store_id = $1 AND order_status != 'cancelled') as total_revenue,
        (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE store_id = $1) as total_customers,
        (SELECT COUNT(*) FROM orders WHERE store_id = $1 AND order_status = 'pending') as pending_orders,
        (SELECT AVG(total_amount) FROM orders WHERE store_id = $1 AND order_status != 'cancelled') as average_order_value
    `;

    const result = await pool.query(query, [storeId]);
    return result.rows[0];
  }

  static async getOverallSummary() {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM stores WHERE status = 'approved') as total_stores,
        (SELECT COUNT(*) FROM products WHERE status = 'approved') as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT SUM(total_amount) FROM orders WHERE order_status != 'cancelled') as total_revenue,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT SUM(commission_earned) FROM orders WHERE order_status = 'delivered') as total_commission
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = AnalyticsModel;
