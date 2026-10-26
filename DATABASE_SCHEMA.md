# NearMart 3D — Database Architecture & Schema Documentation

The NearMart 3D relational database is normalized and enforces data integrity across users, store assignments, catalog definitions, store-isolated inventory, baskets, and atomic orders.

---

## Entity Relationship Overview

```
[ users ] <── (1:N) ── [ addresses ]
   │
   ├── (1:N) ── [ store_owner_assignments ] ── (N:1) ── [ supermarkets ]
   │                                                           │
   ├── (1:1) ── [ carts ] ── (1:N) ── [ cart_items ]           │
   │                                                           │
   └── (1:N) ── [ customer_orders ]                            │
                      │                                        │
                      ├── (1:N) ── [ order_items ]             │
                      ├── (1:1) ── [ payments ]                │
                      └── (1:N) ── [ order_status_history ]    │
                                                               │
[ categories ] <── (1:N) ── [ products ]                      │
                                │                              │
                                └── (N:M via store_inventories)┘
```

---

## 14 Core Entities

### 1. `users`
Stores customer, shop owner, and administrator accounts.
- `id` (PK, VARCHAR 64)
- `full_name` (VARCHAR 120)
- `email` (VARCHAR 160, UNIQUE, indexed)
- `phone` (VARCHAR 30)
- `password_hash` (VARCHAR 255)
- `role` (VARCHAR 30): `CUSTOMER`, `SHOP_OWNER`, `ADMIN`
- `enabled` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 2. `addresses`
Delivery locations saved by customers.
- `id` (PK)
- `user_id` (FK to `users.id`)
- `address_line`, `locality`, `city`, `state`, `postal_code`
- `latitude`, `longitude` (DECIMAL for distance calculations)

### 3. `supermarkets`
Physical grocery supermarkets listed on the platform.
- `id` (PK)
- `name` (VARCHAR 160)
- `description` (TEXT)
- `address`, `locality`, `city`
- `latitude`, `longitude` (DECIMAL)
- `opening_hours` (VARCHAR 100)
- `delivery_available`, `pickup_available` (BOOLEAN)
- `active` (BOOLEAN)
- `rating` (DECIMAL 2,1), `review_count` (INT)
- `min_order` (DECIMAL 10,2)

### 4. `store_owner_assignments`
Maps merchant accounts to their designated supermarket. Enforces single-store authorization for shop owners.
- `id` (PK)
- `user_id` (FK to `users.id`)
- `supermarket_id` (FK to `supermarkets.id`)
- `UNIQUE KEY uq_owner_store (user_id, supermarket_id)`

### 5. `categories`
Aisle grocery classifications.
- `id` (PK)
- `name` (VARCHAR 100)
- `aisle_number` (INT: 1 to 5 for 3D navigation)
- `color` (VARCHAR 20)
- `active` (BOOLEAN)

### 6. `products`
Master catalog of grocery items.
- `id` (PK)
- `name`, `brand`, `description`, `package_size`
- `image_url`
- `category_id` (FK to `categories.id`)
- `aisle` (INT), `shelf_section` (VARCHAR 5: A, B, C)
- `model_3d` (produce, box, bottle, can, carton, pouch)
- `color_3d` (hex color for 3D rendering)

### 7. `store_inventories`
**Store-specific pricing and stock isolation.**
- `id` (PK)
- `supermarket_id` (FK to `supermarkets.id`)
- `product_id` (FK to `products.id`)
- `price` (DECIMAL 10,2)
- `discount_percentage` (INT)
- `stock_quantity` (INT, prevents negative overselling)
- `low_stock_threshold` (INT default 5)
- `available` (BOOLEAN)
- `UNIQUE KEY uq_store_product (supermarket_id, product_id)`

### 8. `carts`
Customer active basket.
- `id` (PK)
- `user_id` (FK to `users.id`, UNIQUE)
- `supermarket_id` (FK to `supermarkets.id` - enforces single-store basket rule)

### 9. `cart_items`
- `id` (PK)
- `cart_id` (FK to `carts.id`)
- `product_id` (FK to `products.id`)
- `quantity` (INT)

### 10. `customer_orders`
- `id` (PK)
- `order_number` (VARCHAR 60, UNIQUE)
- `user_id` (FK to `users.id`)
- `supermarket_id` (FK to `supermarkets.id`)
- `customer_name`, `customer_phone`, `delivery_address`
- `subtotal`, `discount_amount`, `delivery_fee`, `total_amount` (DECIMAL 10,2)
- `payment_method` (`DEMO_PAYMENT`, `CASH_ON_DELIVERY`, `ONLINE`)
- `payment_status` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`)
- `order_status` (`PLACED`, `CONFIRMED`, `PACKING`, `OUT_FOR_DELIVERY`, `READY_FOR_PICKUP`, `DELIVERED`, `CANCELLED`)
- `fulfilment_method` (`DELIVERY`, `PICKUP`)

### 11. `order_items`
Historical purchase snapshot preventing changes to completed orders if catalog prices update.
- `id` (PK)
- `order_id` (FK to `customer_orders.id`)
- `product_id` (FK to `products.id`)
- `product_name_snapshot`, `brand_snapshot`, `unit_price_snapshot`, `quantity`, `line_total`, `image_url_snapshot`

### 12. `payments`
- `id` (PK), `order_id` (FK), `provider`, `provider_reference`, `amount`, `status`

### 13. `inventory_transactions`
Audit trail of stock adjustments and order deductions/restorations.
- `id` (PK), `supermarket_id`, `product_id`, `quantity_change`, `reason`

### 14. `order_status_history`
Timeline milestone tracking.
- `id` (PK), `order_id`, `previous_status`, `new_status`, `changed_by`, `note`
