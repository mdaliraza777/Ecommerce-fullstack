import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { wishlistAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  productIds: string[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setProductIds([]);
      return;
    }
    const res = await wishlistAPI.getWishlist();
    if ('products' in res) {
      setProductIds(res.products.filter((p): p is NonNullable<typeof p> => Boolean(p)).map((p) => p._id));
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const res = await wishlistAPI.toggleWishlist(productId);
    if ('inWishlist' in res) {
      setProductIds((prev) =>
        res.inWishlist ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
      return res.inWishlist;
    }
    return false;
  }, []);

  const isInWishlist = useCallback((productId: string) => productIds.includes(productId), [productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, toggleWishlist, isInWishlist, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
