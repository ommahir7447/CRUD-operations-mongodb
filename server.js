const mongoose = require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const Order = require('./models/order');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/ecommerce_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============ PRODUCTS API ============

// GET /products - Get all products with optional filtering
app.get('/products', async (req, res, next) => {
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

    const filteredProducts = await Product.find(query);

    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    next(error);
  }
});

// GET /products/:id - Get single product
app.get('/products/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /products - Create new product
app.post('/products', validateProduct, async (req, res, next) => {
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
});

// PUT /products/:id - Update product
app.put('/products/:id', validateProduct, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
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
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /products/:id - Delete product
app.delete('/products/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ============ USERS API ============

// GET /users - Get all users (excluding passwords)
app.get('/users', async (req, res, next) => {
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
});

// GET /users/:id - Get single user
app.get('/users/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// POST /users - Create new user
app.post('/users', validateUser, async (req, res, next) => {
  try {
    const { email, name, password, address } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const newUser = new User({
      email: email.toLowerCase(),
      name,
      password: `hashed_${password}`, // In production, use bcrypt
      address
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
});

// PUT /users/:id - Update user
app.put('/users/:id', validateUser, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    const { email, name, password, address } = req.body;

    // Check if new email conflicts with another user
    const emailConflict = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.params.id }
    });

    if (emailConflict) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use by another user'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        email: email.toLowerCase(),
        name,
        password: `hashed_${password}`,
        address
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await Cart.findOneAndDelete({ userId: req.params.id }); // Clean up cart

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ============ CART API ============

// GET /cart/:userId - Get user's cart
app.get('/cart/:userId', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    let cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');

    if (!cart) {
      cart = new Cart({ userId: req.params.userId, items: [] });
      await cart.save();
    }

    // Format cart data for response
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
});

// POST /cart/:userId - Add item to cart
app.post('/cart/:userId', validateCartItem, async (req, res, next) => {
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
      return res.status(400).json({ success: false, error: `Insufficient stock. Only ${product.stock} available` });
    }

    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      cart = new Cart({ userId: req.params.userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add ${quantity} more. Maximum ${product.stock - cart.items[existingItemIndex].quantity} available`
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// PUT /cart/:userId/:productId - Update cart item quantity
app.put('/cart/:userId/:productId', async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Product not in cart' });
    }

    const product = await Product.findById(productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({ success: false, error: `Insufficient stock. Only ${product.stock} available` });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /cart/:userId/:productId - Remove item from cart
app.delete('/cart/:userId/:productId', async (req, res, next) => {
  try {
    const { userId, productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart is empty' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /cart/:userId - Clear entire cart
app.delete('/cart/:userId', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    await Cart.findOneAndDelete({ userId: req.params.userId });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
});

// ============ ORDERS API ============

// GET /orders - Get all orders (admin)
app.get('/orders', async (req, res, next) => {
  try {
    const { userId, status } = req.query;

    let query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }
    if (status) {
      query.status = status.toLowerCase();
    }

    const filteredOrders = await Order.find(query).populate('userId', 'name email');

    res.json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    });
  } catch (error) {
    next(error);
  }
});

// GET /orders/:id - Get single order
app.get('/orders/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// POST /orders - Create new order from cart
app.post('/orders', validateOrder, async (req, res, next) => {
  try {
    const { userId, shippingAddress, paymentMethod } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const orderItems = [];
    let total = 0;

    for (const item of cart.items) {
      if (!item.productId) continue; // Skip if product details couldn't be populated

      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${item.productId.name}. Only ${item.productId.stock} available`
        });
      }

      const itemTotal = item.productId.price * item.quantity;
      orderItems.push({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        subtotal: itemTotal
      });

      total += itemTotal;

      // Update stock
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity }
      });
    }

    const newOrder = new Order({
      userId,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    });

    await newOrder.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /orders/:id - Update order status
app.patch('/orders/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid order ID format' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.status = status.toLowerCase();
    order.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// ============ VALIDATION MIDDLEWARE ============

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

  if (!productId || isNaN(parseInt(productId))) {
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

  if (!userId || isNaN(parseInt(userId))) {
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

// ============ ERROR HANDLING ============

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`
Available endpoints:
  Products: GET/POST /products, GET/PUT/DELETE /products/:id
  Users: GET/POST /users, GET/PUT/DELETE /users/:id
  Cart: GET/POST/DELETE /cart/:userId, PUT/DELETE /cart/:userId/:productId
  Orders: GET/POST /orders, GET /orders/:id, PATCH /orders/:id
  `);
});

module.exports = app;
