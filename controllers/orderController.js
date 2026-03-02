const mongoose = require('mongoose');
const Order = require('../models/order');
const User = require('../models/user');
const Cart = require('../models/cart');
const Product = require('../models/product');

// GET /orders - Get all orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const { userId, status } = req.query;
        let query = {};
        if (userId && mongoose.Types.ObjectId.isValid(userId)) query.userId = userId;
        if (status) query.status = status.toLowerCase();

        const orders = await Order.find(query).populate('userId', 'name email');
        res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        next(error);
    }
};

// GET /orders/:id - Get single order
exports.getOrderById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format' });
        }
        const order = await Order.findById(req.params.id).populate('userId', 'name email');
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// POST /orders - Create order
exports.createOrder = async (req, res, next) => {
    try {
        const { userId, shippingAddress, paymentMethod, cardDetails } = req.body;

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, error: 'Cart is empty' });

        const orderItems = [];
        let total = 0;

        for (const item of cart.items) {
            if (!item.productId) continue;
            const itemTotal = item.productId.price * item.quantity;
            orderItems.push({
                productId: item.productId._id,
                productName: item.productId.name,
                quantity: item.quantity,
                price: item.productId.price,
                subtotal: itemTotal
            });
            total += itemTotal;
            await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
        }

        const newOrder = new Order({
            userId,
            items: orderItems,
            total,
            shippingAddress,
            paymentMethod,
            cardDetails,
            status: 'pending'
        });

        await newOrder.save();
        cart.items = [];
        await cart.save();

        res.status(201).json({ success: true, message: 'Order created', data: newOrder });
    } catch (error) {
        next(error);
    }
};

// PATCH /orders/:id - Update status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status: status.toLowerCase() }, { new: true });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, message: 'Status updated', data: order });
    } catch (error) {
        next(error);
    }
};
