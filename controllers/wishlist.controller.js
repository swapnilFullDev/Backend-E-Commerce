const Wishlist = require('../models/wishlist.model');

exports.addWishlist = async (req, res) => {
  try {
    const { userId, productId, productName, productImage, price, description } = req.body;

    if (!userId || !productId || !productName) {
      return res.status(400).json({ message: 'userId, productId and productName are required' });
    }

    const id = await Wishlist.create({ userId, productId, productName, productImage, price, description });
    res.status(201).json({ message: 'Item added to wishlist successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWishlistByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await Wishlist.getAllByUser(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWishlistById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Wishlist.getById(id);
    if (!data) return res.status(404).json({ message: 'Wishlist item not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const affected = await Wishlist.update(id, req.body);
    if (!affected) return res.status(404).json({ message: 'Wishlist item not found' });
    res.json({ message: 'Wishlist item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const affected = await Wishlist.delete(id);
    if (!affected) return res.status(404).json({ message: 'Wishlist item not found' });
    res.json({ message: 'Wishlist item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.moveToBuyItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Wishlist.moveToBuyItem(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
