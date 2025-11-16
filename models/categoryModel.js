const pool = require("../db");

class CategoryModel {
  // Get all top-level categories (parent_id IS NULL) with pagination and search
  static async getCategories(page = 1, limit = 10, search = "") {
    try {
      const validLimit = Math.min(Math.max(Number.parseInt(limit) || 10, 1), 100);
      const validPage = Math.max(Number.parseInt(page) || 1, 1);
      const offset = (validPage - 1) * validLimit;
      const searchParam = search.length === 2 ? "%%" : `%${search}%`;

      // Get total count for pagination
      const [countResult] = await pool.execute(
        "SELECT COUNT(*) AS total FROM categories WHERE parent_id IS NULL AND name LIKE ?",
        [searchParam]
      );

      // Get paginated results (ensure numeric LIMIT and OFFSET)
      const dataQuery = `SELECT * FROM categories WHERE parent_id IS NULL AND name LIKE ? ORDER BY name ASC LIMIT ${validLimit} OFFSET ${offset}`;
      
      const [rows] = await pool.execute(dataQuery, [searchParam]);
      return {
        data: rows,
        total: countResult[0].total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(countResult[0].total / validLimit),
      };
    } catch (error) {
      throw new Error("Failed to get categories: " + error.message);
    }
  }

  // Get subcategories by parent ID (supports multi-level hierarchy)
  static async getSubcategories(parentId) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC",
        [parentId]
      );
      return rows;
    } catch (error) {
      throw new Error("Failed to get subcategories: " + error.message);
    }
  }

  // Get all descendants of a category recursively (up to maxDepth)
  static async getAllDescendants(categoryId, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return [];

    try {
      const [children] = await pool.execute(
        "SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC",
        [categoryId]
      );

      let allDescendants = [...children];
      for (const child of children) {
        const descendants = await this.getAllDescendants(child.id, depth + 1, maxDepth);
        allDescendants = allDescendants.concat(descendants);
      }
      return allDescendants;
    } catch (error) {
      throw new Error("Failed to get all descendants: " + error.message);
    }
  }

  // Get full category hierarchy path (for breadcrumbs)
  static async getCategoryPath(categoryId) {
    try {
      const path = [];
      let currentId = categoryId;

      while (currentId) {
        const [rows] = await pool.execute(
          "SELECT id, name, parent_id FROM categories WHERE id = ?",
          [currentId]
        );
        if (rows.length === 0) break;
        path.unshift(rows[0]);
        currentId = rows[0].parent_id;
      }
      return path;
    } catch (error) {
      throw new Error("Failed to get category path: " + error.message);
    }
  }

  // Create category with validation
  static async createCategory({ name, image = null, icon = null, parentId = null, status = "active" }) {
    try {
      if (!name || typeof name !== "string" || !name.trim()) {
        throw new Error("Category name is required and must be a non-empty string.");
      }

      // Optionally check if parentId exists (if provided)
      if (parentId !== null) {
        const [parentRows] = await pool.execute(
          "SELECT id FROM categories WHERE id = ?",
          [parentId]
        );
        if (parentRows.length === 0) {
          throw new Error("Parent category not found.");
        }
      }

      const [result] = await pool.execute(
        `INSERT INTO categories (name, image, icon, parent_id, status)
         VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), image, icon, parentId, status]
      );

      return result.insertId;
    } catch (error) {
      throw new Error("Failed to create category: " + error.message);
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM categories WHERE id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Failed to get category by ID: " + error.message);
    }
  }

  // Update category by ID with validation
  static async updateCategory(id, { name, image, icon, status }) {
    try {
      if (!id) {
        throw new Error("Category ID is required.");
      }

      const fields = [];
      const values = [];

      if (name !== undefined) {
        if (!name || typeof name !== "string" || !name.trim()) {
          throw new Error("Category name must be a non-empty string.");
        }
        fields.push("name = ?");
        values.push(name.trim());
      }
      if (image !== undefined) {
        fields.push("image = ?");
        values.push(image);
      }
      if (icon !== undefined) {
        fields.push("icon = ?");
        values.push(icon);
      }
      if (status !== undefined) {
        fields.push("status = ?");
        values.push(status);
      }

      if (fields.length === 0) {
        throw new Error("No valid fields provided to update.");
      }

      values.push(id);

      const sql = `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`;
      const [result] = await pool.execute(sql, values);

      if (result.affectedRows === 0) {
        throw new Error("Category not found.");
      }

      return true;
    } catch (error) {
      throw new Error("Failed to update category: " + error.message);
    }
  }

  // Check if category has subcategories
  static async hasSubcategories(categoryId) {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM categories WHERE parent_id = ?",
        [categoryId]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error("Failed to check subcategories: " + error.message);
    }
  }

  // Check if category has linked products
  static async hasProducts(categoryId) {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM products WHERE category_id = ?",
        [categoryId]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error("Failed to check linked products: " + error.message);
    }
  }

  // Delete category safely (only if no subcategories or linked products)
  static async deleteCategory(categoryId) {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required.");
      }

      const hasSub = await this.hasSubcategories(categoryId);
      if (hasSub) {
        const error = new Error("Cannot delete category with existing subcategories.");
        error.code = "HAS_SUBCATEGORIES";
        throw error;
      }

      const hasProd = await this.hasProducts(categoryId);
      if (hasProd) {
        const error = new Error("Cannot delete category linked to products.");
        error.code = "HAS_PRODUCTS";
        throw error;
      }

      const [result] = await pool.execute(
        "DELETE FROM categories WHERE id = ?",
        [categoryId]
      );

      if (result.affectedRows === 0) {
        throw new Error("Category not found.");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CategoryModel;