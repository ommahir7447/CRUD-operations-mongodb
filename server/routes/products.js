const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// ─── Upload Configuration (Cloudinary or Local Multer) ────────────────────────
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (useCloudinary) {
  // Cloudinary upload
  const { uploadToCloudinary } = require('../config/cloudinary');
  upload = uploadToCloudinary;
  console.log('☁️  Using Cloudinary for image uploads');
} else {
  // Local disk storage fallback
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `product-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed!'));
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  });

  console.log('📁 Using local Multer disk storage for image uploads');
}

// ─── Seed data (used if DB is empty) ──────────────────────────────────────────
const seedProducts = [
  { title: 'Premium Wireless Headphones', price: 299.99, category: 'electronics', brand: 'AudioSync', rating: 4.8, inStock: true, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', description: 'Experience studio-quality sound with adaptive active noise cancellation.', features: ['Active Noise Cancellation', '30-hour battery life', 'Multi-device pairing'] },
  { title: 'Mechanical Keyboard Ultra', price: 149.50, category: 'electronics', brand: 'ClickTech', rating: 4.9, inStock: true, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', description: 'Fully hot-swappable mechanical keyboard with aerospace-grade aluminum frame.', features: ['Hot-swappable switches', 'PBT Keycaps', 'Customizable RGB'] },
  { title: 'Smart Watch Series X', price: 399.00, category: 'electronics', brand: 'NovaWear', rating: 4.7, inStock: false, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', description: 'Your ultimate health companion with ECG monitoring and LTPO display.', features: ['Always-On Retina Display', 'Blood Oxygen monitoring', 'Water resistant'] },
  { title: 'Designer Sunglasses', price: 120.00, category: 'accessories', brand: 'Aura Optics', rating: 4.5, inStock: true, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', description: 'Timeless style with polarized lenses and durable acetate frame.', features: ['100% UV400 Protection', 'Polarized lenses', 'Sustainable frame'] },
  { title: 'Leather Weekend Bag', price: 245.00, category: 'accessories', brand: 'Heritage Goods', rating: 4.9, inStock: true, image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80', description: 'Handcrafted from premium full-grain leather with brass hardware.', features: ['Full-grain Italian leather', 'Solid brass hardware', 'Airline carry-on approved'] },
  { title: 'Minimalist Desk Lamp', price: 85.00, category: 'home', brand: 'Lumina', rating: 4.6, inStock: true, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', description: 'Adjustable color temperatures with built-in Qi wireless charging pad.', features: ['3 Color temperature modes', 'Stepless dimming', '10W Fast wireless charging'] },
  { title: 'Professional DSLR Camera', price: 1299.00, category: 'electronics', brand: 'OpticPro', rating: 4.9, inStock: true, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', description: 'Full-frame sensor with 4K video recording and incredibly fast autofocus.', features: ['45 Megapixel Sensor', '4K 60fps video', 'In-body image stabilization'] },
  { title: 'Ceramic Coffee Mug', price: 24.50, category: 'home', brand: 'Earthly Ceramics', rating: 4.8, inStock: true, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80', description: 'Hand-thrown artisan ceramic mug that retains heat exceptionally well.', features: ['Hand-thrown ceramic', 'Microwave & dishwasher safe', '14oz capacity'] },
  { title: 'Noise-Isolating Earbuds', price: 159.00, category: 'electronics', brand: 'AudioSync', rating: 4.4, inStock: false, image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80', description: 'True wireless earbuds with passive noise isolation and deep bass.', features: ['Bluetooth 5.2', 'IPX4 sweat resistant', '24-hour battery life'] },
  { title: 'Classic Canvas Sneaker', price: 65.00, category: 'apparel', brand: 'UrbanFootwear', rating: 4.5, inStock: true, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', description: 'Durable cotton canvas upper with vulcanized rubber sole.', features: ['100% Cotton canvas', 'Vulcanized rubber sole', 'Machine washable'] },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/products
 * @desc    Get all products (with optional category filter)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Auto-seed if collection is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedProducts);
      console.log('🌱 Products seeded to database');
    }

    const { category, inStock } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product (with optional image upload — Cloudinary or local)
 * @access  Protected (JWT required)
 */
router.post(
  '/',
  protect,
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required').isIn(['electronics', 'accessories', 'home', 'apparel', 'other']).withMessage('Invalid category'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Remove uploaded file if validation fails (local only)
      if (req.file && req.file.path && !useCloudinary) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }

    try {
      const { title, description, price, category, brand, inStock, features } = req.body;

      // Build image URL — Cloudinary path, uploaded file, or default
      let imageUrl = req.body.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
      if (req.file) {
        if (useCloudinary) {
          // Cloudinary returns the URL in req.file.path
          imageUrl = req.file.path;
        } else {
          // Local Multer — construct URL
          imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
      }

      const product = await Product.create({
        title,
        description,
        price: parseFloat(price),
        category,
        brand: brand || 'Generic',
        inStock: inStock !== 'false',
        features: features ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim())) : [],
        image: imageUrl,
        uploadedBy: req.user._id,
      });

      res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
    }
  }
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Protected (JWT required)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete image — Cloudinary or local
    if (product.image) {
      if (useCloudinary && product.image.includes('cloudinary.com')) {
        // Extract public_id from Cloudinary URL and delete
        const { cloudinary } = require('../config/cloudinary');
        const parts = product.image.split('/');
        const folder = parts[parts.length - 2];
        const fileWithExt = parts[parts.length - 1];
        const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (delErr) {
          console.warn('Cloudinary delete warning:', delErr.message);
        }
      } else if (product.image.includes('/uploads/')) {
        const uploadDir = path.join(__dirname, '../uploads');
        const filename = product.image.split('/uploads/')[1];
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
});

/**
 * @route   POST /api/products/upload-image
 * @desc    Upload product image only (Cloudinary or local)
 * @access  Protected
 */
router.post('/upload-image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }

  let imageUrl;
  if (useCloudinary) {
    imageUrl = req.file.path;
  } else {
    imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl,
    filename: req.file.filename || req.file.originalname,
    size: req.file.size,
    storage: useCloudinary ? 'cloudinary' : 'local',
  });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
    }
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
