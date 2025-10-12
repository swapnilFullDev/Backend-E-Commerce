
const pool = require('../db');

class ProductsModel {
  // Get product by ID
  static async getProductById(productId) {
    const [rows] = await pool.execute(
      'SELECT * FROM Products WHERE ID = ?',
      [productId]
    );
    return rows[0];
  }

  // Create new product with category validation
  static async createProduct(product) {
    // 1. Validate Category_ID exists
    const [categoryCheck] = await pool.execute(
      'SELECT ID FROM Categories WHERE ID = ?',
      [product.Category_ID]
    );
    if (categoryCheck.length === 0) {
      throw new Error('Category_ID must reference an existing category');
    }

    // 2. Validate SubCategory_ID exists
    const [subCategoryCheck] = await pool.execute(
      'SELECT ID FROM Categories WHERE ID = ?',
      [product.Subcategory_ID]
    );
    if (subCategoryCheck.length === 0) {
      throw new Error('SubCategory_ID must reference an existing category');
    }

    // 3. Insert product
    const [result] = await pool.execute(
      `
      INSERT INTO Products
        (Business_ID, Category_ID, Subcategory_ID, Name, Description, Price, Stock_Quantity, Images, Status, SKU, Created_At, Updated_At)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        product.Business_ID,
        product.Category_ID,
        product.Subcategory_ID,
        product.Name,
        product.Description || null,
        product.Price,
        product.Stock_Quantity || 0,
        product.Images || null,
        'Pending',
        product.SKU
      ]
    );

    return { ID: result.insertId };
  }

  // Update product by ID
  static async updateProduct(productId, updates) {
    const [result] = await pool.execute(
      `
      UPDATE Products
      SET
        Name = ?,
        Description = ?,
        Price = ?,
        Stock_Quantity = ?,
        Images = ?,
        Status = ?,
        SKU = ?,
        Updated_At = NOW()
      WHERE ID = ?
      `,
      [
        updates.Name,
        updates.Description || null,
        updates.Price,
        updates.Stock_Quantity,
        updates.Images || null,
        updates.Status,
        updates.SKU,
        productId
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('No product found with the given ID');
    }

    return true;
  }

  // Get Product by Status
  static async getProductsByStatus(status) {
    const [rows] = await pool.execute(
      'SELECT * FROM Products WHERE Status = ?',
      [status]
    );
    return rows;
  }

  // Get All products for business
  static async getProductsByBusiness(businessId) {
    const [rows] = await pool.execute(
      'SELECT * FROM Products WHERE Business_ID = ?',
      [businessId]
    );
    return rows;
  }

  // Super Admin Method to Approve/reject/Block
  static async updateProductStatus(productId, newStatus) {
    const validStatuses = ['approved', 'rejected', 'blocked'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const [result] = await pool.execute(
      `
      UPDATE Products
      SET Status = ?,
          Updated_At = NOW()
      WHERE ID = ?
      `,
      [newStatus, productId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No product found with the given ID');
    }

    return true;
  }
}

module.exports = ProductsModel;