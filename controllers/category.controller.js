const CategoryModel = require('../models/categoryModel');

// ✅ Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.q || '';

    const result = await CategoryModel.getCategories(page, limit, search);
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Create category or subcategory
exports.createCategory = async (req, res) => {
  try {
    const { name, image, icon, parentId, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }

    const categoryId = await CategoryModel.createCategory({ name, image, icon, parentId, status });

    res.status(201).json({
      success: true,
      message: parentId ? 'Subcategory created successfully.' : 'Category created successfully.',
      categoryId,
    });
  } catch (err) {
    const codes = {
      INVALID_NAME: 400,
      CIRCULAR_PARENT: 400,
      PARENT_NOT_FOUND: 404,
      DUPLICATE_NAME: 409,
    };
    res.status(codes[err.code] || 500).json({ success: false, error: err.message });
  }
};

// ✅ Get subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const parentId = Number.parseInt(req.params.parentId);
    if (isNaN(parentId)) {
      return res.status(400).json({ success: false, error: 'Invalid parent ID.' });
    }

    const subcategories = await CategoryModel.getSubcategories(parentId);
    res.json({ success: true, data: subcategories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get category path (breadcrumbs)
exports.getCategoryPath = async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID.' });
    }

    const path = await CategoryModel.getCategoryPath(categoryId);
    res.json({ success: true, data: path });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get all descendants
exports.getAllDescendants = async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID.' });
    }

    const descendants = await CategoryModel.getAllDescendants(categoryId);
    res.json({ success: true, data: descendants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID.' });
    }

    const category = await CategoryModel.getById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Update category
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID.' });
    }

    const { name, image, icon, status } = req.body;
    if (!name && image === undefined && icon === undefined && !status) {
      return res.status(400).json({ success: false, error: 'At least one field must be provided to update.' });
    }

    await CategoryModel.updateCategory(categoryId, { name, image, icon, status });
    res.status(200).json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    const codes = { NOT_FOUND: 404 };
    res.status(codes[err.code] || 500).json({ success: false, error: err.message });
  }
};

// ✅ Delete category safely
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = Number.parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID.' });
    }

    await CategoryModel.deleteCategory(categoryId);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    const codes = {
      HAS_SUBCATEGORIES: 409,
      HAS_PRODUCTS: 409,
      NOT_FOUND: 404,
    };
    res.status(codes[err.code] || 500).json({ success: false, error: err.message });
  }
};