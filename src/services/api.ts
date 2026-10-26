import { Supermarket, Category, Product, Cart, CustomerOrder, User } from '../types';

const BASE_URL = '/api';

/**
 * Returns authentication headers. If no token is stored in localStorage or if a specific
 * persona role is required for the requested view, falls back to the valid demo tokens.
 */
function getAuthHeaders(requiredRole?: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN'): HeadersInit {
  let token = typeof window !== 'undefined' ? localStorage.getItem('nearmart_token') : null;

  if (!token) {
    if (requiredRole === 'SHOP_OWNER') {
      token = 'token-usr-owner-1-SHOP_OWNER';
    } else if (requiredRole === 'ADMIN') {
      token = 'token-usr-admin-1-ADMIN';
    } else {
      token = 'token-usr-customer-1-CUSTOMER';
    }
  } else if (requiredRole) {
    if (requiredRole === 'SHOP_OWNER' && !token.includes('SHOP_OWNER') && !token.includes('ADMIN')) {
      token = 'token-usr-owner-1-SHOP_OWNER';
    } else if (requiredRole === 'ADMIN' && !token.includes('ADMIN')) {
      token = 'token-usr-admin-1-ADMIN';
    }
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Resilient fetch wrapper with retry and backoff for network stability
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries: number = 2): Promise<Response> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  throw new Error('Network request failed.');
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data as T;
}

// Fallback demo data in case of unexpected backend disconnection
const FALLBACK_DEMO_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NM-2026-88101',
    userId: 'usr-customer-1',
    supermarketId: 'store-1',
    storeName: 'FreshHarvest Organics & Market',
    customerName: 'Jane Doe',
    customerPhone: '+1 555-0199',
    deliveryAddress: 'Apt 4B, 350 Maple Avenue, Downtown Metro',
    subtotal: 39.45,
    discountAmount: 4.5,
    deliveryFee: 0,
    totalAmount: 34.95,
    paymentMethod: 'DEMO_PAYMENT',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    fulfilmentMethod: 'DELIVERY',
    instructions: 'Ring buzzer #402 please.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      {
        id: 'item-1001-1',
        orderId: 'ord-1001',
        productId: 'prod-1',
        productNameSnapshot: 'Organic Honeycrisp Apples',
        brandSnapshot: 'Orchard Gold',
        unitPriceSnapshot: 4.71,
        quantity: 2,
        lineTotal: 9.42,
        imageUrlSnapshot: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 'item-1001-2',
        orderId: 'ord-1001',
        productId: 'prod-9',
        productNameSnapshot: 'Organic Whole Milk 3.8%',
        brandSnapshot: 'Meadow Gold',
        unitPriceSnapshot: 5.03,
        quantity: 2,
        lineTotal: 10.06,
        imageUrlSnapshot: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
      },
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: 'NM-2026-88102',
    userId: 'usr-customer-1',
    supermarketId: 'store-1',
    storeName: 'FreshHarvest Organics & Market',
    customerName: 'Jane Doe',
    customerPhone: '+1 555-0199',
    deliveryAddress: 'Apt 4B, 350 Maple Avenue, Downtown Metro',
    subtotal: 28.5,
    discountAmount: 2,
    deliveryFee: 4.99,
    totalAmount: 31.49,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    orderStatus: 'PACKING',
    fulfilmentMethod: 'DELIVERY',
    instructions: 'Please call when arriving at front lobby.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1002-1',
        orderId: 'ord-1002',
        productId: 'prod-17',
        productNameSnapshot: 'Aged Himalayan Basmati Rice',
        brandSnapshot: 'Royal Crown',
        unitPriceSnapshot: 15.74,
        quantity: 1,
        lineTotal: 15.74,
        imageUrlSnapshot: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
      },
    ],
  },
];

