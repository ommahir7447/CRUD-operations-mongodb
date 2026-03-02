const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product');

// GET /cart/:userId - Get user's cart
exports.getCart = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        let cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');

        if (!cart) {
            cart = new Cart({ userId: req.params.userId, items: [] });
            await cart.save();
        }

        const cartItems = cart.items.map(item => ({
            productId: item.productId ? item.productId._id : null,
            quantity: item.quantity,
            product: item.productId,
            subtotal: item.productId ? item.productId.price * item.quantity : 0
        }));

        const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({
            success: true,
            data: {
                userId: req.params.userId,
                items: cartItems,
                total
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /cart/:userId - Add item to cart
exports.addToCart = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ success: false, error: `Insufficient stock` });
        }

        let cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            cart = new Cart({ userId: req.params.userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(201).json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error) {
        next(error);
    }
};

// PUT /cart/:userId/:productId - Update quantity
exports.updateCartItem = async (req, res, next) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ success: false, error: 'Product not in cart' });

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.json({ success: true, message: 'Cart updated', data: cart });
    } catch (error) {
        next(error);
    }
};

// DELETE /cart/:userId/:productId - Remove item
exports.removeFromCart = async (req, res, next) => {
    try {
        const { userId, productId } = req.params;
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, error: 'Cart is empty' });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.json({ success: true, message: 'Item removed from cart', data: cart });
    } catch (error) {
        next(error);
    }
};

// DELETE /cart/:userId - Clear cart
exports.clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndDelete({ userId: req.params.userId });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};
