const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateCartItem } = require('../middleware/validation');

router.get('/:userId', cartController.getCart);
router.post('/:userId', validateCartItem, cartController.addToCart);
router.put('/:userId/:productId', cartController.updateCartItem);
router.delete('/:userId/:productId', cartController.removeFromCart);
router.delete('/:userId', cartController.clearCart);

module.exports = router;
