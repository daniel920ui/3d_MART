-- ========================================================
-- NearMart 3D Initial Demo Seed Data
-- ========================================================

-- Users (BCrypt hashes for demo passwords)
INSERT INTO users (id, full_name, email, phone, password_hash, role, enabled) VALUES
('usr-customer-1', 'Jane Doe', 'customer@nearmart.com', '+1 555-0199', '$2a$10$wT0XkO057nK7xYvYp8ZcmeqA6lFvOqG8S8Q7U8D9V4J0K1L2M3N4O', 'CUSTOMER', TRUE),
('usr-owner-1', 'Marcus Vance', 'owner@freshmart.com', '+1 555-0144', '$2a$10$wT0XkO057nK7xYvYp8ZcmeqA6lFvOqG8S8Q7U8D9V4J0K1L2M3N4O', 'SHOP_OWNER', TRUE),
('usr-owner-2', 'Elena Rostova', 'owner@greengrocer.com', '+1 555-0188', '$2a$10$wT0XkO057nK7xYvYp8ZcmeqA6lFvOqG8S8Q7U8D9V4J0K1L2M3N4O', 'SHOP_OWNER', TRUE),
('usr-admin-1', 'Sarah Sterling', 'admin@nearmart.com', '+1 555-0100', '$2a$10$wT0XkO057nK7xYvYp8ZcmeqA6lFvOqG8S8Q7U8D9V4J0K1L2M3N4O', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Supermarkets
INSERT INTO supermarkets (id, name, description, address, locality, city, latitude, longitude, opening_hours, delivery_available, pickup_available, active, rating, review_count, image_url, min_order) VALUES
('store-1', 'FreshHarvest Organics & Market', 'Premier downtown marketplace specializing in farm-fresh produce, organic dairy, and artisan bakery delicacies.', '742 Evergreen Terrace, Downtown Metro', 'Downtown Metro', 'Metro City', 40.7580, -73.9855, '7:00 AM - 10:00 PM', TRUE, TRUE, TRUE, 4.8, 342, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80', 15.00),
('store-2', 'GreenGrocer HyperCity', 'Expansive family hypermarket featuring comprehensive household staples, bulk pantry grains, and imported gourmet goods.', '1204 Pinecrest Blvd, Greenfield Suburb', 'Greenfield Suburb', 'Metro City', 40.7484, -73.9857, '8:00 AM - 11:00 PM', TRUE, TRUE, TRUE, 4.7, 289, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', 20.00),
('store-3', 'DailyMart Express Supercenter', 'High-speed neighborhood grocery hub with fast 20-minute delivery, snacks, chilled beverages, and personal essentials.', '500 Innovation Way, Tech Park Avenue', 'Tech Park Avenue', 'Metro City', 40.7614, -73.9776, '6:30 AM - Midnight', TRUE, TRUE, TRUE, 4.9, 512, 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80', 10.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Owner Assignments
INSERT INTO store_owner_assignments (id, user_id, supermarket_id) VALUES
('soa-1', 'usr-owner-1', 'store-1'),
('soa-2', 'usr-owner-2', 'store-2')
ON DUPLICATE KEY UPDATE supermarket_id=VALUES(supermarket_id);

-- Categories
INSERT INTO categories (id, name, description, image_url, aisle_number, color, active) VALUES
('cat-1', 'Fruits', 'Orchard-fresh seasonal and exotic fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80', 1, '#ef4444', TRUE),
('cat-2', 'Vegetables', 'Crisp green farm produce & root vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80', 1, '#22c55e', TRUE),
('cat-3', 'Dairy Products', 'Fresh milk, butter, artisanal cheeses & yogurts', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=500&q=80', 2, '#38bdf8', TRUE),
('cat-4', 'Bakery', 'Warm oven sourdough, brioche, croissants & cakes', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80', 2, '#f59e0b', TRUE),
('cat-5', 'Rice and Grains', 'Basmati rice, whole grains, pulses & flours', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80', 3, '#eab308', TRUE),
('cat-6', 'Snacks', 'Chips, crackers, roasted nuts & savory crisps', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80', 3, '#f97316', TRUE),
('cat-7', 'Beverages', 'Fresh juices, cold brews, sodas & herbal teas', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80', 4, '#06b6d4', TRUE),
('cat-8', 'Frozen Foods', 'Frozen berries, ready meals, gelato & pizzas', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80', 4, '#6366f1', TRUE),
('cat-9', 'Personal Care', 'Soaps, organic shampoos, lotions & toothpastes', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80', 5, '#ec4899', TRUE),
('cat-10', 'Household Essentials', 'Eco laundry detergents, paper goods & surface sprays', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=500&q=80', 5, '#14b8a6', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Products (40 realistic grocery products across 5 aisles)
INSERT INTO products (id, name, brand, description, package_size, image_url, category_id, active, aisle, shelf_section, model_3d, color_3d) VALUES
('prod-1', 'Organic Honeycrisp Apples', 'Orchard Gold', 'Crisp, sweet, and bursting with cider-like crunch. Grown sustainably.', '1 kg (5-6 apples)', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80', 'cat-1', TRUE, 1, 'A', 'produce', '#dc2626'),
('prod-2', 'Cavendish Bananas', 'Tropical Sweet', 'Naturally ripened sweet yellow bananas. Rich in potassium.', '1 bunch (approx. 1.2 kg)', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80', 'cat-1', TRUE, 1, 'A', 'produce', '#eab308'),
('prod-3', 'Valencia Sweet Oranges', 'SunBurst Citrus', 'Juicy, sun-ripened Valencia oranges loaded with Vitamin C.', '1.5 kg Net Bag', 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=500&q=80', 'cat-1', TRUE, 1, 'A', 'produce', '#ea580c'),
('prod-4', 'Fresh Blueberries', 'BerryField Organics', 'Hand-picked plump sweet blueberries packed with natural antioxidants.', '250g Clamshell', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=500&q=80', 'cat-1', TRUE, 1, 'A', 'box', '#2563eb'),
('prod-5', 'Farm Fresh Hass Avocados', 'Valley Green', 'Creamy Hass avocados with rich nutty flavor, ideal for guacamole.', 'Pack of 3', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=500&q=80', 'cat-2', TRUE, 1, 'B', 'produce', '#15803d'),
('prod-6', 'Baby Spinach Leaves', 'Earth Harvest', 'Tender baby spinach leaves triple-washed and packed ready to enjoy.', '200g Tub', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80', 'cat-2', TRUE, 1, 'B', 'box', '#16a34a'),
('prod-7', 'Vine-Ripened Campari Tomatoes', 'RedGem Farms', 'Sweet, low-acid cluster tomatoes with rich deep aroma.', '500g Cluster', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80', 'cat-2', TRUE, 1, 'B', 'produce', '#ef4444'),
('prod-8', 'Crisp English Cucumbers', 'Valley Green', 'Seedless, thin-skinned English cucumbers with refreshing clean taste.', '2 pieces', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=500&q=80', 'cat-2', TRUE, 1, 'B', 'produce', '#22c55e'),
('prod-9', 'Organic Whole Milk 3.8%', 'Meadow Gold', 'Grade A pasteurized whole cow milk from pasture-raised cattle.', '1 Gallon (3.78 L)', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80', 'cat-3', TRUE, 2, 'A', 'carton', '#f8fafc'),
('prod-10', 'Salted European Grassfed Butter', 'AlpenPure', 'Churched rich cream butter with 82% butterfat and sea salt crystals.', '250g Block', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80', 'cat-3', TRUE, 2, 'A', 'box', '#fde047'),
('prod-11', 'Greek Yogurt Plain Whole Milk', 'Olympus Dairy', 'Traditional strained thick Greek yogurt with live active cultures.', '500g Tub', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80', 'cat-3', TRUE, 2, 'A', 'carton', '#bae6fd'),
('prod-12', 'Aged Sharp White Cheddar', 'Cabot Heritage', 'Naturally aged 18 months for a crumbly texture and bold flavor.', '200g Block', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=500&q=80', 'cat-3', TRUE, 2, 'A', 'box', '#fef08a'),
('prod-13', 'Artisan Rustic Sourdough Loaf', 'Hearth & Crumb', 'Slow-fermented wild yeast sourdough with golden caramelized crust.', '650g Whole Boule', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=500&q=80', 'cat-4', TRUE, 2, 'B', 'box', '#b45309'),
('prod-14', 'All-Butter French Croissants', 'Le Parisien', 'Flaky 64-layer laminated pastry made with cultured French butter.', 'Pack of 4 (320g)', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80', 'cat-4', TRUE, 2, 'B', 'box', '#d97706'),
('prod-15', 'Multi-Grain Seeded Bread', 'Nature Harvest', 'Wholesome loaf packed with sunflower, flax, and 12 whole grains.', '500g Sliced Loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80', 'cat-4', TRUE, 2, 'B', 'box', '#78350f'),
('prod-16', 'Double Fudge Chocolate Muffins', 'Baker Sweet', 'Decadent moist cocoa muffins studded with semi-sweet Belgian chocolate.', 'Pack of 4', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=500&q=80', 'cat-4', TRUE, 2, 'B', 'box', '#451a03'),
('prod-17', 'Aged Himalayan Basmati Rice', 'Royal Crown', 'Extra-long slender grain basmati aged 2 years for non-sticky fluffy texture.', '5 kg Bag', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80', 'cat-5', TRUE, 3, 'A', 'pouch', '#fef3c7'),
('prod-18', 'Organic Tricolor Quinoa', 'Andean Gold', 'Complete plant protein containing all 9 essential amino acids.', '750g Pouch', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80', 'cat-5', TRUE, 3, 'A', 'pouch', '#ca8a04'),
('prod-19', 'Rolled Whole Grain Oats', 'Morning Hearth', '100% whole grain oat flakes for creamy porridge and baking.', '1 kg Tub', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=80', 'cat-5', TRUE, 3, 'A', 'box', '#a16207'),
('prod-20', 'Organic Whole Wheat Flour', 'Stone Mill Co.', 'Stone ground unbleached whole wheat flour maintaining germ and bran.', '2 kg Bag', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80', 'cat-5', TRUE, 3, 'A', 'pouch', '#854d0e'),
('prod-21', 'Kettle Cooked Sea Salt Chips', 'Cape Harbor', 'Batch-cooked thick cut potato chips crisped in pure sunflower oil.', '180g Bag', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80', 'cat-6', TRUE, 3, 'B', 'pouch', '#f59e0b'),
('prod-22', 'Roasted California Pistachios', 'SunValley Nut Co.', 'Premium dry-roasted pistachios in open shells with satisfying crunch.', '350g Bag', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=500&q=80', 'cat-6', TRUE, 3, 'B', 'pouch', '#65a30d'),
('prod-23', 'Multigrain Tortilla Chips', 'Cantina Fiesta', 'Crispy stone-ground corn chips crafted with chia, flax, and sesame.', '250g Bag', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80', 'cat-6', TRUE, 3, 'B', 'pouch', '#d97706'),
('prod-24', 'Dark Chocolate Almond Bites', 'Pure Energy', 'Cold-pressed dates, roasted almonds, dark chocolate chips, and sea salt.', '150g Pouch', 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=500&q=80', 'cat-6', TRUE, 3, 'B', 'pouch', '#3b0764'),
('prod-25', 'Cold Pressed Orange Ginger Juice', 'Vitality Roots', '100% raw juice with sweet Valencia oranges and fiery ginger kick.', '1 Liter Bottle', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80', 'cat-7', TRUE, 4, 'A', 'bottle', '#ea580c'),
('prod-26', 'Sparkling Mineral Water Lemon Lime', 'Alps Springs', 'Effervescent volcanic spring water lightly infused with citrus.', '6 x 330ml Cans', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80', 'cat-7', TRUE, 4, 'A', 'can', '#10b981'),
('prod-27', 'Ethiopian Cold Brew Coffee', 'Black Roast Lab', 'Smooth, 18-hour cold steeped single-origin coffee with floral notes.', '500ml Glass Bottle', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80', 'cat-7', TRUE, 4, 'A', 'bottle', '#292524'),
('prod-28', 'Organic Ceremonial Matcha', 'Zen Garden', 'Ceremonial grade Uji Japanese matcha powder rich in L-theanine.', '100g Tin', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80', 'cat-7', TRUE, 4, 'A', 'can', '#84cc16'),
('prod-29', 'Artisan Margherita Pizza', 'Napoli Cucina', 'Flash-frozen pizza with San Marzano tomatoes, mozzarella, and basil.', '420g Box', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', 'cat-8', TRUE, 4, 'B', 'box', '#e11d48'),
('prod-30', 'Frozen Triple Berry Medley', 'FrostPeak Berries', 'Raspberries, blackberries, and wild blueberries flash frozen.', '600g Bag', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80', 'cat-8', TRUE, 4, 'B', 'pouch', '#701a75'),
('prod-31', 'Madagascar Vanilla Gelato', 'Dolce Gusto', 'Velvety slow-churned whole cream gelato infused with vanilla bean.', '473ml Pint', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=500&q=80', 'cat-8', TRUE, 4, 'B', 'carton', '#fef3c7'),
('prod-32', 'Edamame in Pods with Sea Salt', 'Tokyo Garden', 'Young soybeans harvested green, steam-blanched and flash frozen.', '400g Bag', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80', 'cat-8', TRUE, 4, 'B', 'pouch', '#4ade80'),
('prod-33', 'Botanical Lavender Body Wash', 'NaturaCare', 'Sulfate-free hydrating body wash with French lavender and aloe vera.', '500ml Pump Bottle', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80', 'cat-9', TRUE, 5, 'A', 'bottle', '#a855f7'),
('prod-34', 'Herbal Peppermint Toothpaste', 'EcoDent', 'Natural enamel-safe whitening toothpaste formulated with wild mint.', '120g Tube', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80', 'cat-9', TRUE, 5, 'A', 'box', '#14b8a6'),
('prod-35', 'Argan Oil Moisturizing Shampoo', 'Moroccan Glow', 'Nourishing cold-pressed argan oil shampoo that softens dry hair.', '400ml Bottle', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80', 'cat-9', TRUE, 5, 'A', 'bottle', '#b45309'),
('prod-36', 'Facial Mineral Sunscreen SPF 50', 'Solar Shield', 'Broad spectrum UVA/UVB mineral zinc sunscreen with matte finish.', '85ml Tube', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80', 'cat-9', TRUE, 5, 'A', 'bottle', '#fbbf24'),
('prod-37', 'Plant-Based Laundry Detergent', 'GreenClean Co.', 'Concentrated liquid laundry wash made from plant surfactants. 64 loads.', '1.89 L Jug', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=500&q=80', 'cat-10', TRUE, 5, 'B', 'bottle', '#8b5cf6'),
('prod-38', 'Eco Bamboo 3-Ply Bathroom Rolls', 'PureBreeze', '100% sustainable unbleached bamboo pulp. Ultra-soft and septic safe.', 'Pack of 12 Rolls', 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=500&q=80', 'cat-10', TRUE, 5, 'B', 'box', '#f3f4f6'),
('prod-39', 'Citrus Multi-Surface Cleaning Spray', 'CleanSphere', 'Non-toxic disinfectant spray with genuine grapefruit essential oils.', '750ml Spray Bottle', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80', 'cat-10', TRUE, 5, 'B', 'bottle', '#f97316'),
('prod-40', 'Concentrated Dishwashing Liquid', 'SparkleBio', 'Grease-cutting biodegradable dish soap with gentle aloe vera.', '650ml Bottle', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80', 'cat-10', TRUE, 5, 'B', 'bottle', '#eab308')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Store Inventories for Store 1 (FreshHarvest Organics)
INSERT INTO store_inventories (id, supermarket_id, productId, price, discount_percentage, stock_quantity, low_stock_threshold, available) VALUES
('inv-store-1-prod-1', 'store-1', 'prod-1', 4.71, 0, 32, 5, TRUE),
('inv-store-1-prod-2', 'store-1', 'prod-2', 2.40, 0, 45, 5, TRUE),
('inv-store-1-prod-3', 'store-1', 'prod-3', 5.76, 15, 28, 5, TRUE),
('inv-store-1-prod-4', 'store-1', 'prod-4', 4.19, 0, 3, 5, TRUE), -- Low stock alert!
('inv-store-1-prod-5', 'store-1', 'prod-5', 5.24, 0, 22, 5, TRUE),
('inv-store-1-prod-6', 'store-1', 'prod-6', 3.03, 10, 18, 5, TRUE),
('inv-store-1-prod-7', 'store-1', 'prod-7', 3.66, 15, 30, 5, TRUE),
('inv-store-1-prod-8', 'store-1', 'prod-8', 2.30, 0, 26, 5, TRUE),
('inv-store-1-prod-9', 'store-1', 'prod-9', 5.03, 0, 40, 5, TRUE),
('inv-store-1-prod-10', 'store-1', 'prod-10', 4.50, 0, 35, 5, TRUE),
('inv-store-1-prod-11', 'store-1', 'prod-11', 4.19, 15, 20, 5, TRUE),
('inv-store-1-prod-12', 'store-1', 'prod-12', 6.29, 0, 25, 5, TRUE),
('inv-store-1-prod-13', 'store-1', 'prod-13', 5.76, 0, 15, 5, TRUE),
('inv-store-1-prod-14', 'store-1', 'prod-14', 5.24, 0, 18, 5, TRUE),
('inv-store-1-prod-15', 'store-1', 'prod-15', 4.08, 15, 24, 5, TRUE),
('inv-store-1-prod-16', 'store-1', 'prod-16', 4.82, 0, 16, 5, TRUE),
('inv-store-1-prod-17', 'store-1', 'prod-17', 15.74, 0, 20, 5, TRUE),
('inv-store-1-prod-18', 'store-1', 'prod-18', 7.86, 0, 22, 5, TRUE),
('inv-store-1-prod-19', 'store-1', 'prod-19', 5.24, 15, 30, 5, TRUE),
('inv-store-1-prod-20', 'store-1', 'prod-20', 5.55, 0, 19, 5, TRUE),
('inv-store-1-prod-21', 'store-1', 'prod-21', 3.66, 0, 28, 5, TRUE),
('inv-store-1-prod-22', 'store-1', 'prod-22', 9.44, 10, 15, 5, TRUE),
('inv-store-1-prod-23', 'store-1', 'prod-23', 4.19, 15, 22, 5, TRUE),
('inv-store-1-prod-24', 'store-1', 'prod-24', 6.81, 0, 26, 5, TRUE),
('inv-store-1-prod-25', 'store-1', 'prod-25', 5.24, 0, 24, 5, TRUE),
('inv-store-1-prod-26', 'store-1', 'prod-26', 6.29, 0, 32, 5, TRUE),
('inv-store-1-prod-27', 'store-1', 'prod-27', 5.03, 15, 20, 5, TRUE),
('inv-store-1-prod-28', 'store-1', 'prod-28', 17.84, 0, 12, 5, TRUE),
('inv-store-1-prod-29', 'store-1', 'prod-29', 8.91, 0, 14, 5, TRUE),
('inv-store-1-prod-30', 'store-1', 'prod-30', 6.29, 10, 18, 5, TRUE),
('inv-store-1-prod-31', 'store-1', 'prod-31', 6.60, 15, 16, 5, TRUE),
('inv-store-1-prod-32', 'store-1', 'prod-32', 3.35, 0, 25, 5, TRUE),
('inv-store-1-prod-33', 'store-1', 'prod-33', 9.44, 0, 22, 5, TRUE),
('inv-store-1-prod-34', 'store-1', 'prod-34', 4.71, 0, 30, 5, TRUE),
('inv-store-1-prod-35', 'store-1', 'prod-35', 10.49, 15, 18, 5, TRUE),
('inv-store-1-prod-36', 'store-1', 'prod-36', 15.21, 0, 20, 5, TRUE),
('inv-store-1-prod-37', 'store-1', 'prod-37', 13.64, 0, 16, 5, TRUE),
('inv-store-1-prod-38', 'store-1', 'prod-38', 9.96, 10, 25, 5, TRUE),
('inv-store-1-prod-39', 'store-1', 'prod-39', 5.24, 15, 28, 5, TRUE),
('inv-store-1-prod-40', 'store-1', 'prod-40', 3.98, 0, 35, 5, TRUE)
ON DUPLICATE KEY UPDATE price=VALUES(price), stock_quantity=VALUES(stock_quantity);

-- Sample Initial Orders
INSERT INTO customer_orders (id, order_number, user_id, supermarket_id, customer_name, customer_phone, delivery_address, subtotal, discount_amount, delivery_fee, total_amount, payment_method, payment_status, order_status, fulfilment_method, instructions) VALUES
('ord-1001', 'NM-2026-88101', 'usr-customer-1', 'store-1', 'Jane Doe', '+1 555-0199', 'Apt 4B, 350 Maple Avenue, Downtown Metro', 39.45, 4.50, 0.00, 34.95, 'DEMO_PAYMENT', 'PAID', 'DELIVERED', 'DELIVERY', 'Ring buzzer #402 please.'),
('ord-1002', 'NM-2026-88102', 'usr-customer-1', 'store-1', 'Jane Doe', '+1 555-0199', 'Apt 4B, 350 Maple Avenue, Downtown Metro', 28.50, 2.00, 4.99, 31.49, 'CASH_ON_DELIVERY', 'PENDING', 'PACKING', 'DELIVERY', 'Please call when arriving at front lobby.'),
('ord-1003', 'NM-2026-88103', 'usr-customer-1', 'store-2', 'Jane Doe', '+1 555-0199', 'Curbside Express Pickup Bay #3', 52.80, 5.00, 0.00, 47.80, 'DEMO_PAYMENT', 'PAID', 'PLACED', 'PICKUP', 'Blue Honda Civic waiting in bay.')
ON DUPLICATE KEY UPDATE order_number=VALUES(order_number);
