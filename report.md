# Practical 7 — Report
## Authentication, File Upload, Payment Mockup & API Testing

**Subject:** Full Stack Development (FSD)  
**Semester:** 6  
**Student:** Om Ahir  
**Date:** April 2026

---

## 1. Introduction

This practical focuses on building a production-grade e-commerce REST API that implements five core backend concepts: JWT-based authentication, file upload handling, payment gateway simulation, input data validation, and structured API testing. The backend is built with Node.js and Express.js, backed by MongoDB Atlas, and accompanied by a React frontend for end-to-end demonstration.

---

## 2. Implementation Details

### 2.1 JWT Authentication

**Objective:** Secure the API with token-based authentication.

- **Registration** (`POST /api/auth/register`): Accepts name, email, and password. Passwords are hashed using `bcryptjs` with a salt round of 12 before being stored in MongoDB. Upon successful registration, a JWT is generated and returned.
- **Login** (`POST /api/auth/login`): Validates email/password, compares the hashed password using `bcrypt.compare()`, and returns a signed JWT with a 7-day expiry.
- **Route Protection**: A reusable `protect` middleware extracts the Bearer token from the `Authorization` header, verifies it using `jsonwebtoken`, and attaches the decoded user to `req.user`. Protected routes (product creation, payment) require this middleware.
- **Role-Based Access**: An `authorize()` middleware restricts routes by user role (e.g., admin-only endpoints).

**Key Security Decisions:**
- Password field uses `select: false` in the Mongoose schema so it is never returned in queries unless explicitly requested.
- JWT secret is stored in `.env` and never committed to version control.
- Token expiry errors return specific messages ("Token expired. Please log in again.") for better UX.

### 2.2 Payment Mockup

**Objective:** Simulate a payment gateway without integrating a real provider.

- **Process Payment** (`POST /api/payment/process`): Accepts card number, cardholder name, expiry (MM/YY format), CVV, and amount. A simulated 800ms delay mimics real gateway latency.
- **Mockup Logic:**
  - Cards starting with `0000` return a **DECLINED** response (HTTP 402).
  - Cards starting with `9999` return an **INSUFFICIENT_FUNDS** response (HTTP 402).
  - All other valid cards return a **SUCCESS** response (HTTP 200) with a generated transaction ID.
- **Payment Methods** (`GET /api/payment/methods`): Returns supported payment options (Card, UPI, COD) as a mockup.

### 2.3 Image Upload with Multer

**Objective:** Handle product image uploads on the server.

- **Configuration:** Multer is configured with `diskStorage` to save files to a `server/uploads/` directory with unique timestamped filenames (e.g., `product-1712345678-9876.jpg`).
- **File Validation:** Only JPEG, PNG, GIF, and WEBP files are accepted. A 5MB size limit is enforced.
- **Two Upload Endpoints:**
  - `POST /api/products` — Creates a product with an optional attached image.
  - `POST /api/products/upload-image` — Standalone image upload that returns the URL.
- **Static Serving:** Uploaded files are served via `express.static` at the `/uploads` path.
- **Cleanup:** When a product is deleted, its associated uploaded image file is also removed from disk.

### 2.4 Data Validation

**Objective:** Ensure all input data is sanitized and validated before processing.

- **Library:** `express-validator` is used across all POST endpoints.
- **Registration Validation:** Name (2–50 chars), email (valid format, normalized), password (min 6 chars, must contain a digit).
- **Product Validation:** Title (min 3 chars), description (min 10 chars), price (positive number), category (must be one of: electronics, accessories, home, apparel, other).
- **Payment Validation:** Amount (> 0), card number (13–19 digits), expiry (MM/YY regex), CVV (3–4 numeric digits).
- **Error Response Format:** All validation errors return HTTP 400 with a structured array: `[{ field, message }]`.

### 2.5 Deployment

**Objective:** Deploy the backend API to a cloud platform.

- **Platform:** Render (render.com) — free tier web service.
- **Configuration:** A `render.yaml` file defines the build/start commands and environment variables.
- **Environment Variables:** `MONGO_URI` and `JWT_SECRET` are configured through the Render dashboard (not in code).
- **GitHub:** The codebase is pushed to a GitHub repository with `.env` excluded via `.gitignore`.

---

## 3. API Testing with Postman

A comprehensive Postman collection (`server/postman_collection.json`) contains **20 test cases** organized into four folders:

| Folder            | Test Cases | Description                                            |
|-------------------|:----------:|--------------------------------------------------------|
| Health Check      | 1          | Verifies server is running                             |
| Authentication    | 7          | Register, login, profile, validation errors, no-token  |
| Products          | 8          | List, filter, get by ID, create, upload, delete, errors|
| Payment Mockup    | 6          | Success, decline, insufficient funds, validation, 401  |
| Error Handling    | 1          | 404 route not found                                    |

**Automated Tests:** Each request includes Postman test scripts that:
- Assert correct HTTP status codes (200, 201, 400, 401, 402, 404, 409)
- Validate response structure (success flag, data shape, error arrays)
- Auto-save JWT tokens using `pm.collectionVariables.set('token', ...)` for chained requests

**How to Run:**
1. Import `postman_collection.json` into Postman
2. Ensure the backend server is running on `http://localhost:5000`
3. Run the collection using Postman's Collection Runner (requests should be run in order)

---

## 4. Project Structure Summary

```
Pract-7/
├── server/                     # Express.js Backend
│   ├── middleware/auth.js       # JWT verification middleware
│   ├── models/User.js           # User schema with password hashing
│   ├── models/Product.js        # Product schema
│   ├── routes/auth.js           # Auth endpoints (register, login, me)
│   ├── routes/products.js       # Product CRUD + Multer upload
│   ├── routes/payment.js        # Payment mockup endpoints
│   ├── server.js                # App entry point + DB connection
│   ├── .env.example             # Environment variable template
│   ├── postman_collection.json  # Postman test suite (20 tests)
│   └── render.yaml              # Render deployment config
│
├── ecommerce-app/               # React Frontend
│   └── src/
│       ├── components/           # UI: Login, Register, Products, Cart, Checkout
│       ├── context/              # AuthContext (JWT session), CartContext
│       └── services/api.js       # Axios client with JWT interceptor
│
├── README.md                    # Setup & usage documentation
├── report.md                    # This report
└── .gitignore                   # Excludes .env, node_modules, uploads
```

---

## 5. Conclusion

This practical demonstrates a complete implementation of essential backend features required for an e-commerce application. The JWT authentication system secures protected endpoints, Multer handles file uploads with proper validation, the payment mockup simulates real-world gateway behavior, and express-validator ensures data integrity at every entry point. The Postman collection provides verifiable proof of all API functionality with automated assertions, and the deployment configuration enables easy hosting on Render.

---

## References

- Express.js Documentation — https://expressjs.com
- Mongoose ODM — https://mongoosejs.com
- JSON Web Tokens (RFC 7519) — https://jwt.io
- Multer — https://github.com/expressjs/multer
- express-validator — https://express-validator.github.io
- Render Deployment — https://render.com/docs
