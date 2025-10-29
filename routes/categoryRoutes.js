const express = require("express")
const router = express.Router()
const { authenticateToken } = require("../middleware/auth")
const CategoryModel = require("../models/categoryModel")

// GET all top-level categories with pagination & search
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = req.query.page || 1
    const limit = req.query.limit || 10
    const search = req.query.q || ''
    console.log(search,req.query.q);
    

    const result = await CategoryModel.getCategories(page, limit, search)
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST create category or subcategory
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, image, icon, parentId, status } = req.body

    if (!name) {
      return res.status(400).json({ success: false, error: "Category name is required." })
    }

    const categoryId = await CategoryModel.createCategory({ name, image, icon, parentId, status })

    res.status(201).json({
      success: true,
      message: parentId ? "Subcategory created successfully." : "Category created successfully.",
      categoryId,
    })
  } catch (err) {
    if (err.code === "INVALID_NAME") {
      return res.status(400).json({ success: false, error: err.message })
    }
    if (err.code === "CIRCULAR_PARENT") {
      return res.status(400).json({ success: false, error: err.message })
    }
    if (err.code === "PARENT_NOT_FOUND") {
      return res.status(404).json({ success: false, error: err.message })
    }
    if (err.code === "DUPLICATE_NAME") {
      return res.status(409).json({ success: false, error: err.message })
    }
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET subcategories by parent ID
router.get("/:parentId/subcategories", authenticateToken, async (req, res) => {
  try {
    const parentId = Number.parseInt(req.params.parentId)
    if (isNaN(parentId)) {
      return res.status(400).json({ success: false, error: "Invalid parent ID." })
    }

    const subcategories = await CategoryModel.getSubcategories(parentId)
    res.json({ success: true, data: subcategories })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET full category hierarchy path (for breadcrumbs)
router.get("/:id/path", authenticateToken, async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id)
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: "Invalid category ID." })
    }

    const path = await CategoryModel.getCategoryPath(categoryId)
    res.json({ success: true, data: path })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET all descendants (sub-sub-categories, etc.)
router.get("/:id/descendants", authenticateToken, async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id)
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: "Invalid category ID." })
    }

    const descendants = await CategoryModel.getAllDescendants(categoryId)
    res.json({ success: true, data: descendants })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET single category by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id)
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: "Invalid category ID." })
    }

    const category = await CategoryModel.getById(categoryId)
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found." })
    }

    res.json({ success: true, data: category })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT update category
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id)
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: "Invalid category ID." })
    }

    const { name, image, icon, status } = req.body
    if (!name && image === undefined && icon === undefined && !status) {
      return res.status(400).json({ success: false, error: "At least one field must be provided to update." })
    }

    await CategoryModel.updateCategory(categoryId, { name, image, icon, status })
    res.status(200).json({ success: true, message: "Category updated successfully." })
  } catch (err) {
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: err.message })
    }
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE category safely
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id)
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: "Invalid category ID." })
    }

    await CategoryModel.deleteCategory(categoryId)
    res.status(200).json({ success: true, message: "Category deleted successfully." })
  } catch (err) {
    if (err.code === "HAS_SUBCATEGORIES") {
      return res.status(409).json({ success: false, error: err.message })
    }
    if (err.code === "HAS_PRODUCTS") {
      return res.status(409).json({ success: false, error: err.message })
    }
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: err.message })
    }
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
