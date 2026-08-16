import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ShopSphere</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your one-stop shop for quality products across electronics, fashion, home, sports, and more.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=cat_electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=cat_fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=cat_home" className="hover:text-white transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@shopsphere.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1-800-SHOP-NOW</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 123 Commerce St, Portland, OR</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ShopSphere. Built as an internship MVP project.</p>
        </div>
      </div>
    </footer>
  );
}
