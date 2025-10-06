# E-commerce Admin Platform - Backend API

A comprehensive backend application for managing an e-commerce admin platform with multi-store support, product management, order processing, and real-time features.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** (Supabase) - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcrypt** - Password hashing

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Multi-Store Management**: Store owners can manage their own stores
- **Product Management**: CRUD operations for products with category support
- **Order Management**: Complete order processing with status tracking
- **Customer Management**: Customer profiles and order history
- **Category Management**: Hierarchical category structure (categories and subcategories)
- **Banner Management**: Dynamic banner management for marketing
- **Rental System**: Product rental management with return tracking
- **Analytics & Reports**: Sales reports, top products, customer growth, revenue analysis
- **Real-time Updates**: Socket.io integration for live notifications

## Project Structure

```
src/
├── config/          # Configuration files (database, JWT)
├── controllers/     # Business logic controllers
├── middleware/      # Custom middleware (auth, validation, error handling)
├── models/          # Database models
├── routes/          # API route definitions
├── services/        # Business services (extensible)
├── sockets/         # Socket.io real-time handlers
├── utils/           # Utility functions (JWT, response formatters)
├── validators/      # Request validation schemas (extensible)
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://postgres.xmfouritklhnyjajsnrb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
CLIENT_URL=http://localhost:5173
```

### 2. Database Setup

1. Open your Supabase SQL Editor
2. Copy the contents of `DATABASE_MIGRATION.sql`
3. Execute the script to create all tables, indexes, and RLS policies
4. Update the `DATABASE_URL` in `.env` with your actual Supabase password

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new admin
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get profile (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)
- `PUT /api/v1/auth/change-password` - Change password (protected)

### Stores
- `POST /api/v1/stores` - Create store
- `GET /api/v1/stores` - Get all stores
- `GET /api/v1/stores/my-stores` - Get my stores
- `GET /api/v1/stores/:id` - Get store by ID
- `PUT /api/v1/stores/:id` - Update store
- `PATCH /api/v1/stores/:id/status` - Update store status
- `DELETE /api/v1/stores/:id` - Delete store

### Products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/store/:storeId` - Get products by store
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `PATCH /api/v1/products/:id/status` - Update product status
- `PATCH /api/v1/products/:id/stock` - Update product stock
- `DELETE /api/v1/products/:id` - Delete product

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/store/:storeId` - Get orders by store
- `GET /api/v1/orders/:id` - Get order by ID
- `GET /api/v1/orders/number/:orderNumber` - Get order by number
- `PUT /api/v1/orders/:id` - Update order
- `PATCH /api/v1/orders/:id/status` - Update order status

### Categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/with-subcategories` - Get categories with subcategories
- `GET /api/v1/categories/:id` - Get category by ID
- `PUT /api/v1/categories/:id` - Update category
- `PATCH /api/v1/categories/:id/status` - Update category status
- `DELETE /api/v1/categories/:id` - Delete category

### Customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers` - Get all customers
- `GET /api/v1/customers/:id` - Get customer by ID
- `PUT /api/v1/customers/:id` - Update customer
- `PATCH /api/v1/customers/:id/status` - Update customer status

### Banners
- `POST /api/v1/banners` - Create banner
- `GET /api/v1/banners` - Get all banners
- `GET /api/v1/banners/:id` - Get banner by ID
- `PUT /api/v1/banners/:id` - Update banner
- `PATCH /api/v1/banners/:id/status` - Update banner status
- `DELETE /api/v1/banners/:id` - Delete banner

### Rentals
- `POST /api/v1/rentals` - Create rental
- `GET /api/v1/rentals` - Get all rentals
- `GET /api/v1/rentals/store/:storeId` - Get rentals by store
- `GET /api/v1/rentals/:id` - Get rental by ID
- `PUT /api/v1/rentals/:id` - Update rental
- `PATCH /api/v1/rentals/:id/return-status` - Update return status

### Analytics
- `GET /api/v1/analytics/overall-summary` - Get overall platform summary
- `GET /api/v1/analytics/store/:storeId/summary` - Get store summary
- `GET /api/v1/analytics/store/:storeId/sales-report` - Get sales report
- `GET /api/v1/analytics/store/:storeId/top-products` - Get top products
- `GET /api/v1/analytics/store/:storeId/customer-growth` - Get customer growth
- `GET /api/v1/analytics/store/:storeId/revenue-by-category` - Get revenue by category

### Health Check
- `GET /api/v1/health` - API health check

## Socket.io Events

### Client Events (Emit)
- `join_store` - Join a store room for real-time updates
- `leave_store` - Leave a store room

### Server Events (Listen)
- `new_order` - New order created
- `order_status_update` - Order status changed
- `product_approval` - Product approval status changed
- `store_status_update` - Store status changed
- `new_message` - New message received
- `inventory_alert` - Low inventory alert

### Socket Authentication

Connect with JWT token:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Database Schema

The database includes the following tables:
- `admins` - Admin user accounts
- `stores` - Store information
- `products` - Product catalog
- `categories` - Product categories (with subcategories)
- `orders` - Order records
- `order_items` - Order line items
- `customers` - Customer information
- `banners` - Marketing banners
- `rentals` - Rental transactions
- `analytics` - Analytics data

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Extending the Application

### Adding New Routes
1. Create a new controller in `src/controllers/`
2. Create corresponding routes in `src/routes/`
3. Register routes in `src/routes/index.js`

### Adding New Models
1. Create a new model file in `src/models/`
2. Define database query methods
3. Import and use in controllers

### Adding Validators
1. Create validation schemas in `src/validators/`
2. Use with express-validator in routes

### Adding Services
1. Create service files in `src/services/`
2. Implement business logic separate from controllers

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Row Level Security (RLS) on all database tables
- Input validation with express-validator
- Helmet.js for security headers
- CORS configuration

## Development Tools

- **nodemon** - Auto-restart on file changes
- **morgan** - HTTP request logger
- **express-validator** - Request validation

## License

Private

## Support

For issues or questions, please contact the development team.
