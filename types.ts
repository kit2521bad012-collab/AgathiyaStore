
export type UnitType = 'kg' | 'gm' | 'liter' | 'pack' | 'pc';
export type CategoryType = 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Spices' | 'Beverages';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: UnitType;
  category: CategoryType;
  imageUrl: string;
  createdAt: number;
}

export type OrderStatus = 'Pending' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  quantityUnit: string;
  total: number;
}

export interface Order {
  id: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
}

export type UserRole = 'user' | 'admin' | null;

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  gender: 'Male' | 'Female' | 'Other' | '';
}

export interface Analytics {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
}
