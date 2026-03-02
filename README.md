# E-Commerce REST API Backend

A comprehensive Node.js/Express REST API for e-commerce applications with complete CRUD operations, data validation, middleware, and error handling.

## Features

✅ **Complete REST APIs** for Products, Users, Cart, and Orders  
✅ **Data Validation** with custom middleware  
✅ **Error Handling** with global error handlers  
✅ **Request Logging** middleware  
✅ **Stock Management** with validation  
✅ **Cart Management** with product enrichment  
✅ **Order Processing** with automatic inventory updates  
✅ **Query Filtering** for products and orders  

## Installation

```bash
npm install
```

## Running the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server will start on `http://localhost:3000`

## Testing the API

```bash
# Run automated tests
npm test

# Or manually using curl/Postman/Thunder Client
```

## API Endpoints

### Products API

#### Get All Products
```http
GET /products
```

**Query Parameters:**
- `category` - Filter by category (e.g., Electronics)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search in name and description

**Example:**
```bash
curl http://localhost:3000/products?category=Electronics&maxPrice=500
```

#### Get Single Product
```http
GET /products/:id
```

#### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "Laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 10,
  "description": "High-performance laptop"
}
```

#### Update Product
```http
PUT /products/:id
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "price": 1299.99,
  "category": "Electronics",
  "stock": 5,
  "description": "High-end gaming laptop"
}
```

#### Delete Product
```http
DELETE /products/:id
```

---

### Users API

#### Get All Users
```http
GET /users
```

**Note:** Passwords are excluded from responses

#### Get Single User
```http
GET /users/:id
```

#### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "address": "123 Main St"
}
```

**Validation:**
- Email must be valid format
- Email must be unique
- Password minimum 6 characters
- Name is required

#### Update User
```http
PUT /users/:id
Content-Type: application/json

{
  "email": "newemail@example.com",
  "name": "John Updated",
  "password": "newpassword123",
  "address": "456 Oak Ave"
}
```

#### Delete User
```http
DELETE /users/:id
```

**Note:** Deleting a user also clears their cart

---

### Cart API

#### Get User's Cart
```http
GET /cart/:userId
```

**Response includes:**
- Cart items with product details
- Subtotals for each item
- Total cart value

#### Add Item to Cart
```http
POST /cart/:userId
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

**Features:**
- Validates product exists
- Checks stock availability
- Merges if product already in cart

#### Update Cart Item Quantity
```http
PUT /cart/:userId/:productId
Content-Type: application/json

{
  "quantity": 5
}
```

#### Remove Item from Cart
```http
DELETE /cart/:userId/:productId
```

#### Clear Entire Cart
```http
DELETE /cart/:userId
```

---

### Orders API

#### Get All Orders
```http
GET /orders
```

**Query Parameters:**
- `userId` - Filter by user ID
- `status` - Filter by status (pending, processing, shipped, delivered, cancelled)

**Example:**
```bash
curl http://localhost:3000/orders?userId=1&status=pending
```

#### Get Single Order
```http
GET /orders/:id
```

#### Create Order (from cart)
```http
POST /orders
Content-Type: application/json

{
  "userId": 1,
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "Credit Card"
}
```

**Process:**
1. Validates user exists
2. Checks cart is not empty
3. Validates stock for all items
4. Creates order
5. Reduces product stock
6. Clears user's cart

#### Update Order Status
```http
PATCH /orders/:id
Content-Type: application/json

{
  "status": "shipped"
}
```

**Valid statuses:** pending, processing, shipped, delivered, cancelled

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

## Validation Rules

### Products
- **name**: Required, non-empty string
- **price**: Required, non-negative number
- **category**: Required, non-empty string
- **stock**: Required, non-negative integer
- **description**: Optional string

### Users
- **email**: Required, valid email format, unique
- **name**: Required, non-empty string
- **password**: Required, minimum 6 characters
- **address**: Optional string

### Cart Items
- **productId**: Required, valid integer
- **quantity**: Required, minimum 1

### Orders
- **userId**: Required, valid integer
- **shippingAddress**: Required, non-empty string
- **paymentMethod**: Required, non-empty string

## Error Handling

The API includes comprehensive error handling:

1. **Validation Errors** (400) - Invalid input data
2. **Not Found Errors** (404) - Resource doesn't exist
3. **Conflict Errors** (409) - Duplicate email, etc.
4. **Server Errors** (500) - Unexpected errors

All errors return consistent JSON format with descriptive messages.

## Middleware

### Request Logger
Logs all incoming requests with timestamp, method, and path.

### Validation Middleware
- `validateProduct` - Validates product data
- `validateUser` - Validates user data
- `validateCartItem` - Validates cart items
- `validateOrder` - Validates order data

### Error Handlers
- 404 handler for unknown routes
- Global error handler for all exceptions

## Example Workflow

```bash
# 1. Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123","address":"123 Main St"}'

# 2. Add products to cart
curl -X POST http://localhost:3000/cart/1 \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'

# 3. View cart
curl http://localhost:3000/cart/1

# 4. Create order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"shippingAddress":"123 Main St","paymentMethod":"Credit Card"}'

# 5. Check order status
curl http://localhost:3000/orders/1

# 6. Update order status
curl -X PATCH http://localhost:3000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped"}'
```

## Data Storage

Currently uses in-memory storage (arrays and objects). In production, replace with:
- **Database**: MongoDB, PostgreSQL, MySQL
- **Password Hashing**: bcrypt or argon2
- **Authentication**: JWT tokens
- **Session Management**: express-session or Redis

## Future Enhancements

- [ ] Database integration
- [ ] Authentication & Authorization (JWT)
- [ ] Password hashing (bcrypt)
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] Pagination for large datasets
- [ ] Image upload for products
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Advanced search & filtering
- [ ] Order history and tracking
- [ ] Product reviews and ratings

## Dependencies

- **express** - Web framework
- **cors** - CORS middleware

## Development Dependencies

- **nodemon** - Auto-reload during development

## License

ISC
