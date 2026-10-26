export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
  enabled?: boolean;
  createdAt?: string;
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
  distanceKm?: number | null;
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
  categoryName?: string;
  active: boolean;
  aisle: number;
  shelfSection: 'A' | 'B' | 'C';
  model3D: 'produce' | 'box' | 'bottle' | 'can' | 'carton' | 'pouch';
  color3D: string;
  // Store-specific inventory fields (when fetched in context of a store)
  inventoryId?: string;
  price?: number;
  discountPercentage?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  available?: boolean;
  supermarketId?: string;
  supermarketName?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  packageSize: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  lineTotal: number;
  availableStock: number;
}

export interface Cart {
  cartId: string;
  supermarketId: string;
  supermarketName: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  itemCount: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PACKING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

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
  orderStatus: OrderStatus;
  fulfilmentMethod: 'DELIVERY' | 'PICKUP';
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  history?: OrderStatusHistory[];
}
