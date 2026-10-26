import {
  User,
  Supermarket,
  Category,
  Product,
  StoreInventory,
  Cart,
  CustomerOrder,
  OrderItem,
  OrderStatusHistory,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_SUPERMARKETS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  generateInitialInventory,
  INITIAL_ORDERS,
  INITIAL_ORDER_ITEMS,
  INITIAL_ORDER_HISTORY,
} from './data';
import {
  calculateDistanceKm,
  calculateOrderPricing,
  canCancelOrder,
  isValidStatusTransition,
  OrderStatus,
} from '../src/utils/groceryLogic';

class NearMartStore {
  users: User[] = [...INITIAL_USERS];
  supermarkets: Supermarket[] = [...INITIAL_SUPERMARKETS];
  categories: Category[] = [...INITIAL_CATEGORIES];
  products: Product[] = [...INITIAL_PRODUCTS];
  inventory: StoreInventory[] = generateInitialInventory();
  carts: Map<string, Cart> = new Map(); // keyed by userId
  orders: CustomerOrder[] = [...INITIAL_ORDERS];
  orderItems: OrderItem[] = [...INITIAL_ORDER_ITEMS];
  orderHistory: OrderStatusHistory[] = [...INITIAL_ORDER_HISTORY];

  // Store-owner assignments: userId -> supermarketId
  ownerAssignments: Map<string, string> = new Map([
    ['usr-owner-1', 'store-1'],
    ['usr-owner-2', 'store-2'],
  ]);

  constructor() {
    // Initialize default cart for demo customer
    this.carts.set('usr-customer-1', {
      id: 'cart-demo-1',
      userId: 'usr-customer-1',
      supermarketId: 'store-1',
      items: [
        { id: 'c-item-1', cartId: 'cart-demo-1', productId: 'prod-1', quantity: 2 },
        { id: 'c-item-2', cartId: 'cart-demo-1', productId: 'prod-9', quantity: 1 },
      ],
      updatedAt: new Date().toISOString(),
    });
  }

