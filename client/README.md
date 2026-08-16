# ShopSphere - Full-Stack E-Commerce MVP

A complete e-commerce web application built as an internship MVP project. Features include user authentication, product browsing with search and filters, cart management, checkout with multiple shipping addresses, order tracking, wishlist, product reviews, and an admin dashboard.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide React (icons)

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT (JSON Web Tokens), bcryptjs

## Project Structure

```
shopsphere/
├── src/                        # Frontend (React + Vite)
│   ├── components/
│   │   ├── common/             # Navbar, Footer, ProductCard, Breadcrumb, etc.
│   │   └── ui/                 # Reusable form inputs, buttons, spinner
│   ├── contexts/               # Auth, Cart, Wishlist, Toast providers
│   ├── lib/                    # API layer, types, constants, seed data
│   ├── pages/
│   │   ├── public/             # Home, Products, ProductDetails, Login, Register
│   │   ├── auth/               # Profile, Addresses, Cart, Checkout, Orders, Wishlist
│   │   └── admin/              # Dashboard, ManageProducts, ManageOrders
│   ├── App.tsx                 # Routes
│   └── main.tsx                # Providers + entry point
│
├── server/                     # Backend (Express + MongoDB)
│   ├── models/                 # User, Address, Category, Product, Cart, Order, Wishlist
│   ├── routes/                 # auth, products, categories, cart, addresses, orders, wishlist, admin
│   ├── middleware/             # JWT auth middleware
│   ├── seed/                   # Database seed script
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── .env.example                # Frontend env example
└── README.md
```

## Demo Mode (No Backend Required)

The frontend ships with a **built-in demo mode** that uses browser localStorage to simulate the full backend — no MongoDB or Express needed. This lets you explore all features immediately.

**Demo accounts:**
- Customer: `demo@shopsphere.com` / `password123`
- Admin: `admin@shopsphere.com` / `password123`

### Run the frontend

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Full-Stack Setup (With Backend)

### Prerequisites

- Node.js 18+
- MongoDB (local installation or MongoDB Atlas free cluster)

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env: set MONGO_URI to your MongoDB connection string
```

Start the server:

```bash
npm run dev    # development (auto-restart)
# or
npm start      # production
```

Seed the database with sample data:

```bash
npm run seed
```

The server runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
# From project root
npm install
cp .env.example .env
```

To connect the frontend to the Express backend instead of the localStorage demo mode, replace the API calls in `src/lib/api.ts` with Axios calls to `VITE_API_URL`, or create a new API client that uses the backend endpoints.

```bash
npm run dev
```

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products (search, filter, pagination) |
| GET | `/api/products/featured` | Get top-rated products |
| GET | `/api/products/:id` | Get product details + reviews |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Soft-delete product (admin) |
| POST | `/api/products/:id/reviews` | Add a review |

### Categories
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category (admin) |

### Cart
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cart/:userId` | Get user cart |
| POST | `/api/cart/:userId` | Add item to cart |
| PUT | `/api/cart/:userId/:productId` | Update quantity |
| DELETE | `/api/cart/:userId/:productId` | Remove item |
| DELETE | `/api/cart/:userId` | Clear cart |

### Addresses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/addresses/:userId` | List addresses |
| POST | `/api/addresses/:userId` | Add address |
| PUT | `/api/addresses/:id` | Update address |
| DELETE | `/api/addresses/:id` | Delete address |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/user/:userId` | User's order history |
| GET | `/api/orders/:id` | Order details |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Wishlist
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/wishlist/:userId` | Get wishlist |
| POST | `/api/wishlist/:userId/toggle` | Toggle product in wishlist |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |

## Features

### MVP Features
- User registration and login with JWT authentication
- User profile management
- Product listing with search, category filter, price filter, sorting, and pagination
- Product detail pages with images and reviews
- Add to cart, update quantity, remove items, cart summary
- Multiple shipping addresses (add, edit, delete, set default)
- Checkout with address selection and Cash on Delivery / simulated payment
- Order placement with automatic stock reduction
- Order history and detailed order view
- Order status tracking (placed -> confirmed -> processing -> shipped -> out for delivery -> delivered / cancelled)

### Secondary Features
- Wishlist (save/unsave products)
- Product reviews and ratings (auto-calculated average rating)
- Admin dashboard with revenue, order, and product stats
- Admin product management (create, edit, delete)
- Admin order management (update status)

## Order Status Flow

```
placed -> confirmed -> processing -> shipped -> out_for_delivery -> delivered
                                                                \-> cancelled
```

## Responsive Design

The UI is fully responsive across desktop, tablet, and mobile. The product grid adapts from 2 columns on mobile to 3 on tablet and 3-4 on desktop. The filter sidebar collapses into a slide-out drawer on mobile.

## License

This project is built for educational purposes as an internship MVP.
