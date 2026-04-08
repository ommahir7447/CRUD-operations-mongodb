const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['electronics', 'accessories', 'home', 'apparel', 'other'],
        message: 'Category must be one of: electronics, accessories, home, apparel, other',
      },
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,  // URL (Unsplash) or local /uploads/ path
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    },
    features: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
