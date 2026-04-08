# Practical 7 — E-Commerce Backend with Authentication & Testing

**Full Stack Development | Semester 6**
**Student:** Om Ahir

---

## Objective

Implement a complete e-commerce backend with JWT authentication, file uploads via Multer, a payment mockup system, robust data validation, and comprehensive API testing using Postman.

---

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Runtime    | Node.js + Express.js                     |
| Database   | MongoDB Atlas (Mongoose ODM)             |
| Auth       | JSON Web Tokens (JWT) + bcryptjs         |
| Upload     | Multer + Cloudinary (or local disk fallback) |
| Validation | express-validator                        |
| Frontend   | React 19 + React Router + Axios          |
| Testing    | Postman (collection included)            |
| Deployment | Render (render.yaml included)            |

---

## Project Structure

```
Pract-7/
├── server/                     # Backend API
│   ├── middleware/
│   │   └── auth.js             # JWT protect & authorize middleware
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt hashing)
│   │   └── Product.js          # Product schema
│   ├── routes/
│   │   ├── auth.js             # Register, Login, Get Profile
│   │   ├── products.js         # CRUD + image upload
│   │   └── payment.js          # Payment mockup (success/fail)
│   ├── uploads/                # Multer uploaded images
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment template
│   ├── render.yaml             # Render deployment config
│   └── postman_collection.json # Postman test suite
│
├── ecommerce-app/              # React frontend
│   └── src/
│       ├── components/         # Login, Register, Products, Cart, Checkout, Upload
│       ├── context/            # AuthContext, CartContext
│       └── services/api.js     # Axios API client with JWT interceptor
│
├── report.md                   # Short report (2-3 pages)
├── .gitignore
└── README.md                   # This file
```

---

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/fsd-pract7.git
cd fsd-pract7
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
```
Edit `server/.env` with your MongoDB Atlas URI and a JWT secret:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ecommerce
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Install & Run Backend
```bash
cd server
npm install
npm run dev     # Starts with nodemon on http://localhost:5000
```

### 4. Install & Run Frontend
```bash
cd ecommerce-app
npm install
npm start       # Starts on http://localhost:3000
```

---

## API Endpoints

### Health Check
| Method | Endpoint       | Auth | Description             |
|--------|----------------|------|-------------------------|
| GET    | /api/health    | No   | Server status check     |

### Authentication
| Method | Endpoint            | Auth | Description                  |
|--------|---------------------|------|------------------------------|
| POST   | /api/auth/register  | No   | Register (name, email, pass) |
| POST   | /api/auth/login     | No   | Login (returns JWT)          |
| GET    | /api/auth/me        | Yes  | Get current user profile     |

### Products
| Method | Endpoint                    | Auth | Description                  |
|--------|-----------------------------|------|------------------------------|
| GET    | /api/products               | No   | List all (filter by category)|
| GET    | /api/products/:id           | No   | Get single product           |
| POST   | /api/products               | Yes  | Create product + image       |
| DELETE | /api/products/:id           | Yes  | Delete product               |
| POST   | /api/products/upload-image  | Yes  | Upload image only            |

### Payment (Mockup)
| Method | Endpoint              | Auth | Description                    |
|--------|-----------------------|------|--------------------------------|
| POST   | /api/payment/process  | Yes  | Process dummy payment          |
| GET    | /api/payment/methods  | Yes  | List available payment methods |

**Payment Mockup Rules:**
- Card starting with `0000` → DECLINED
- Card starting with `9999` → INSUFFICIENT FUNDS
- All other valid cards → SUCCESS

---

## Postman Testing

Import the included collection into Postman:

```
server/postman_collection.json
```

**20 test cases** covering:
- ✅ Health check
- ✅ Register (success + validation error + duplicate)
- ✅ Login (success + wrong password)
- ✅ Protected routes (with/without token)
- ✅ Products CRUD + category filter + image upload
- ✅ Payment (success + declined + insufficient funds + validation)
- ✅ 404 error handling

> **Tip:** Run requests in order — the Register/Login tests auto-save the JWT token for subsequent protected-route tests.

---

## Deployment on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add Environment Variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a secure random string
   - `NODE_ENV` — `production`

---

## Key Features Implemented

1. **JWT Authentication** — Register/Login with hashed passwords (bcrypt, 12 rounds), JWT with 7-day expiry, `protect` middleware for route guarding
2. **Payment Mockup** — Simulates success, card decline, and insufficient funds scenarios with validation
3. **Image Upload** — Dual-mode uploads: local Multer disk storage fallback + **Cloudinary** cloud integration, 5MB limit, file type filtering (JPEG/PNG/GIF/WEBP)
4. **Data Validation** — express-validator on all input endpoints with field-level error messages
5. **Error Handling** — 404 handler, global error handler, meaningful error responses
6. **Frontend** — React SPA with auth context, cart management, checkout flow, and product upload

---

## License

This project is for educational purposes — Semester 6 FSD Practical.
