const ProductsModel = require('../models/ProductsModel');

// ------------------- GET all products (role-based) -------------------
exports.getAllProducts = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.q || '';

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    let result;

    if (user.role === 'super_admin') {
      result = await ProductsModel.getAllProducts(page, limit, search);
    } else if (['business_admin', 'business_user', 'admin'].includes(user.role)) {
      if (!user.businessId) {
        return res.status(400).json({ error: 'Business ID not found for user' });
      }
      result = await ProductsModel.getProductsByBusiness(user.businessId, page, limit, search);
    } else {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ------------------- GET product by ID -------------------
exports.getProductById = async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  try {
    const user = req.user;
    const product = await ProductsModel.getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (user.role !== 'super_admin' && product.Business_ID !== user.businessId) {
      return res.status(403).json({ error: 'Unauthorized access to this product' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ------------------- GET products by status -------------------
exports.getProductsByStatus = async (req, res) => {
  const user = req.user;
  if (user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can view products by status' });
  }

  const status = req.params.status;
  const validStatuses = ['pending', 'approved', 'rejected', 'blocked'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.q || '';

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  try {
    const result = await ProductsModel.getProductsByStatus(status, page, limit, search);
    res.json(result);
  } catch (err) {
    console.error('Error fetching products by status:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ------------------- GET products by business -------------------
exports.getProductsByBusiness = async (req, res) => {
  const user = req.user;
  const businessId = Number(req.params.businessId);
  if (isNaN(businessId)) return res.status(400).json({ error: 'Invalid Business ID' });

  if (user.role !== 'super_admin' && businessId !== user.businessId) {
    return res.status(403).json({ error: 'Unauthorized access to this business' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.q || '';

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  try {
    const result = await ProductsModel.getProductsByBusiness(businessId, page, limit, search);
    res.json(result);
  } catch (err) {
    console.error('Error fetching products by business:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ------------------- CREATE product -------------------
exports.createProduct = async (req, res) => {
  const user = req.user;
  try {
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Super admin cannot create products' });
    }

    if (req.body.Business_ID !== user.businessId) {
      return res.status(403).json({ error: 'Cannot create products for other businesses' });
    }

    const product = await ProductsModel.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: err.message });
  }
};

// ------------------- UPDATE product -------------------
exports.updateProduct = async (req, res) => {
  const user = req.user;
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  try {
    const product = await ProductsModel.getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (user.role !== 'super_admin' && product.Business_ID !== user.businessId) {
      return res.status(403).json({ error: 'Unauthorized to update this product' });
    }

    if (req.body.Business_ID && req.body.Business_ID !== product.Business_ID) {
      return res.status(400).json({ error: 'Cannot change product business' });
    }

    await ProductsModel.updateProduct(productId, req.body);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: err.message });
  }
};

// ------------------- ADMIN: UPDATE product status -------------------
exports.updateProductStatus = async (req, res) => {
  const user = req.user;
  if (user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can update product status' });
  }

  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  const newStatus = req.body.status;
  const validStatuses = ['pending', 'approved', 'rejected', 'blocked'];
  if (!validStatuses.includes(newStatus)) return res.status(400).json({ error: 'Invalid status' });

  try {
    await ProductsModel.updateProductStatus(productId, newStatus);
    res.json({ message: `Product status updated to ${newStatus}` });
  } catch (err) {
    console.error('Error updating product status:', err);
    res.status(400).json({ error: err.message });
  }
};

// ------------------- DELETE product -------------------
exports.deleteProduct = async (req, res) => {
  const user = req.user;
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  try {
    const product = await ProductsModel.getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (user.role !== 'super_admin' && product.Business_ID !== user.businessId) {
      return res.status(403).json({ error: 'Unauthorized to delete this product' });
    }

    await ProductsModel.deleteProduct(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(400).json({ error: err.message });
  }
};