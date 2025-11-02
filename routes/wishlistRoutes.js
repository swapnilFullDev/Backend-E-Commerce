const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');

router.post('/', wishlistController.addWishlist);
router.get('/user/:userId', wishlistController.getWishlistByUser);
router.get('/:id', wishlistController.getWishlistById);
router.put('/:id', wishlistController.updateWishlist);
router.delete('/:id', wishlistController.deleteWishlist);
router.post('/move-to-buy/:id', wishlistController.moveToBuyItem);

module.exports = router;
