const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const ProductsModel = require("../models/ProductsModel")

const router = express.Router()

// ------------------- GET all products (role-based) -------------------
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const user = req.user // should be set by authenticateToken
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const search = req.query.q || ""

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Invalid pagination parameters" })
    }

    let result

    if (user.role === "super_admin") {
      // Super admin: all products from all businesses
      result = await ProductsModel.getAllProducts(page, limit, search)
    } else if (user.role === "business_admin" || user.role === "business_user") {
      // Business user: only products for their business
      if (!user.businessId) {
        return res.status(400).json({ error: "Business ID not found for user" })
      }
      result = await ProductsModel.getProductsByBusiness(user.businessId, page, limit, search)
    } else {
      return res.status(403).json({ error: "Unauthorized access" })
    }

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
})

// ------------------- GET product by ID -------------------
router.get("/:id", authenticateToken, async (req, res) => {
  const productId = Number(req.params.id)
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid Product ID" })

  try {
    const user = req.user // should be set by authenticateToken
    const product = await ProductsModel.getProductById(productId)
    if (!product) return res.status(404).json({ error: "Product not found" })

    if (user.role !== "super_admin" && product.Business_ID !== user.businessId) {
      return res.status(403).json({ error: "Unauthorized access to this product" })
    }

    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
})

// ------------------- GET products by status -------------------
router.get("/status/:status", authenticateToken, async (req, res) => {
  const user = req.user // should be set by authenticateToken
  if (user.role !== "super_admin") {
    return res.status(403).json({ error: "Only super admin can view products by status" })
  }

  const status = req.params.status
  const validStatuses = ["pending", "approved", "rejected", "blocked"]
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" })

  // Pagination & Search
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ error: "Invalid pagination parameters" })
  }

  const search = req.query.q || ""

  try {
    const result = await ProductsModel.getProductsByStatus(status, page, limit, search)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
})

// ------------------- GET products by business -------------------
router.get("/business/:businessId", authenticateToken, async (req, res) => {
  const user = req.user // should be set by authenticateToken
  const businessId = Number(req.params.businessId)
  if (isNaN(businessId)) return res.status(400).json({ error: "Invalid Business ID" })

  if (user.role !== "super_admin" && businessId !== user.businessId) {
    return res.status(403).json({ error: "Unauthorized access to this business" })
  }

  // Pagination & Search
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ error: "Invalid pagination parameters" })
  }

  const search = req.query.q || ""

  try {
    const result = await ProductsModel.getProductsByBusiness(businessId, page, limit, search)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
})

// ------------------- CREATE product -------------------
router.post("/", authenticateToken, async (req, res) => {
  const user = req.user // should be set by authenticateToken
  try {
    if (user.role === "super_admin") {
      return res.status(403).json({ error: "Super admin cannot create products" })
    }

    if (req.body.Business_ID !== user.businessId) {
      return res.status(403).json({ error: "Cannot create products for other businesses" })
    }

    const product = await ProductsModel.createProduct(req.body)
    res.status(201).json(product)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// ------------------- UPDATE product -------------------
router.put("/:id", authenticateToken, async (req, res) => {
  const user = req.user // should be set by authenticateToken
  const productId = Number(req.params.id)
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid Product ID" })

  try {
    const product = await ProductsModel.getProductById(productId)
    if (!product) return res.status(404).json({ error: "Product not found" })

    if (user.role !== "super_admin" && product.Business_ID !== user.businessId) {
      return res.status(403).json({ error: "Unauthorized to update this product" })
    }

    if (req.body.Business_ID && req.body.Business_ID !== product.Business_ID) {
      return res.status(400).json({ error: "Cannot change product business" })
    }

    await ProductsModel.updateProduct(productId, req.body)
    res.json({ message: "Product updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// ------------------- ADMIN: UPDATE product status -------------------
router.patch("/:id/status", authenticateToken, async (req, res) => {
  const user = req.user // should be set by authenticateToken
  if (user.role !== "super_admin") {
    return res.status(403).json({ error: "Only super admin can update product status" })
  }

  const productId = Number(req.params.id)
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid Product ID" })

  const newStatus = req.body.status
  const validStatuses = ["pending", "approved", "rejected", "blocked"]
  if (!validStatuses.includes(newStatus)) return res.status(400).json({ error: "Invalid status" })

  try {
    await ProductsModel.updateProductStatus(productId, newStatus)
    res.json({ message: `Product status updated to ${newStatus}` })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// ------------------- DELETE product -------------------
router.delete("/:id", authenticateToken, async (req, res) => {
  const user = req.user // should be set by authenticateToken
  const productId = Number(req.params.id)
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid Product ID" })

  try {
    const product = await ProductsModel.getProductById(productId)
    if (!product) return res.status(404).json({ error: "Product not found" })

    if (user.role !== "super_admin" && product.Business_ID !== user.businessId) {
      return res.status(403).json({ error: "Unauthorized to delete this product" })
    }

    await ProductsModel.deleteProduct(productId)
    res.json({ message: "Product deleted successfully" })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
