const pool = require("../db")

class ProductsModel {
  // Get product by ID
  static async getProductById(productId) {
    const [rows] = await pool.execute("SELECT * FROM Products WHERE ID = ?", [productId])
    return rows[0]
  }

  static async getAllProducts(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit
    const searchQuery = `%${search}%`

    // Get total count
    const [countResult] = await pool.execute("SELECT COUNT(*) as total FROM Products WHERE Name LIKE ?", [searchQuery])
    const total = countResult[0].total

    // Get paginated results
    const [rows] = await pool.execute(
      `SELECT * FROM Products
       WHERE Name LIKE ?
       ORDER BY Created_At DESC
       LIMIT ? OFFSET ?`,
      [searchQuery, limit, offset],
    )

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Create new product with category validation
  static async createProduct(product) {
    // Validate required fields
    if (
      !product.Business_ID ||
      !product.Category_ID ||
      !product.Subcategory_ID ||
      !product.Name ||
      !product.Price ||
      !product.SKU
    ) {
      throw new Error("Missing required fields: Business_ID, Category_ID, Subcategory_ID, Name, Price, SKU")
    }

    // 1. Validate Category_ID exists
    const [categoryCheck] = await pool.execute("SELECT ID FROM Categories WHERE ID = ?", [product.Category_ID])
    if (categoryCheck.length === 0) {
      throw new Error("Category_ID must reference an existing category")
    }

    // 2. Validate SubCategory_ID exists
    const [subCategoryCheck] = await pool.execute("SELECT ID FROM Categories WHERE ID = ?", [product.Subcategory_ID])
    if (subCategoryCheck.length === 0) {
      throw new Error("SubCategory_ID must reference an existing category")
    }

    // 3. Check for duplicate SKU within the same business
    const [skuCheck] = await pool.execute("SELECT ID FROM Products WHERE SKU = ? AND Business_ID = ?", [
      product.SKU,
      product.Business_ID,
    ])
    if (skuCheck.length > 0) {
      throw new Error("SKU must be unique within the business")
    }

    // 4. Insert product
    const [result] = await pool.execute(
      `INSERT INTO Products
        (Business_ID, Category_ID, Subcategory_ID, Name, Description, Price, Stock_Quantity, Images, Status, SKU, Created_At, Updated_At)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        product.Business_ID,
        product.Category_ID,
        product.Subcategory_ID,
        product.Name,
        product.Description || null,
        product.Price,
        product.Stock_Quantity || 0,
        product.Images || null,
        "pending",
        product.SKU,
      ],
    )

    return { ID: result.insertId, message: "Product created successfully" }
  }

  // Update product by ID
  static async updateProduct(productId, updates) {
    // Prevent updating certain fields
    const forbiddenFields = ["ID", "Business_ID", "Created_At"]
    for (const field of forbiddenFields) {
      if (field in updates) {
        throw new Error(`Cannot update field: ${field}`)
      }
    }

    const allowedFields = ["Name", "Description", "Price", "Stock_Quantity", "Images", "SKU"]
    const updateFields = []
    const updateValues = []

    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = ?`)
        updateValues.push(updates[field])
      }
    }

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update")
    }

    updateFields.push("Updated_At = NOW()")
    updateValues.push(productId)

    const sql = `UPDATE Products SET ${updateFields.join(", ")} WHERE ID = ?`

    const [result] = await pool.execute(sql, updateValues)

    if (result.affectedRows === 0) {
      throw new Error("No product found with the given ID")
    }

    return true
  }

  // Get Product by Status
  static async getProductsByStatus(status, page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit
    const searchQuery = `%${search}%`

    // Get total count
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM Products WHERE Status = ? AND Name LIKE ?",
      [status, searchQuery],
    )
    const total = countResult[0].total

    // Get paginated results
    const [rows] = await pool.execute(
      `SELECT * FROM Products 
       WHERE Status = ? AND Name LIKE ? 
       ORDER BY Created_At DESC 
       LIMIT ? OFFSET ?`,
      [status, searchQuery, limit, offset],
    )

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get All products for business
  static async getProductsByBusiness(businessId, page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit
    const searchQuery = `%${search}%`

    // Get total count
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM Products WHERE Business_ID = ? AND Name LIKE ?",
      [businessId, searchQuery],
    )
    const total = countResult[0].total

    // Get paginated results
    const [rows] = await pool.execute(
      `SELECT * FROM Products 
       WHERE Business_ID = ? AND Name LIKE ? 
       ORDER BY Created_At DESC 
       LIMIT ? OFFSET ?`,
      [businessId, searchQuery, limit, offset],
    )

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Super Admin Method to Approve/reject/Block
  static async updateProductStatus(productId, newStatus) {
    const validStatuses = ["pending", "approved", "rejected", "blocked"]
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Status must be one of: ${validStatuses.join(", ")}`)
    }

    const [result] = await pool.execute(
      `UPDATE Products
       SET Status = ?, Updated_At = NOW()
       WHERE ID = ?`,
      [newStatus, productId],
    )

    if (result.affectedRows === 0) {
      throw new Error("No product found with the given ID")
    }

    return true
  }

  static async deleteProduct(productId) {
    const [result] = await pool.execute("DELETE FROM Products WHERE ID = ?", [productId])

    if (result.affectedRows === 0) {
      throw new Error("No product found with the given ID")
    }

    return true
  }
}

module.exports = ProductsModel