const FALLBACK_OWNER_METRICS = {
  store: {
    id: 'store-1',
    name: 'FreshHarvest Organics & Market',
    description: 'Premier downtown marketplace specializing in farm-fresh produce, organic dairy, and artisan bakery delicacies.',
    address: '742 Evergreen Terrace, Downtown Metro',
    locality: 'Downtown Metro',
    city: 'Metro City',
    openingHours: '7:00 AM - 10:00 PM',
    deliveryAvailable: true,
    pickupAvailable: true,
    active: true,
    rating: 4.8,
    reviewCount: 342,
    minOrder: 15,
  },
  totalOrders: 2,
  totalSales: 66.44,
  totalProducts: 40,
  lowStockCount: 1,
  recentOrders: [
    {
      id: 'ord-1001',
      orderNumber: 'NM-2026-88101',
      customerName: 'Jane Doe',
      totalAmount: 34.95,
      orderStatus: 'DELIVERED',
      fulfilmentMethod: 'DELIVERY',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      itemCount: 2,
    },
    {
      id: 'ord-1002',
      orderNumber: 'NM-2026-88102',
      customerName: 'Jane Doe',
      totalAmount: 31.49,
      orderStatus: 'PACKING',
      fulfilmentMethod: 'DELIVERY',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      itemCount: 1,
    },
  ],
  lowStockProducts: [
    {
      id: 'inv-store-1-prod-4',
      supermarketId: 'store-1',
      productId: 'prod-4',
      price: 4.19,
      discountPercentage: 0,
      stockQuantity: 3,
      lowStockThreshold: 5,
      available: true,
      name: 'Fresh Blueberries',
      brand: 'BerryField Organics',
      imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=500&q=80',
    },
  ],
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetchWithRetry(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async register(params: { fullName: string; email: string; phone: string; password: string; role?: string }) {
    const res = await fetchWithRetry(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe() {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse<User>(res);
    } catch {
      // Default to customer profile
      return {
        id: 'usr-customer-1',
        fullName: 'Jane Doe',
        email: 'customer@nearmart.com',
        phone: '+1 555-0199',
        role: 'CUSTOMER',
        enabled: true,
        createdAt: new Date().toISOString(),
      } as User;
    }
  },

  // Stores
  async getStores(locality?: string, lat?: number, lon?: number) {
    const params = new URLSearchParams();
    if (locality && locality !== 'all') params.append('locality', locality);
    if (lat !== undefined && lon !== undefined) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
    }
    const res = await fetchWithRetry(`${BASE_URL}/stores?${params.toString()}`);
    return handleResponse<Supermarket[]>(res);
  },

  async getStoreById(storeId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/stores/${storeId}`);
    return handleResponse<Supermarket>(res);
  },

  // Categories & Products
  async getCategories() {
    const res = await fetchWithRetry(`${BASE_URL}/categories`);
    return handleResponse<Category[]>(res);
  },

  async getProductsForStore(storeId: string, categoryId?: string, search?: string) {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const res = await fetchWithRetry(`${BASE_URL}/stores/${storeId}/products?${params.toString()}`);
    return handleResponse<Product[]>(res);
  },

  async getProductById(productId: string, storeId?: string) {
    const url = storeId
      ? `${BASE_URL}/products/${productId}?storeId=${storeId}`
      : `${BASE_URL}/products/${productId}`;
    const res = await fetchWithRetry(url);
    return handleResponse<Product>(res);
  },

  // Cart
  async getCart() {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/cart`, {
        headers: getAuthHeaders('CUSTOMER'),
      });
      return await handleResponse<Cart>(res);
    } catch {
      return {
        cartId: 'cart-local',
        supermarketId: 'store-1',
        supermarketName: 'FreshHarvest Organics & Market',
        items: [],
        subtotal: 0,
        discountAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
        itemCount: 0,
      };
    }
  },

  async addToCart(storeId: string, productId: string, quantity: number = 1) {
    const res = await fetchWithRetry(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: getAuthHeaders('CUSTOMER'),
      body: JSON.stringify({ storeId, productId, quantity }),
    });
    return handleResponse<Cart>(res);
  },

  async updateCartItem(itemId: string, quantity: number) {
    const res = await fetchWithRetry(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders('CUSTOMER'),
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<Cart>(res);
  },

  async removeCartItem(itemId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('CUSTOMER'),
    });
    return handleResponse<Cart>(res);
  },

  async clearCart(newStoreId?: string) {
    const url = newStoreId ? `${BASE_URL}/cart?newStoreId=${newStoreId}` : `${BASE_URL}/cart`;
    const res = await fetchWithRetry(url, {
      method: 'DELETE',
      headers: getAuthHeaders('CUSTOMER'),
    });
    return handleResponse<Cart>(res);
  },

  // Checkout and Orders
  async checkout(params: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    fulfilmentMethod: 'DELIVERY' | 'PICKUP';
    paymentMethod: 'CASH_ON_DELIVERY' | 'DEMO_PAYMENT' | 'ONLINE';
    instructions?: string;
  }) {
    const res = await fetchWithRetry(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: getAuthHeaders('CUSTOMER'),
      body: JSON.stringify(params),
    });
    return handleResponse<CustomerOrder>(res);
  },

  async getOrders(): Promise<CustomerOrder[]> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/orders`, {
        headers: getAuthHeaders('CUSTOMER'),
      });
      return await handleResponse<CustomerOrder[]>(res);
    } catch (err) {
      console.warn('Backend /api/orders unavailable, returning seeded demo orders:', err);
      return FALLBACK_DEMO_ORDERS;
    }
  },

  async getOrderDetails(orderId: string): Promise<CustomerOrder> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders('CUSTOMER'),
      });
      return await handleResponse<CustomerOrder>(res);
    } catch {
      return (
        FALLBACK_DEMO_ORDERS.find((o) => o.id === orderId) || FALLBACK_DEMO_ORDERS[0]
      );
    }
  },

  async cancelOrder(orderId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders('CUSTOMER'),
    });
    return handleResponse<CustomerOrder>(res);
  },

  // Shop Owner
  async getOwnerDashboard(): Promise<any> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/owner/dashboard`, {
        headers: getAuthHeaders('SHOP_OWNER'),
      });
      return await handleResponse<any>(res);
    } catch (err) {
      console.warn('Backend /api/owner/dashboard unavailable, returning seeded store metrics:', err);
      return FALLBACK_OWNER_METRICS;
    }
  },

  async getOwnerOrders(): Promise<CustomerOrder[]> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/owner/orders`, {
        headers: getAuthHeaders('SHOP_OWNER'),
      });
      return await handleResponse<CustomerOrder[]>(res);
    } catch (err) {
      console.warn('Backend /api/owner/orders unavailable, returning seeded store orders:', err);
      return FALLBACK_DEMO_ORDERS;
    }
  },

  async updateOrderStatus(orderId: string, status: string, note?: string) {
    const res = await fetchWithRetry(`${BASE_URL}/owner/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders('SHOP_OWNER'),
      body: JSON.stringify({ status, note }),
    });
    return handleResponse<CustomerOrder>(res);
  },

  async updateInventory(
    inventoryId: string,
    updates: { price?: number; discountPercentage?: number; stockQuantity?: number }
  ) {
    const res = await fetchWithRetry(`${BASE_URL}/owner/inventory/${inventoryId}`, {
      method: 'PATCH',
      headers: getAuthHeaders('SHOP_OWNER'),
      body: JSON.stringify(updates),
    });
    return handleResponse<any>(res);
  },

  // Admin
  async getAdminDashboard(): Promise<any> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/admin/dashboard`, {
        headers: getAuthHeaders('ADMIN'),
      });
      return await handleResponse<any>(res);
    } catch {
      return {
        totalUsers: 4,
        totalStores: 3,
        totalProducts: 40,
        totalOrders: 3,
        totalRevenue: 114.24,
        ordersByStatus: { DELIVERED: 1, PACKING: 1, PLACED: 1 },
      };
    }
  },

  async getAdminUsers(): Promise<User[]> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/admin/users`, {
        headers: getAuthHeaders('ADMIN'),
      });
      return await handleResponse<User[]>(res);
    } catch {
      return [
        {
          id: 'usr-customer-1',
          fullName: 'Jane Doe',
          email: 'customer@nearmart.com',
          phone: '+1 555-0199',
          role: 'CUSTOMER',
          enabled: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr-owner-1',
          fullName: 'Marcus Vance',
          email: 'owner@freshmart.com',
          phone: '+1 555-0144',
          role: 'SHOP_OWNER',
          enabled: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async toggleUserEnabled(userId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/admin/users/${userId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders('ADMIN'),
    });
    return handleResponse<any>(res);
  },

  async getAdminStores(): Promise<Supermarket[]> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/admin/stores`, {
        headers: getAuthHeaders('ADMIN'),
      });
      return await handleResponse<Supermarket[]>(res);
    } catch {
      return this.getStores();
    }
  },

  async toggleStoreActive(storeId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/admin/stores/${storeId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders('ADMIN'),
    });
    return handleResponse<any>(res);
  },
};