  // Auth methods
  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  registerUser(params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
  }): User {
    if (this.findUserByEmail(params.email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      passwordHash: params.password,
      role: params.role || 'CUSTOMER',
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);

    // If new shop owner, assign to store-1 or store-3 for demo convenience
    if (newUser.role === 'SHOP_OWNER') {
      this.ownerAssignments.set(newUser.id, 'store-1');
    }

    return newUser;
  }

  // Supermarket methods
  getSupermarkets(locality?: string, userLat?: number, userLon?: number) {
    let stores = this.supermarkets.filter((s) => s.active);
    if (locality && locality !== 'all') {
      stores = stores.filter((s) => s.locality.toLowerCase().includes(locality.toLowerCase()));
    }

    return stores.map((s) => {
      let distanceKm: number | null = null;
      if (typeof userLat === 'number' && typeof userLon === 'number' && !isNaN(userLat) && !isNaN(userLon)) {
        distanceKm = calculateDistanceKm(userLat, userLon, s.latitude, s.longitude);
      }
      return {
        ...s,
        distanceKm,
      };
    });
  }

  getSupermarketById(storeId: string) {
    return this.supermarkets.find((s) => s.id === storeId);
  }

  // Categories & Products
  getCategories() {
    return this.categories.filter((c) => c.active);
  }

  getProductsForStore(storeId: string, categoryId?: string, search?: string) {
    const store = this.getSupermarketById(storeId);
    if (!store) {
      throw new Error(`Supermarket with ID "${storeId}" not found.`);
    }

    let prods = this.products.filter((p) => p.active);
    if (categoryId && categoryId !== 'all') {
      prods = prods.filter((p) => p.categoryId === categoryId);
    }
    if (search) {
      const q = search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Merge store inventory
    return prods.map((product) => {
      const inv = this.inventory.find(
        (i) => i.supermarketId === storeId && i.productId === product.id
      );
      const category = this.categories.find((c) => c.id === product.categoryId);

      return {
        ...product,
        categoryName: category ? category.name : 'Groceries',
        inventoryId: inv ? inv.id : null,
        price: inv ? inv.price : 4.99,
        discountPercentage: inv ? inv.discountPercentage : 0,
        stockQuantity: inv ? inv.stockQuantity : 0,
        lowStockThreshold: inv ? inv.lowStockThreshold : 5,
        available: inv ? inv.available && inv.stockQuantity > 0 : false,
        supermarketId: storeId,
        supermarketName: store.name,
      };
    });
  }

  getProductById(productId: string, storeId?: string) {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) return null;

    const sId = storeId || 'store-1';
    const inv = this.inventory.find(
      (i) => i.supermarketId === sId && i.productId === prod.id
    );
    const category = this.categories.find((c) => c.id === prod.categoryId);
    const store = this.getSupermarketById(sId);

    return {
      ...prod,
      categoryName: category ? category.name : 'Groceries',
      inventoryId: inv ? inv.id : null,
      price: inv ? inv.price : 4.99,
      discountPercentage: inv ? inv.discountPercentage : 0,
      stockQuantity: inv ? inv.stockQuantity : 0,
      available: inv ? inv.available && inv.stockQuantity > 0 : false,
      supermarketId: sId,
      supermarketName: store ? store.name : 'NearMart Store',
    };
  }

  // Cart operations
  getUserCart(userId: string) {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = {
        id: `cart-${userId}`,
        userId,
        supermarketId: 'store-1',
        items: [],
        updatedAt: new Date().toISOString(),
      };
      this.carts.set(userId, cart);
    }

    const store = this.getSupermarketById(cart.supermarketId);

    // Hydrate items with current prices & stocks
    const hydratedItems = cart.items
      .map((item) => {
        const prod = this.products.find((p) => p.id === item.productId);
        if (!prod) return null;
        const inv = this.inventory.find(
          (i) => i.supermarketId === cart!.supermarketId && i.productId === item.productId
        );
        const unitPrice = inv ? inv.price : 4.99;
        const discountPercentage = inv ? inv.discountPercentage : 0;
        const stockQuantity = inv ? inv.stockQuantity : 0;
        const discountedPrice = Number(
          (unitPrice * (1 - discountPercentage / 100)).toFixed(2)
        );

        return {
          id: item.id,
          productId: prod.id,
          name: prod.name,
          brand: prod.brand,
          packageSize: prod.packageSize,
          imageUrl: prod.imageUrl,
          quantity: item.quantity,
          unitPrice,
          discountPercentage,
          discountedPrice,
          lineTotal: Number((discountedPrice * item.quantity).toFixed(2)),
          availableStock: stockQuantity,
        };
      })
      .filter(Boolean);

    // Compute pricing
    const pricingItems = hydratedItems.map((hi: any) => ({
      productId: hi.productId,
      storeId: cart!.supermarketId,
      quantity: hi.quantity,
      unitPrice: hi.unitPrice,
      discountPercentage: hi.discountPercentage,
      availableStock: hi.availableStock,
    }));

    const pricing = calculateOrderPricing(pricingItems, 'DELIVERY');

    return {
      cartId: cart.id,
      supermarketId: cart.supermarketId,
      supermarketName: store ? store.name : 'Supermarket',
      items: hydratedItems,
      ...pricing,
    };
  }

  addToCart(userId: string, storeId: string, productId: string, quantity: number) {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = {
        id: `cart-${userId}`,
        userId,
        supermarketId: storeId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      this.carts.set(userId, cart);
    }

    // Check single store rule
    if (cart.items.length > 0 && cart.supermarketId !== storeId) {
      const currentStore = this.getSupermarketById(cart.supermarketId);
      throw new Error(
        `Your cart contains items from "${currentStore?.name || 'another supermarket'}". Please checkout or clear your current cart to order from this store.`
      );
    }

    // Ensure store matches
    cart.supermarketId = storeId;

    // Check stock
    const inv = this.inventory.find(
      (i) => i.supermarketId === storeId && i.productId === productId
    );
    if (!inv || inv.stockQuantity < 1) {
      throw new Error('This item is currently out of stock.');
    }

    const existing = cart.items.find((item) => item.productId === productId);
    const newQty = existing ? existing.quantity + quantity : quantity;

    if (newQty > inv.stockQuantity) {
      throw new Error(
        `Only ${inv.stockQuantity} items in stock. You already have ${existing ? existing.quantity : 0} in cart.`
      );
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      cart.items.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    cart.updatedAt = new Date().toISOString();
    return this.getUserCart(userId);
  }

  updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = this.carts.get(userId);
    if (!cart) throw new Error('Cart not found.');

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found in cart.');

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    } else {
      const inv = this.inventory.find(
        (i) => i.supermarketId === cart.supermarketId && i.productId === item.productId
      );
      if (inv && quantity > inv.stockQuantity) {
        throw new Error(`Only ${inv.stockQuantity} units available in stock.`);
      }
      item.quantity = quantity;
    }

    cart.updatedAt = new Date().toISOString();
    return this.getUserCart(userId);
  }

  removeCartItem(userId: string, itemId: string) {
    const cart = this.carts.get(userId);
    if (cart) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
      cart.updatedAt = new Date().toISOString();
    }
    return this.getUserCart(userId);
  }

  clearCart(userId: string, newStoreId?: string) {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = {
        id: `cart-${userId}`,
        userId,
        supermarketId: newStoreId || 'store-1',
        items: [],
        updatedAt: new Date().toISOString(),
      };
      this.carts.set(userId, cart);
    } else {
      cart.items = [];
      if (newStoreId) cart.supermarketId = newStoreId;
      cart.updatedAt = new Date().toISOString();
    }
    return this.getUserCart(userId);
  }

  // Checkout and Order Placement
  checkout(params: {
    userId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    fulfilmentMethod: 'DELIVERY' | 'PICKUP';
    paymentMethod: 'CASH_ON_DELIVERY' | 'DEMO_PAYMENT' | 'ONLINE';
    instructions?: string;
  }): CustomerOrder {
    const cart = this.carts.get(params.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty. Add grocery items before checking out.');
    }

    const store = this.getSupermarketById(cart.supermarketId);
    if (!store) throw new Error('Selected store is no longer active.');

    // Atomic Stock and Price Verification
    const orderItemsToCreate: OrderItem[] = [];
    const cartItemsLogic: any[] = [];
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `NM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    for (const item of cart.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      const inv = this.inventory.find(
        (i) => i.supermarketId === cart.supermarketId && i.productId === item.productId
      );

      if (!prod || !inv) {
        throw new Error(`Product ${item.productId} is no longer available.`);
      }

      if (inv.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Only ${inv.stockQuantity} remaining.`
        );
      }

      const discountedPrice = Number(
        (inv.price * (1 - inv.discountPercentage / 100)).toFixed(2)
      );

      orderItemsToCreate.push({
        id: `oi-${Date.now()}-${item.productId}`,
        orderId,
        productId: prod.id,
        productNameSnapshot: prod.name,
        brandSnapshot: prod.brand,
        unitPriceSnapshot: discountedPrice,
        quantity: item.quantity,
        lineTotal: Number((discountedPrice * item.quantity).toFixed(2)),
        imageUrlSnapshot: prod.imageUrl,
      });

      cartItemsLogic.push({
        productId: prod.id,
        storeId: cart.supermarketId,
        quantity: item.quantity,
        unitPrice: inv.price,
        discountPercentage: inv.discountPercentage,
        availableStock: inv.stockQuantity,
      });
    }

    // Deduct stock safely
    for (const item of cart.items) {
      const inv = this.inventory.find(
        (i) => i.supermarketId === cart.supermarketId && i.productId === item.productId
      );
      if (inv) {
        inv.stockQuantity -= item.quantity;
        if (inv.stockQuantity <= 0) {
          inv.available = false;
        }
      }
    }

    // Compute final authorized order pricing on backend
    const pricing = calculateOrderPricing(cartItemsLogic, params.fulfilmentMethod);

    const newOrder: CustomerOrder = {
      id: orderId,
      orderNumber,
      userId: params.userId,
      supermarketId: cart.supermarketId,
      storeName: store.name,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      deliveryAddress: params.deliveryAddress,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      deliveryFee: pricing.deliveryFee,
      totalAmount: pricing.totalAmount,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'DEMO_PAYMENT' ? 'PAID' : 'PENDING',
      orderStatus: 'PLACED',
      fulfilmentMethod: params.fulfilmentMethod,
      instructions: params.instructions || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.orderItems.push(...orderItemsToCreate);

    this.orderHistory.push({
      id: `hist-${Date.now()}`,
      orderId,
      previousStatus: 'NONE',
      newStatus: 'PLACED',
      changedBy: params.customerName,
      note: `Order placed successfully via ${params.paymentMethod.replace(/_/g, ' ')}.`,
      createdAt: new Date().toISOString(),
    });

    // Clear cart after successful order creation
    cart.items = [];
    cart.updatedAt = new Date().toISOString();

    return newOrder;
  }

  // Order queries & cancel
  getUserOrders(userId: string) {
    const userOrders = this.orders.filter((o) => o.userId === userId);
    return userOrders.map((o) => {
      const items = this.orderItems.filter((oi) => oi.orderId === o.id);
      return {
        ...o,
        items,
      };
    });
  }

  getOrderDetails(orderId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const items = this.orderItems.filter((oi) => oi.orderId === orderId);
    const history = this.orderHistory
      .filter((h) => h.orderId === orderId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return {
      ...order,
      items,
      history,
    };
  }

  cancelOrder(orderId: string, userId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found.');
    if (order.userId !== userId) throw new Error('Unauthorized.');

    if (!canCancelOrder(order.orderStatus)) {
      throw new Error(`Order cannot be cancelled in "${order.orderStatus}" status.`);
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = 'CANCELLED';
    order.updatedAt = new Date().toISOString();

    // Restore stock!
    const items = this.orderItems.filter((oi) => oi.orderId === orderId);
    for (const item of items) {
      const inv = this.inventory.find(
        (i) => i.supermarketId === order.supermarketId && i.productId === item.productId
      );
      if (inv) {
        inv.stockQuantity += item.quantity;
        inv.available = true;
      }
    }

    this.orderHistory.push({
      id: `hist-${Date.now()}`,
      orderId,
      previousStatus,
      newStatus: 'CANCELLED',
      changedBy: 'Customer',
      note: 'Order cancelled by customer. Inventory restored.',
      createdAt: new Date().toISOString(),
    });

    return this.getOrderDetails(orderId);
  }

  // Shop Owner operations
  getStoreForOwner(ownerId: string): Supermarket {
    const storeId = this.ownerAssignments.get(ownerId) || 'store-1';
    const store = this.getSupermarketById(storeId);
    if (!store) throw new Error('Assigned store not found.');
    return store;
  }

  getOwnerDashboardMetrics(ownerId: string) {
    const store = this.getStoreForOwner(ownerId);
    const storeOrders = this.orders.filter((o) => o.supermarketId === store.id);
    const storeInventory = this.inventory.filter((i) => i.supermarketId === store.id);

    const totalOrders = storeOrders.length;
    const totalSales = storeOrders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const lowStockItems = storeInventory.filter(
      (i) => i.stockQuantity <= i.lowStockThreshold
    );

    return {
      store,
      totalOrders,
      totalSales: Number(totalSales.toFixed(2)),
      totalProducts: storeInventory.length,
      lowStockCount: lowStockItems.length,
      recentOrders: storeOrders.slice(0, 5).map((o) => ({
        ...o,
        itemCount: this.orderItems.filter((oi) => oi.orderId === o.id).length,
      })),
      lowStockProducts: lowStockItems.map((inv) => {
        const prod = this.products.find((p) => p.id === inv.productId);
        return {
          ...inv,
          name: prod?.name || 'Item',
          brand: prod?.brand || '',
          imageUrl: prod?.imageUrl || '',
        };
      }),
    };
  }

  getOwnerOrders(ownerId: string) {
    const store = this.getStoreForOwner(ownerId);
    const storeOrders = this.orders.filter((o) => o.supermarketId === store.id);
    return storeOrders.map((o) => {
      const items = this.orderItems.filter((oi) => oi.orderId === o.id);
      return {
        ...o,
        items,
      };
    });
  }

  updateOrderStatus(
    ownerId: string,
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) {
    const store = this.getStoreForOwner(ownerId);
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found.');
    if (order.supermarketId !== store.id) {
      throw new Error('Unauthorized to modify orders from other supermarkets.');
    }

    if (!isValidStatusTransition(order.orderStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from ${order.orderStatus} to ${newStatus}.`
      );
    }

    const prev = order.orderStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'DELIVERED' && order.paymentMethod === 'CASH_ON_DELIVERY') {
      order.paymentStatus = 'PAID';
    }

    this.orderHistory.push({
      id: `hist-${Date.now()}`,
      orderId,
      previousStatus: prev,
      newStatus,
      changedBy: `${store.name} Staff`,
      note: note || `Order status updated to ${newStatus.replace(/_/g, ' ')}.`,
      createdAt: new Date().toISOString(),
    });

    return this.getOrderDetails(orderId);
  }

  updateInventoryItem(
    ownerId: string,
    inventoryId: string,
    updates: { price?: number; discountPercentage?: number; stockQuantity?: number }
  ) {
    const store = this.getStoreForOwner(ownerId);
    const inv = this.inventory.find((i) => i.id === inventoryId);
    if (!inv) throw new Error('Inventory record not found.');
    if (inv.supermarketId !== store.id) throw new Error('Unauthorized.');

    if (typeof updates.price === 'number') inv.price = Number(updates.price.toFixed(2));
    if (typeof updates.discountPercentage === 'number')
      inv.discountPercentage = Math.max(0, Math.min(100, updates.discountPercentage));
    if (typeof updates.stockQuantity === 'number') {
      inv.stockQuantity = Math.max(0, updates.stockQuantity);
      inv.available = inv.stockQuantity > 0;
    }

    return inv;
  }

  // Admin operations
  getAdminDashboard() {
    const totalRevenue = this.orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const statusCounts: Record<string, number> = {};
    for (const ord of this.orders) {
      statusCounts[ord.orderStatus] = (statusCounts[ord.orderStatus] || 0) + 1;
    }

    return {
      totalCustomers: this.users.filter((u) => u.role === 'CUSTOMER').length,
      totalShopOwners: this.users.filter((u) => u.role === 'SHOP_OWNER').length,
      totalSupermarkets: this.supermarkets.length,
      totalProducts: this.products.length,
      totalOrders: this.orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      statusCounts,
      recentOrders: this.orders.slice(0, 8),
    };
  }

  getAllUsers() {
    return this.users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      enabled: u.enabled,
      createdAt: u.createdAt,
    }));
  }

  toggleUserEnabled(userId: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found.');
    user.enabled = !user.enabled;
    return user;
  }

  getAllStores() {
    return this.supermarkets;
  }

  toggleStoreActive(storeId: string) {
    const store = this.getSupermarketById(storeId);
    if (!store) throw new Error('Store not found.');
    store.active = !store.active;
    return store;
  }
}

export const nearMartStore = new NearMartStore();
