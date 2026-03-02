# EXP-6-mongodb-CRUD-operation

A professional Node.js/Express REST API backend for an E-commerce system, following the **Model-View-Controller (MVC)** design pattern and integrated with **MongoDB** for persistent storage.

## 🚀 Features

- **Full CRUD Operations**: For Products, Users, Carts, and Orders.
- **MVC Architecture**: Organized into Config, Controllers, Models, Routes, and Middleware.
- **MongoDB Integration**: Permanent data storage using Mongoose ODM.
- **Payment Details**: Support for `cardDetails` (Card Number, Holder Name, Expiry, CVV) for Users and Orders.
- **Automated Seeding**: Quick database population script with sample data.
- **Stock Management**: Orders automatically update product stock levels.
- **Clean API Design**: Consistent success/error response formats.

## 📁 Project Structure

```text
EXP-6-mongodb-CRUD-operation/
├── config/             # Database connection configuration
│   └── db.js
├── controllers/        # Business logic (MVC Controllers)
│   ├── productController.js
│   ├── userController.js
│   ├── cartController.js
│   └── orderController.js
├── middleware/         # Custom middleware (Validation, Logging)
│   └── validation.js
├── models/             # Mongoose schemas (Models)
│   ├── product.js
│   ├── user.js
│   ├── cart.js
│   └── order.js
├── routes/             # API route definitions
│   ├── products.js
│   ├── users.js
│   ├── cart.js
│   └── orders.js
├── seed-mongo.js       # Database seeder script
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Configuration**:
   The project connects to `mongodb://localhost:27017/ecommerce_db`. Ensure your MongoDB service is running.

3. **Seed the Database**:
   Populate your database with sample products and users:
   ```bash
   node seed-mongo.js
   ```

4. **Start the Server**:
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:3000`.

## 📡 API Endpoints

### Products
- `GET /products` - Get all products (supports category & price filters)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Users
- `GET /users` - List all users (passwords hidden)
- `POST /users` - Register a new user (with `cardDetails`)
- `PUT /users/:id` - Update user information
- `DELETE /users/:id` - Remove user

### Cart
- `GET /cart/:userId` - View user's cart (populated with product details)
- `POST /cart/:userId` - Add/Update item in cart
- `DELETE /cart/:userId/:productId` - Remove item from cart
- `DELETE /cart/:userId` - Clear entire cart

### Orders
- `GET /orders` - List all orders (filter by `userId` or `status`)
- `POST /orders` - Checkout (convert cart to order, update stock)
- `PATCH /orders/:id` - Update order status (pending, shipped, etc.)

## 📝 Example User JSON
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Main St",
  "cardDetails": {
    "cardNumber": "1234567812345678",
    "cardHolderName": "John Doe",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

## 🛡️ License
ISC
