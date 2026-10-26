# NearMart 3D — Interactive Virtual Supermarket & Local Grocery Marketplace

> **Tagline:** "Step Inside. Shop Smarter."  
> **Academic Level:** Final-Year Engineering Capstone / B.Tech Computer Science Project

NearMart 3D is a full-stack, responsive web application and 3D virtual grocery shopping platform. It transforms traditional online grocery ordering into an immersive 3D supermarket experience while integrating neighborhood physical supermarkets with live inventory, store-specific pricing, and atomic stock reservation.

---

## 🚀 Key Features

### 🛒 Customer-Facing Features
1. **Interactive 3D Virtual Supermarket:**
   - Navigable supermarket with 5 aisles (Fresh Produce, Dairy & Bakery, Rice & Grains, Beverages & Frozen, Personal Care & Home).
   - Realistic 3D shelving racks, category signage, fluorescent lighting, and checkout conveyor belts.
   - Dual controls: Desktop (WASD / arrow keys + mouse look + reticle) and Mobile (virtual touch controller + turn buttons).
   - Direct shelf raycasting: click/tap any 3D item to open an interactive product inspection card and add to basket.
   - Teleport Minimap / Aisle Navigation Bar for instant jumping between aisles.
   - Graceful fallback toggle to a responsive 2D catalog.
2. **Nearby Supermarket Discovery:**
   - Search by store name and filter by neighborhood locality.
   - GPS coordinate distance calculations (Haversine formula).
   - Store cards with ratings, operating hours, delivery & curbside pickup badges, and minimum order rules.
3. **Store-Specific Product Catalog:**
   - Over 40 grocery items with high-res images, brand information, and package specs.
   - Store-specific pricing and isolated inventory (different stores have their own prices, discounts, and stock levels).
4. **Single-Store Cart Rule with Conflict Modal:**
   - Real-world multi-store basket management: prompts the user before switching stores to prevent multi-store delivery conflicts.
   - Subtotal, store discounts, and free delivery progress indicator ($35 threshold).
5. **Checkout & Atomic Stock Validation:**
   - Home delivery vs. curbside pickup selection.
   - Instant Demo Payment channel (simulated instant authorization for college presentation) and Cash on Delivery.
   - Atomic server-side stock reduction and prevent overselling.
6. **Order Tracking & Fulfillment Milestones:**
   - Status timeline: `PLACED` ➔ `CONFIRMED` ➔ `PACKING` ➔ `OUT_FOR_DELIVERY` / `READY_FOR_PICKUP` ➔ `DELIVERED`.
   - Customer order cancellation (permitted in `PLACED` and `CONFIRMED` states) with automatic inventory restoration.

### 🏪 Shop Owner Dashboard
- Assigned store overview: Recorded Sales, Order Count, Listed Products, and Low-Stock Alerts.
- Order Management: advance orders through fulfillment stages, view customer delivery notes and contacts.
- Inventory & Price Management: inline editing of product prices, discount percentages, and stock quantities with immediate server synchronization.

### 🛡️ Administrator Dashboard
- System telemetry: platform gross revenue, order status breakdown, registered customer and merchant counts.
- Supermarket Management: activate or deactivate supermarket partner stores.
- User Access Control: inspect accounts and toggle enabled/disabled status.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Three.js, Tailwind CSS, Lucide Icons |
| **Active Live Runtime** | Node.js, Express, Vite middleware (`server.ts` on port 3000) |
| **Academic Backend** | Java 17, Spring Boot 3.2.4, Spring Data JPA, Spring Security, JWT, Maven |
| **Database** | MySQL 8.0+ (Normalized schema with 14 entities and relational constraints) |
| **Testing** | Node.js built-in test runner (`node:test`, `node:assert/strict`) & Playwright CLI |

---

## 📂 Project Structure

