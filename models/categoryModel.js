const pool = require("../db")

class CategoryModel {
  // Get all top-level categories (Parent_ID IS NULL) with pagination
  static async getCategories(page = 1, limit = 10, search = "") {
    const validLimit = Math.min(Math.max(Number.parseInt(limit) || 10, 1), 100)
    const validPage = Math.max(Number.parseInt(page) || 1, 1)
    const offset = (validPage - 1) * validLimit
    const searchParam = search.length == 2 ? "%%" : `%${search}%`;

    // Get total count
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) AS total FROM Categories WHERE Parent_ID IS NULL AND Name LIKE ?",
      [searchParam],
    )

    // Get paginated results
        const dataQuery = `
            SELECT * FROM Categories 
            WHERE Parent_ID IS NULL AND Name LIKE ? 
            ORDER BY Name ASC 
            LIMIT ${validLimit} OFFSET ${offset}
        `;
        
        const [rows] = await pool.execute(dataQuery, [searchParam]);
        console.log(rows,searchParam,search,typeof search,search.length);
        

    return {
      data: rows,
      total: countResult[0].total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(countResult[0].total / validLimit),
    }
  }

  // Get subcategories by parent ID (supports multi-level hierarchy)
  static async getSubcategories(parentId) {
    const [rows] = await pool.execute("SELECT * FROM Categories WHERE Parent_ID = ? ORDER BY Name ASC", [parentId])
    return rows
  }

  // Get all descendants of a category (for sub-sub-categories, etc.)
  static async getAllDescendants(categoryId, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return []

    const [children] = await pool.execute("SELECT * FROM Categories WHERE Parent_ID = ? ORDER BY Name ASC", [
      categoryId,
    ])

    let allDescendants = [...children]
    for (const child of children) {
      const descendants = await this.getAllDescendants(child.ID, depth + 1, maxDepth)
      allDescendants = allDescendants.concat(descendants)
    }

    return allDescendants
  }

  // Get full category hierarchy path (for breadcrumbs)
  static async getCategoryPath(categoryId) {
    const path = []
    let currentId = categoryId

    while (currentId) {
      const [rows] = await pool.execute("SELECT ID, Name, Parent_ID FROM Categories WHERE ID = ?", [currentId])

      if (rows.length === 0) break
      path.unshift(rows[0])
      currentId = rows[0].Parent_ID
    }

    return path
  }

  // Create category with validation
  static async createCategory({ name, image = null, icon = null, parentId = null, status = "active" }) {
    if (!name || name.trim().length === 0) {
      const error = new Error("Category name is required and cannot be empty.")
      error.code = "INVALID_NAME"
      throw error
    }

    // Prevent circular parent relationships
    if (parentId) {
      const isCircular = await this.wouldCreateCircle(parentId, parentId)
      if (isCircular) {
        const error = new Error("Cannot create circular parent relationship.")
        error.code = "CIRCULAR_PARENT"
        throw error
      }

      // Verify parent exists
      const parent = await this.getById(parentId)
      if (!parent) {
        const error = new Error("Parent category does not exist.")
        error.code = "PARENT_NOT_FOUND"
        throw error
      }
    }

    // Check for duplicate name at same level
    const [existing] = await pool.execute(
      "SELECT ID FROM Categories WHERE Name = ? AND Parent_ID <=> ? AND Status = ?",
      [name, parentId, status],
    )

    if (existing.length > 0) {
      const error = new Error("Category with this name already exists at this level.")
      error.code = "DUPLICATE_NAME"
      throw error
    }

    const [result] = await pool.execute(
      `INSERT INTO Categories (Name, Image, Icon, Parent_ID, Status, Created_At, Updated_At)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name.trim(), image, icon, parentId, status],
    )

    return result.insertId
  }

  // Get category by ID
  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM Categories WHERE ID = ?", [id])
    return rows[0] || null
  }

  // Update category with validation
  static async updateCategory(id, { name, image, icon, status }) {
    const fields = []
    const values = []

    if (name !== undefined && name !== null) {
      if (name.trim().length === 0) {
        throw new Error("Category name cannot be empty.")
      }
      fields.push("Name = ?")
      values.push(name.trim())
    }

    if (image !== undefined) {
      fields.push("Image = ?")
      values.push(image)
    }

    if (icon !== undefined) {
      fields.push("Icon = ?")
      values.push(icon)
    }

    if (status !== undefined) {
      fields.push("Status = ?")
      values.push(status)
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update.")
    }

    fields.push("Updated_At = NOW()")
    values.push(id)

    const sql = `UPDATE Categories SET ${fields.join(", ")} WHERE ID = ?`
    const [result] = await pool.execute(sql, values)

    if (result.affectedRows === 0) {
      const error = new Error("Category not found.")
      error.code = "NOT_FOUND"
      throw error
    }
  }

  static async wouldCreateCircle(categoryId, potentialParentId) {
    if (categoryId === potentialParentId) return true

    const [rows] = await pool.execute("SELECT Parent_ID FROM Categories WHERE ID = ?", [potentialParentId])

    if (rows.length === 0 || !rows[0].Parent_ID) return false

    return this.wouldCreateCircle(categoryId, rows[0].Parent_ID)
  }

  // Check if category has subcategories
  static async hasSubcategories(categoryId) {
    const [rows] = await pool.execute("SELECT COUNT(*) AS count FROM Categories WHERE Parent_ID = ?", [categoryId])
    return rows[0].count > 0
  }

  // Check if category has linked products
  static async hasProducts(categoryId) {
    const [rows] = await pool.execute("SELECT COUNT(*) AS count FROM Products WHERE Category_ID = ?", [categoryId])
    return rows[0].count > 0
  }

  // Delete category safely
  static async deleteCategory(categoryId) {
    const hasSub = await this.hasSubcategories(categoryId)
    if (hasSub) {
      const error = new Error("Cannot delete category with existing subcategories.")
      error.code = "HAS_SUBCATEGORIES"
      throw error
    }

    const hasProd = await this.hasProducts(categoryId)
    if (hasProd) {
      const error = new Error("Cannot delete category linked to products.")
      error.code = "HAS_PRODUCTS"
      throw error
    }

    const [result] = await pool.execute("DELETE FROM Categories WHERE ID = ?", [categoryId])

    if (result.affectedRows === 0) {
      const error = new Error("Category not found.")
      error.code = "NOT_FOUND"
      throw error
    }

    return true
  }
}

module.exports = CategoryModel
