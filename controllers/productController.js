const mongoose = require('mongoose');
const Product = require('../models/product');

// GET /products - Get all products with optional filtering
exports.getAllProducts = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        let query = {};

        if (category) {
            query.category = { $regex: new RegExp(category, 'i') };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                const min = parseFloat(minPrice);
                if (isNaN(min)) return res.status(400).json({ error: 'Invalid minPrice parameter' });
                query.price.$gte = min;
            }
            if (maxPrice) {
                const max = parseFloat(maxPrice);
                if (isNaN(max)) return res.status(400).json({ error: 'Invalid maxPrice parameter' });
                query.price.$lte = max;
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { description: { $regex: new RegExp(search, 'i') } }
            ];
        }

        const products = await Product.find(query);

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// GET /products/:id - Get single product
exports.getProductById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID format' });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// POST /products - Create new product
exports.createProduct = async (req, res, next) => {
    try {
        const { name, price, category, stock, description } = req.body;

        const newProduct = new Product({
            name,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            description
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        next(error);
    }
};

// PUT /products/:id - Update product
exports.updateProduct = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID format' });
        }

        const { name, price, category, stock, description } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price: parseFloat(price),
                category,
                stock: parseInt(stock),
                description
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /products/:id - Delete product
exports.deleteProduct = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID format' });
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};