```
├── backend-spring-boot/              # Java Spring Boot & MySQL project (for IntelliJ / Maven)
│   ├── pom.xml                       # Maven dependencies (Web, Data JPA, Security, JWT, MySQL)
│   └── src/
│       └── main/
│           ├── java/com/nearmart/
│           │   ├── NearMartApplication.java
│           │   ├── model/            # JPA entities (User, Supermarket, Product, Order, Inventory)
│           │   └── security/         # Spring Security & JWT Filter config
│           └── resources/
│               ├── application.properties
│               ├── schema.sql        # MySQL DDL for all 14 tables
│               └── data.sql          # Seed data for demo
├── server/                           # Full-stack Node/Express REST backend (active container)
│   ├── types.ts                      # Backend TypeScript types
│   ├── data.ts                       # Initial supermarket, category, product & order seeds
│   └── store.ts                      # In-memory transactional store with atomic checkout
├── src/                              # React frontend
│   ├── components/
│   │   ├── Supermarket3D.tsx         # Interactive Three.js virtual supermarket
│   │   ├── Navbar.tsx                # Responsive header with search & locality picker
│   │   ├── StoreCard.tsx             # Supermarket card with delivery & 3D triggers
│   │   ├── ProductCard.tsx           # Grocery product card with stepper
│   │   ├── ProductDetailModal.tsx    # Detailed specs & store pricing modal
│   │   ├── CartDrawer.tsx            # Slide-over cart with free shipping bar
│   │   ├── ConflictModal.tsx         # Single-store basket conflict resolver
│   │   ├── CheckoutModal.tsx         # Delivery details & payment selection
│   │   ├── OrderHistoryView.tsx      # Milestone status timeline & cancellation
│   │   ├── OwnerDashboardView.tsx    # Merchant portal (status advancement & inventory)
│   │   ├── AdminDashboardView.tsx    # Administrator platform oversight
│   │   ├── DemoBar.tsx               # Quick evaluator role switcher
│   │   └── Footer.tsx                # Academic capstone footer
│   ├── context/                      # AuthContext & CartContext
│   ├── services/api.ts               # REST API client
│   └── utils/groceryLogic.ts         # Pure business logic (pricing, distance, rules)
├── server.ts                         # Express server with Vite middleware mount
└── package.json
```

---

## 🔑 Demo Accounts (Pre-Seeded)

The top **College Demo Bar** lets you switch personas in 1 click, or you can log in with:

| Persona | Email | Password | Assigned Store / Privileges |
|---|---|---|---|
| **Customer** | `customer@nearmart.com` | `Customer@123` | Browsing, 3D shopping, checkout, order tracking |
| **Shop Owner** | `owner@freshmart.com` | `Owner@123` | FreshHarvest Organics (orders, pricing, stock) |
| **Administrator** | `admin@nearmart.com` | `Admin@123` | Platform revenue, store toggle, user permissions |

---

## 🏃 Quick Start Guide

### 1. Running the Live Application (Current Web App)
```bash
# Install dependencies
npm install

# Start the dev server (Node.js + Express + Vite on port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 2. Running the Pure Logic Unit Tests
```bash
npx --yes tsx --test src/utils/groceryLogic.test.ts
```

### 3. Setting Up the Spring Boot Backend (IntelliJ IDEA / Maven)
1. Ensure **Java 17+** and **MySQL 8.0+** are installed.
2. In MySQL, run the schema script:
   ```bash
   mysql -u root -p < backend-spring-boot/src/main/resources/schema.sql
   mysql -u root -p nearmart_db < backend-spring-boot/src/main/resources/data.sql
   ```
3. Open `backend-spring-boot` in IntelliJ IDEA or your preferred Java IDE.
4. Verify database credentials in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/nearmart_db
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
5. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on port `8080`.

---

## 📜 API Documentation & Database Reference
- Detailed REST API specification is documented in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).
- Normalized database schema and entity relationship details are documented in [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).
- Postman Collection is available in [`NearMart_3D_Postman_Collection.json`](./NearMart_3D_Postman_Collection.json).
