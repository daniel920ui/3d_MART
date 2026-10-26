import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderPricing,
  validateCartAddition,
  canCancelOrder,
  isValidStatusTransition,
  calculateDistanceKm,
  CartItemLogic,
} from './groceryLogic';

test('calculateOrderPricing computes subtotal, discounts and free delivery above threshold', () => {
  const items: CartItemLogic[] = [
    {
      productId: 'p-1',
      storeId: 'store-1',
      quantity: 2,
      unitPrice: 10.0,
      discountPercentage: 10, // $1 discount each -> $2 discount
      availableStock: 20,
    },
    {
      productId: 'p-2',
      storeId: 'store-1',
      quantity: 1,
      unitPrice: 20.0,
      discountPercentage: 0,
      availableStock: 5,
    },
  ];

  // Net subtotal = (20 - 2) + 20 = 38.00 (>= 35 threshold => free delivery)
  const resultDelivery = calculateOrderPricing(items, 'DELIVERY');
  assert.equal(resultDelivery.subtotal, 40.0);
  assert.equal(resultDelivery.discountAmount, 2.0);
  assert.equal(resultDelivery.deliveryFee, 0);
  assert.equal(resultDelivery.totalAmount, 38.0);
  assert.equal(resultDelivery.itemCount, 3);

  // If below threshold ($18 net), delivery fee is applied
  const smallCart: CartItemLogic[] = [
    {
      productId: 'p-1',
      storeId: 'store-1',
      quantity: 1,
      unitPrice: 20.0,
      discountPercentage: 10, // $2 discount -> $18 net
      availableStock: 10,
    },
  ];
  const resultWithFee = calculateOrderPricing(smallCart, 'DELIVERY', 35.0, 4.99);
  assert.equal(resultWithFee.subtotal, 20.0);
  assert.equal(resultWithFee.discountAmount, 2.0);
  assert.equal(resultWithFee.deliveryFee, 4.99);
  assert.equal(resultWithFee.totalAmount, 22.99);

  // If pickup, delivery fee is 0 even below threshold
  const resultPickup = calculateOrderPricing(smallCart, 'PICKUP');
  assert.equal(resultPickup.deliveryFee, 0);
  assert.equal(resultPickup.totalAmount, 18.0);
});

test('validateCartAddition enforces single-store rule and stock boundaries', () => {
  const itemFromStoreA: CartItemLogic = {
    productId: 'p-10',
    storeId: 'store-A',
    quantity: 3,
    unitPrice: 5.0,
    discountPercentage: 0,
    availableStock: 5,
  };

  // Adding to store-B cart should fail
  const multiStoreCheck = validateCartAddition('store-B', itemFromStoreA, 0);
  assert.equal(multiStoreCheck.valid, false);
  assert.match(multiStoreCheck.error!, /another supermarket/i);

  // Exceeding stock should fail
  const stockExceeded = validateCartAddition('store-A', itemFromStoreA, 3); // 3 existing + 3 new = 6 > 5
  assert.equal(stockExceeded.valid, false);
  assert.match(stockExceeded.error!, /available in stock/i);

  // Valid addition
  const validCheck = validateCartAddition('store-A', itemFromStoreA, 1); // 1 existing + 3 new = 4 <= 5
  assert.equal(validCheck.valid, true);
});

test('order status transitions and cancellation constraints work properly', () => {
  assert.equal(canCancelOrder('PLACED'), true);
  assert.equal(canCancelOrder('CONFIRMED'), true);
  assert.equal(canCancelOrder('PACKING'), false);
  assert.equal(canCancelOrder('OUT_FOR_DELIVERY'), false);
  assert.equal(canCancelOrder('DELIVERED'), false);

  assert.equal(isValidStatusTransition('PLACED', 'CONFIRMED'), true);
  assert.equal(isValidStatusTransition('CONFIRMED', 'PACKING'), true);
  assert.equal(isValidStatusTransition('PACKING', 'OUT_FOR_DELIVERY'), true);
  assert.equal(isValidStatusTransition('OUT_FOR_DELIVERY', 'DELIVERED'), true);
  assert.equal(isValidStatusTransition('DELIVERED', 'PLACED'), false);
});

test('calculateDistanceKm produces realistic distances using Haversine formula', () => {
  // Distance between Times Square NYC (40.7580, -73.9855) and Central Park NYC (40.7829, -73.9654) ~3.2km
  const distance = calculateDistanceKm(40.758, -73.9855, 40.7829, -73.9654);
  assert.ok(distance > 2.5 && distance < 4.0, `Expected ~3km, got ${distance}`);

  // Same point
  assert.equal(calculateDistanceKm(12.9716, 77.5946, 12.9716, 77.5946), 0);
});
