/**
 * Pure business logic for NearMart 3D
 * Decoupled from UI for deterministic testing and validation
 */

export interface CartItemLogic {
  productId: string;
  storeId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  availableStock: number;
}

export interface OrderPricingResult {
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

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Calculates line total and cart summary accurately
 */
export function calculateOrderPricing(
  items: CartItemLogic[],
  fulfilmentMethod: 'DELIVERY' | 'PICKUP' = 'DELIVERY',
  freeDeliveryThreshold: number = 35.0,
  standardDeliveryFee: number = 4.99
): OrderPricingResult {
  let subtotal = 0;
  let totalDiscount = 0;
  let itemCount = 0;

  for (const item of items) {
    const gross = item.unitPrice * item.quantity;
    const discount = gross * (item.discountPercentage / 100);
    subtotal += gross;
    totalDiscount += discount;
    itemCount += item.quantity;
  }

  // Delivery fee rules: free if pickup, or free if net subtotal meets threshold
  const netSubtotal = subtotal - totalDiscount;
  let deliveryFee = 0;
  if (fulfilmentMethod === 'DELIVERY' && items.length > 0) {
    deliveryFee = netSubtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
  }

  const totalAmount = Math.max(0, netSubtotal + deliveryFee);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(totalDiscount.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    itemCount,
  };
}

/**
 * Validates whether adding an item obeys single-store rule and stock limits
 */
export function validateCartAddition(
  currentStoreId: string | null,
  newItem: CartItemLogic,
  currentQuantityInCart: number = 0
): { valid: boolean; error?: string } {
  if (currentStoreId && currentStoreId !== newItem.storeId) {
    return {
      valid: false,
      error: 'Your cart contains items from another supermarket. Please clear your cart or finish checkout first.',
    };
  }

  const requestedTotal = currentQuantityInCart + newItem.quantity;
  if (requestedTotal > newItem.availableStock) {
    return {
      valid: false,
      error: `Only ${newItem.availableStock} items available in stock. Cannot add ${requestedTotal}.`,
    };
  }

  if (newItem.quantity <= 0) {
    return {
      valid: false,
      error: 'Quantity must be at least 1.',
    };
  }

  return { valid: true };
}

/**
 * Checks if order cancellation is permitted based on current status
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return status === 'PLACED' || status === 'CONFIRMED';
}

/**
 * Checks if status transition is valid
 */
export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

/**
 * Haversine formula to calculate distance between two GPS coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
