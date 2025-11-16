const pool = require("../db")

// NOTE: many DB creation scripts in this repo create lowercase table names (e.g. `products`, `categories`).
// Use lowercase table and column names here so queries match those tables and avoid case-sensitivity issues
class ProductsModel {
  // Get product by ID
  static async getProductById(productId) {
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [productId])
    return rows[0]
  }

  static async getAllProducts(page = 1, limit = 10, search = "") {
    // Normalize and validate inputs. The SQL error you saw is usually caused by
    // passing non-numeric values to LIMIT/OFFSET or invalid parameter types.
    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1)
    const limitNum = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100)
    const offset = (pageNum - 1) * limitNum

  //   // Ensure search is a string (avoid objects/arrays being passed in)
  //   const searchStr = search == null ? "" : String(search)
  //   // const searchQuery = `%${searchStr}%`
  // const searchQuery = `%${searchStr || ''}%`;
  // // const searchQuery = `%`+searchStr+`%`
    
  //   // Get total count
  //   const [countResult] = await pool.execute(
  //     "SELECT COUNT(*) as total FROM products WHERE name LIKE ?",
  //     [searchQuery],
  //   )
  //   const total = Number(countResult[0].total) || 0

  //   // Get paginated results (pass numeric LIMIT and OFFSET)
  //   const [rows] = await pool.execute(
  //     `SELECT * FROM products WHERE name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  //     [searchQuery, limitNum, offset],
  //   )
  let countQuery = "SELECT COUNT(*) as total FROM products";
let dataQuery = "SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?";
let params = [limitNum, offset];

if (search && search.trim() !== "") {
  countQuery = "SELECT COUNT(*) as total FROM products WHERE name LIKE ?";
  dataQuery = "SELECT * FROM products WHERE name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params = [`%${search}%`, limitNum, offset];
}

const [countResult] = await pool.execute(countQuery, search ? [`%${search}%`,...params] : [params]);
const total = Number(countResult[0].total) || 0;
const [rows] = await pool.execute(dataQuery, [ search ? `%${search}%`:`%%`, params]);

    return {
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }
  }

  // Create new product with category validation
  static async createProduct(product) {
    // Accept either camelCase or snake_case fields from request body
    const business_id = product.Business_ID || product.business_id
    const category_id = product.Category_ID || product.category_id
    const subcategory_id = product.Subcategory_ID || product.subcategory_id
    const name = product.Name || product.name
    const price = product.Price || product.price
    const sku = product.SKU || product.sku

    // Validate required fields
    if (!business_id || !category_id || !subcategory_id || !name || !price || !sku) {
      throw new Error("Missing required fields: Business_ID/business_id, Category_ID/category_id, Subcategory_ID/subcategory_id, Name/name, Price/price, SKU/sku")
    }

    // 1. Validate Category exists
    const [categoryCheck] = await pool.execute("SELECT id FROM categories WHERE id = ?", [category_id])
    if (categoryCheck.length === 0) {
      throw new Error("Category_ID must reference an existing category")
    }

    // 2. Validate SubCategory exists
    const [subCategoryCheck] = await pool.execute("SELECT id FROM categories WHERE id = ?", [subcategory_id])
    if (subCategoryCheck.length === 0) {
      throw new Error("SubCategory_ID must reference an existing category")
    }

    // 3. Check for duplicate SKU within the same business
    const [skuCheck] = await pool.execute("SELECT id FROM products WHERE sku = ? AND business_id = ?", [sku, business_id])
    if (skuCheck.length > 0) {
      throw new Error("SKU must be unique within the business")
    }

    // 4. Insert product
    const [result] = await pool.execute(
      `INSERT INTO products
        (business_id, category_id, subcategory_id, name, description, price, stock_quantity, images, status, sku, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        business_id,
        category_id,
        subcategory_id,
        name,
        product.Description || product.description || null,
        price,
        product.Stock_Quantity || product.stock_quantity || 0,
        product.Images || product.images || null,
        "pending",
        sku,
      ],
    )

    return { id: result.insertId, message: "Product created successfully" }
  }

  // Update product by ID
  static async updateProduct(productId, updates) {
    // Prevent updating certain fields
    const forbiddenFields = ["id", "business_id", "created_at"]
    for (const field of forbiddenFields) {
      if (field in updates || field in (Object.keys(updates).reduce((acc, k) => (acc[k.toLowerCase()] = updates[k], acc), {}))) {
        throw new Error(`Cannot update field: ${field}`)
      }
    }

    const allowedFields = ["name", "description", "price", "stock_quantity", "images", "sku"]
    const updateFields = []
    const updateValues = []

    for (const field of allowedFields) {
      if (field in updates || (field.toUpperCase() in updates)) {
        // support both cases
        const val = updates[field] !== undefined ? updates[field] : updates[field.toUpperCase()]
        updateFields.push(`${field} = ?`)
        updateValues.push(val)
      }
    }

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update")
    }

    updateFields.push("updated_at = NOW()")
    updateValues.push(productId)

    const sql = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`

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
      "SELECT COUNT(*) as total FROM products WHERE status = ? AND name LIKE ?",
      [status, searchQuery],
    )
    const total = countResult[0].total

    // Get paginated results
    const [rows] = await pool.execute(
      `SELECT * FROM products 
       WHERE status = ? AND name LIKE ? 
       ORDER BY created_at DESC 
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
      "SELECT COUNT(*) as total FROM products WHERE business_id = ? AND name LIKE ?",
      [businessId, searchQuery],
    )
    const total = countResult[0].total
        
    // Get paginated results
    const [rows] = await pool.execute(
      `SELECT * FROM products 
      WHERE business_id = ? AND name LIKE ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [businessId, searchQuery, Number(limit), Number(offset)]
    );

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
      `UPDATE products
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      [newStatus, productId],
    )

    if (result.affectedRows === 0) {
      throw new Error("No product found with the given ID")
    }

    return true
  }

  static async deleteProduct(productId) {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [productId])

    if (result.affectedRows === 0) {
      throw new Error("No product found with the given ID")
    }

    return true
  }
}

module.exports = ProductsModel