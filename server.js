const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/products', require('./routes/products'));
app.use('/users', require('./routes/users'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to E-commerce API (Full MVC Refactored)',
    version: '1.1.0',
    structure: 'Model-View-Controller'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
