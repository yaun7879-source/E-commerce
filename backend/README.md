# E-Commerce Backend Setup Guide

## 📦 Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure MySQL**
   - Make sure MySQL is running on your machine
   - Update `.env` file with your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=ecommerce_db
     DB_PORT=3306
     PORT=5000
     ```

3. **Create Database**
   ```bash
   npm run init-db
   ```

   This will create the database name set in `.env` automatically.

## 🚀 Start Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Cart
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/:cartItemId` - Remove item from cart
- `DELETE /api/cart/clear/:userId` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId` - Update order status

## 🗄️ Database Schema

### Tables Created:
1. **products** - Product information
2. **users** - User accounts & profiles
3. **orders** - Customer orders
4. **order_items** - Items in each order
5. **cart** - Shopping cart items

## 🔐 Security Notes
- Passwords are hashed using bcryptjs
- JWT tokens for authentication (24h expiry)
- Update JWT_SECRET in .env for production

## 📝 Example Requests

**Register User:**
```json
POST /api/users/register
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Create Order:**
```json
POST /api/orders
{
  "userId": 1,
  "items": [
    { "product_id": 1, "quantity": 2, "price": 299 }
  ],
  "total_amount": 598,
  "shipping_address": "123 Main St",
  "payment_method": "credit_card"
}
```

## ✅ Health Check
```
GET /api/health
```

Returns backend status.
