export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface Address {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export type ShippingAddress = Omit<Address, '_id' | 'user'>;

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  userName: string;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}
