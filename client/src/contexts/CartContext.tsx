import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    isActive: boolean;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  refresh: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<{ error?: string }>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const res = await cartAPI.getCart();
    if ('cart' in res) {
      setItems(res.cart.items as CartItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const res = await cartAPI.addToCart(productId, quantity);
    if ('error' in res) return { error: res.error };
    await refresh();
    return {};
  }, [refresh]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    await cartAPI.updateQuantity(productId, quantity);
    await refresh();
  }, [refresh]);

  const removeFromCart = useCallback(async (productId: string) => {
    await cartAPI.removeFromCart(productId);
    await refresh();
  }, [refresh]);

  const clearCart = useCallback(async () => {
    await cartAPI.clearCart();
    setItems([]);
  }, []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, count, subtotal, refresh, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
