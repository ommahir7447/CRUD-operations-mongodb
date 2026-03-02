const mongoose = require('mongoose');
const User = require('../models/user');
const Cart = require('../models/cart');

// GET /users - Get all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// GET /users/:id - Get single user
exports.getUserById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// POST /users - Create new user
exports.createUser = async (req, res, next) => {
    try {
        const { email, name, password, address, cardDetails } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }

        const newUser = new User({
            email: email.toLowerCase(),
            name,
            password: `hashed_${password}`,
            address,
            cardDetails
        });

        await newUser.save();

        const { password: _, ...safeUser } = newUser.toObject();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: safeUser
        });
    } catch (error) {
        next(error);
    }
};

// PUT /users/:id - Update user
exports.updateUser = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        const { email, name, password, address, cardDetails } = req.body;

        const emailConflict = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.params.id }
        });

        if (emailConflict) {
            return res.status(409).json({ success: false, error: 'Email already in use' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                email: email.toLowerCase(),
                name,
                password: `hashed_${password}`,
                address,
                cardDetails
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /users/:id - Delete user
exports.deleteUser = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await Cart.findOneAndDelete({ userId: req.params.id });

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};
