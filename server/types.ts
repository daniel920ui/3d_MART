export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface Supermarket {
  id: string;
  name: string;
  description: string;
  address: string;
  locality: string;
  city: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  minOrder: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  aisleNumber: number;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  packageSize: string;
  imageUrl: string;
  categoryId: string;
  active: boolean;
  aisle: number; // 1 to 5
  shelfSection: 'A' | 'B' | 'C';
  model3D: 'produce' | 'box' | 'bottle' | 'can' | 'carton' | 'pouch';
  color3D: string;
}

export interface StoreInventory {
  id: string;
  supermarketId: string;
  productId: string;
  price: number;
  discountPercentage: number;
  stockQuantity: number;
  lowStockThreshold: number;
  available: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  supermarketId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  userId: string;
  supermarketId: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'DEMO_PAYMENT' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PACKING'
    | 'READY_FOR_PICKUP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';
  fulfilmentMethod: 'DELIVERY' | 'PICKUP';
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  brandSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  imageUrlSnapshot: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  note: string;
  createdAt: string;
}
