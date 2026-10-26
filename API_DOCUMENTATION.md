# NearMart 3D — REST API Documentation

Base URL: `/api` (or `http://localhost:8080/api` on Spring Boot)

All authenticated endpoints require an `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new customer or shop owner account.
- **Request Body:**
  ```json
  {
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "phone": "+1 555-0122",
    "password": "Password@123",
    "role": "CUSTOMER"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "token-usr-12345-CUSTOMER",
    "user": {
      "id": "usr-12345",
      "fullName": "Alice Smith",
      "email": "alice@example.com",
      "role": "CUSTOMER"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing account.
- **Request Body:**
  ```json
  {
    "email": "customer@nearmart.com",
    "password": "Customer@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "token-usr-customer-1-CUSTOMER",
    "user": { ... }
  }
  ```

### `GET /api/auth/me`
Retrieves current profile details (requires Bearer token).

---

## 2. Supermarkets & Discovery

### `GET /api/stores`
Returns list of active supermarkets with optional distance calculation.
- **Query Parameters:**
  - `locality` (optional): filter by neighborhood
  - `lat`, `lon` (optional): customer coordinates for Haversine distance
- **Response (200 OK):** Array of `Supermarket` objects with `distanceKm`.

### `GET /api/stores/:storeId`
Returns detailed store information including opening hours, delivery availability, and rating.

---

## 3. Categories & Products

### `GET /api/categories`
Returns all 10 product categories with aisle numbers.

### `GET /api/stores/:storeId/products`
Returns products available at the specified store, with store-specific price, discount %, and real-time inventory quantity.
- **Query Parameters:**
  - `categoryId` (optional)
  - `search` (optional)

### `GET /api/products/:productId`
Returns single product details with store context.

---

## 4. Shopping Basket (Cart)

### `GET /api/cart`
Returns current user's cart, items, subtotal, discount, delivery fee, and total amount.

### `POST /api/cart/items`
Adds an item to the basket. Validates single-store constraint and current stock.
- **Request Body:**
  ```json
  {
    "storeId": "store-1",
    "productId": "prod-1",
    "quantity": 2
  }
  ```

### `PATCH /api/cart/items/:itemId`
Updates item quantity in basket. Setting `quantity: 0` removes the item.

### `DELETE /api/cart/items/:itemId`
Removes specific item from basket.

### `DELETE /api/cart`
Clears entire basket (optional `newStoreId` query parameter).

---

## 5. Checkout & Orders

### `POST /api/checkout`
Places grocery order atomically. Verifies prices, deducts stock, and creates order record.
- **Request Body:**
  ```json
  {
    "customerName": "Jane Doe",
    "customerPhone": "+1 555-0199",
    "deliveryAddress": "Apt 4B, 350 Maple Avenue, Downtown Metro",
    "fulfilmentMethod": "DELIVERY",
    "paymentMethod": "DEMO_PAYMENT",
    "instructions": "Leave at front door"
  }
  ```
- **Response (201 Created):** Created `CustomerOrder` object with order number.

### `GET /api/orders`
Returns orders belonging to current authenticated customer.

### `GET /api/orders/:orderId`
Returns full order detail with purchased item snapshots and status timeline history.

### `POST /api/orders/:orderId/cancel`
Cancels order if in `PLACED` or `CONFIRMED` state. Automatically restores inventory in the supermarket.

---

## 6. Shop Owner Portal

### `GET /api/owner/dashboard`
Returns KPIs for the owner's assigned store (Gross Sales, Total Orders, Listed Products, Low-Stock items).

### `GET /api/owner/orders`
Returns customer orders placed at the owner's supermarket.

### `PATCH /api/owner/orders/:orderId/status`
Advances fulfillment status through valid state machine transitions:
- `PLACED` ➔ `CONFIRMED`
- `CONFIRMED` ➔ `PACKING`
- `PACKING` ➔ `OUT_FOR_DELIVERY` or `READY_FOR_PICKUP`
- `OUT_FOR_DELIVERY` / `READY_FOR_PICKUP` ➔ `DELIVERED`

### `PATCH /api/owner/inventory/:inventoryId`
Updates store product price, discount %, and available stock quantity.

---

## 7. Administrator Portal

### `GET /api/admin/dashboard`
Returns system-wide revenue, order status breakdown, and recent platform orders.

### `GET /api/admin/users`
Lists all registered platform accounts.

### `PATCH /api/admin/users/:userId/toggle`
Toggles user enabled/disabled state.

### `GET /api/admin/stores`
Lists all physical supermarkets.

### `PATCH /api/admin/stores/:storeId/toggle`
Activates or suspends a supermarket on the platform.
