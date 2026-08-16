import type { ShippingAddress } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'shopsphere_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        removeToken();
      }
      return { error: data.message || 'Request failed' } as T;
    }
    return data as T;
  } catch {
    return { error: 'Network error - is the server running?' } as T;
  }
}

function userIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

// ===== Auth API =====
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await request<{ token: string; user: unknown } | { error: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if ('token' in res) {
      setToken(res.token);
    }
    return res;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await request<{ token: string; user: unknown } | { error: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if ('token' in res) {
      setToken(res.token);
    }
    return res;
  },

  getProfile: async () => {
    return request<{ user: unknown } | { error: string }>('/auth/profile');
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    return request<{ user: unknown } | { error: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    removeToken();
  },

  getToken,
  getUserId: userIdFromToken,
};

// ===== Product API =====
export const productAPI = {
  getProducts: async (params: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.minPrice !== undefined && params.minPrice !== null) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice !== null) query.set('maxPrice', String(params.maxPrice));
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return request<{ products: unknown[]; page: number; totalPages: number; total: number } | { error: string }>(
      `/products?${query.toString()}`
    );
  },

  getProduct: async (id: string) => {
    return request<{ product: unknown; category: unknown; reviews: unknown[] } | { error: string }>(
      `/products/${id}`
    );
  },

  getCategories: async () => {
    return request<{ categories: unknown[] } | { error: string }>('/categories');
  },

  getFeatured: async () => {
    return request<{ products: unknown[] } | { error: string }>('/products/featured');
  },

  createProduct: async (data: Record<string, unknown>) => {
    return request<{ product: unknown } | { error: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: Record<string, unknown>) => {
    return request<{ product: unknown } | { error: string }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string) => {
    return request<{ success: boolean } | { error: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Cart API =====
export const cartAPI = {
  getCart: async () => {
    return request<{ cart: unknown } | { error: string }>('/cart');
  },

  addToCart: async (productId: string, quantity: number) => {
    return request<{ cart: unknown } | { error: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateQuantity: async (productId: string, quantity: number) => {
    return request<{ cart: unknown } | { error: string }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (productId: string) => {
    return request<{ cart: unknown } | { error: string }>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return request<{ cart: unknown } | { error: string }>('/cart', {
      method: 'DELETE',
    });
  },
};

// ===== Address API =====
export const addressAPI = {
  getAddresses: async () => {
    return request<{ addresses: unknown[] } | { error: string }>('/addresses');
  },

  addAddress: async (data: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }) => {
    return request<{ address: unknown } | { error: string }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAddress: async (id: string, data: Record<string, unknown>) => {
    return request<{ address: unknown } | { error: string }>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAddress: async (id: string) => {
    return request<{ success: boolean } | { error: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Order API =====
export const orderAPI = {
  createOrder: async (data: { shippingAddressId: string; paymentMethod: string }) => {
    return request<{ order: unknown } | { error: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrders: async () => {
    return request<{ orders: unknown[] } | { error: string }>('/orders/my-orders');
  },

  getOrder: async (id: string) => {
    return request<{ order: unknown } | { error: string }>(`/orders/${id}`);
  },

  // Admin
  getAllOrders: async () => {
    return request<{ orders: unknown[] } | { error: string }>('/admin/orders');
  },

  updateOrderStatus: async (id: string, status: string) => {
    return request<{ order: unknown } | { error: string }>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus: status }),
    });
  },
};

// ===== Review API =====
export const reviewAPI = {
  addReview: async (data: { product: string; rating: number; comment: string }) => {
    return request<{ review: unknown } | { error: string }>(`/products/${data.product}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating: data.rating, comment: data.comment }),
    });
  },

  editReview: async (reviewId: string, data: { rating: number; comment: string; product: string }) => {
    return request<{ review: unknown } | { error: string }>(`/products/${data.product}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating: data.rating, comment: data.comment }),
    });
  },

  deleteReview: async (reviewId: string, productId: string) => {
    return request<{ success: boolean } | { error: string }>(`/products/${productId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

// ===== Wishlist API =====
export const wishlistAPI = {
  getWishlist: async () => {
    return request<{ products: unknown[] } | { error: string }>('/wishlist');
  },

  toggleWishlist: async (productId: string) => {
    return request<{ inWishlist: boolean } | { error: string }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
};

// ===== Admin API =====
export const adminAPI = {
  getStats: async () => {
    return request<{ stats: unknown } | { error: string }>('/admin/stats');
  },
};

// Re-export ShippingAddress type for any consumers that imported it from api.ts
export type { ShippingAddress };
