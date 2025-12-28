
import { Product, Order, OrderStatus, AuthUser, Analytics } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'agathiya_products',
  ORDERS: 'agathiya_orders',
  USERS: 'agathiya_users',
  AUTH: 'agathiya_auth'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Himalayan Honey',
    description: 'Pure wildflower honey collected from the high-altitude forests.',
    price: 450,
    unit: 'pack',
    category: 'Spices',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Fresh Spinach Leaves',
    description: 'Farm-fresh, pesticides-free organic spinach harvested daily.',
    price: 40,
    unit: 'kg',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400',
    createdAt: Date.now()
  }
];

export const dbService = {
  // Auth & Registration
  async register(userData: AuthUser, password: string): Promise<boolean> {
    const users = this.getAllUsers();
    if (users.find(u => u.email === userData.email)) return false;
    
    const newUser = { ...userData, password };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, newUser]));
    return true;
  },

  async login(email: string, password: string): Promise<AuthUser | null> {
    if (email === 'admin@agathiya.com' && password === 'admin123') {
      const user: AuthUser = { 
        email, role: 'admin', name: 'Store Admin', 
        address: 'HQ', phone: '0000', gender: 'Other' 
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      return user;
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(safeUser));
      return safeUser as AuthUser;
    }
    return null;
  },

  getAllUsers(): any[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getCurrentUser(): AuthUser | null {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([...products, newProduct]));
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const products = await this.getProducts();
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products.filter(p => p.id !== id)));
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },

  async placeOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    const orders = await this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: `AG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'Pending',
      createdAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([newOrder, ...orders]));
    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const orders = await this.getOrders();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders.map(o => o.id === id ? { ...o, status } : o)));
  },

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const orders = await this.getOrders();
    const users = this.getAllUsers();
    return {
      totalOrders: orders.length,
      totalUsers: users.length + 1,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      pendingOrders: orders.filter(o => o.status === 'Pending').length
    };
  }
};
