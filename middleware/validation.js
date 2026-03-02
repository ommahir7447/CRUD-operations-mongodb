const mongoose = require('mongoose');

function validateProduct(req, res, next) {
    const { name, price, category, stock, description } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }

    if (price === undefined || price === null) {
        errors.push('Price is required');
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        errors.push('Price must be a non-negative number');
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Category is required and must be a non-empty string');
    }

    if (stock === undefined || stock === null) {
        errors.push('Stock is required');
    } else if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
        errors.push('Stock must be a non-negative integer');
    }

    if (description && typeof description !== 'string') {
        errors.push('Description must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
}

function validateUser(req, res, next) {
    const { email, name, password, address } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email must be valid');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password is required and must be at least 6 characters');
    }

    if (address && typeof address !== 'string') {
        errors.push('Address must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
}

function validateCartItem(req, res, next) {
    const { productId, quantity } = req.body;
    const errors = [];

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        errors.push('Valid productId is required');
    }

    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
        errors.push('Quantity must be at least 1');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
}

function validateOrder(req, res, next) {
    const { userId, shippingAddress, paymentMethod } = req.body;
    const errors = [];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        errors.push('Valid userId is required');
    }

    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length === 0) {
        errors.push('Shipping address is required');
    }

    if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim().length === 0) {
        errors.push('Payment method is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
}

module.exports = {
    validateProduct,
    validateUser,
    validateCartItem,
    validateOrder
};
