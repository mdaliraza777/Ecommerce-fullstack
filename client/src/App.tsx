import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { ProtectedRoute, AdminRoute } from '@/components/common/ProtectedRoute';

import Home from '@/pages/public/Home';
import Products from '@/pages/public/Products';
import ProductDetails from '@/pages/public/ProductDetails';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';

import Profile from '@/pages/auth/Profile';
import Addresses from '@/pages/auth/Addresses';
import Cart from '@/pages/auth/Cart';
import Checkout from '@/pages/auth/Checkout';
import Orders from '@/pages/auth/Orders';
import OrderDetails from '@/pages/auth/OrderDetails';
import Wishlist from '@/pages/auth/Wishlist';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManageProducts from '@/pages/admin/ManageProducts';
import ManageOrders from '@/pages/admin/ManageOrders';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
