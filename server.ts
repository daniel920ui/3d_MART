import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { nearMartStore } from './server/store';
import { OrderStatus } from './src/utils/groceryLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Comprehensive CORS and Preflight handler for AI Studio iframe environment
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });
  const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required.' });
      return;
    }

    // Demo token format: "token-<userId>-<role>"
    try {
      if (token.startsWith('token-')) {
        const parts = token.split('-');
        const userId = parts.slice(1, -1).join('-');
        const user = nearMartStore.findUserById(userId);
        if (!user || !user.enabled) {
          res.status(403).json({ error: 'User is disabled or does not exist.' });
          return;
        }
        (req as any).user = user;
        next();
        return;
      }

      // Fallback: check if matches user id directly
      const user = nearMartStore.findUserById(token);
      if (user && user.enabled) {
        (req as any).user = user;
        next();
        return;
      }

      res.status(403).json({ error: 'Invalid authentication token.' });
    } catch (err) {
      res.status(403).json({ error: 'Token verification failed.' });
    }
  };

  const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions for this action.' });
        return;
      }
      next();
    };
  };

  // ==================== REST API ENDPOINTS ====================

  // --- 1. Authentication ---
  app.post('/api/auth/register', (req: Request, res: Response): void => {
    try {
      const { fullName, email, phone, password, role } = req.body;
      if (!fullName || !email || !password) {
        res.status(400).json({ error: 'Full name, email, and password are required.' });
        return;
      }
      const user = nearMartStore.registerUser({
        fullName,
        email,
        phone: phone || '',
        password,
        role: role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER', // prevent direct admin registration
      });

      const token = `token-${user.id}-${user.role}`;
      res.status(201).json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response): void => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const user = nearMartStore.findUserByEmail(email);
      if (!user || user.passwordHash !== password) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      if (!user.enabled) {
        res.status(403).json({ error: 'Your account has been deactivated by the administrator.' });
        return;
      }

      const token = `token-${user.id}-${user.role}`;
      res.json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: Request, res: Response): void => {
    const user = (req as any).user;
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  });

  // --- 2. Supermarkets ---
  app.get('/api/stores', (req: Request, res: Response): void => {
    const locality = req.query.locality as string | undefined;
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const stores = nearMartStore.getSupermarkets(locality, lat, lon);
    res.json(stores);
  });

  app.get('/api/stores/:storeId', (req: Request, res: Response): void => {
    const store = nearMartStore.getSupermarketById(req.params.storeId);
    if (!store) {
      res.status(404).json({ error: 'Supermarket not found.' });
      return;
    }
    res.json(store);
  });

  // --- 3. Categories & Products ---
  app.get('/api/categories', (req: Request, res: Response): void => {
    res.json(nearMartStore.getCategories());
  });

  app.get('/api/stores/:storeId/products', (req: Request, res: Response): void => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const search = req.query.search as string | undefined;
      const products = nearMartStore.getProductsForStore(
        req.params.storeId,
        categoryId,
        search
      );
      res.json(products);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.get('/api/products/:productId', (req: Request, res: Response): void => {
    const storeId = req.query.storeId as string | undefined;
    const product = nearMartStore.getProductById(req.params.productId, storeId);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json(product);
  });

  // --- 4. Cart ---
  app.get('/api/cart', authenticateToken, (req: Request, res: Response): void => {
    const user = (req as any).user;
    const cart = nearMartStore.getUserCart(user.id);
    res.json(cart);
  });

  app.post('/api/cart/items', authenticateToken, (req: Request, res: Response): void => {
    try {
      const user = (req as any).user;
      const { storeId, productId, quantity } = req.body;
      if (!storeId || !productId || !quantity) {
        res.status(400).json({ error: 'StoreId, productId, and quantity are required.' });
        return;
      }
      const updatedCart = nearMartStore.addToCart(
        user.id,
        storeId,
        productId,
        parseInt(quantity, 10)
      );
      res.json(updatedCart);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/cart/items/:itemId', authenticateToken, (req: Request, res: Response): void => {
    try {
      const user = (req as any).user;
      const { quantity } = req.body;
      const updatedCart = nearMartStore.updateCartItem(
        user.id,
        req.params.itemId,
        parseInt(quantity, 10)
      );
      res.json(updatedCart);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/cart/items/:itemId', authenticateToken, (req: Request, res: Response): void => {
    const user = (req as any).user;
    const updatedCart = nearMartStore.removeCartItem(user.id, req.params.itemId);
    res.json(updatedCart);
  });

  app.delete('/api/cart', authenticateToken, (req: Request, res: Response): void => {
    const user = (req as any).user;
    const newStoreId = req.query.newStoreId as string | undefined;
    const clearedCart = nearMartStore.clearCart(user.id, newStoreId);
    res.json(clearedCart);
  });

  // --- 5. Checkout & Orders ---
  app.post('/api/checkout', authenticateToken, (req: Request, res: Response): void => {
    try {
      const user = (req as any).user;
      const { customerName, customerPhone, deliveryAddress, fulfilmentMethod, paymentMethod, instructions } = req.body;

      if (!customerName || !customerPhone || !deliveryAddress) {
        res.status(400).json({ error: 'Customer name, phone, and delivery address are required.' });
        return;
      }

      const order = nearMartStore.checkout({
        userId: user.id,
        customerName,
        customerPhone,
        deliveryAddress,
        fulfilmentMethod: fulfilmentMethod === 'PICKUP' ? 'PICKUP' : 'DELIVERY',
        paymentMethod: paymentMethod || 'DEMO_PAYMENT',
        instructions,
      });

      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/orders', authenticateToken, (req: Request, res: Response): void => {
    const user = (req as any).user;
    const orders = nearMartStore.getUserOrders(user.id);
    res.json(orders);
  });

  app.get('/api/orders/:orderId', authenticateToken, (req: Request, res: Response): void => {
    const order = nearMartStore.getOrderDetails(req.params.orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json(order);
  });

  app.post('/api/orders/:orderId/cancel', authenticateToken, (req: Request, res: Response): void => {
    try {
      const user = (req as any).user;
      const updatedOrder = nearMartStore.cancelOrder(req.params.orderId, user.id);
      res.json(updatedOrder);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- 6. Shop Owner Endpoints ---
  app.get(
    '/api/owner/dashboard',
    authenticateToken,
    requireRole(['SHOP_OWNER', 'ADMIN']),
    (req: Request, res: Response): void => {
      try {
        const user = (req as any).user;
        const metrics = nearMartStore.getOwnerDashboardMetrics(user.id);
        res.json(metrics);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.get(
    '/api/owner/orders',
    authenticateToken,
    requireRole(['SHOP_OWNER', 'ADMIN']),
    (req: Request, res: Response): void => {
      const user = (req as any).user;
      const orders = nearMartStore.getOwnerOrders(user.id);
      res.json(orders);
    }
  );

  app.patch(
    '/api/owner/orders/:orderId/status',
    authenticateToken,
    requireRole(['SHOP_OWNER', 'ADMIN']),
    (req: Request, res: Response): void => {
      try {
        const user = (req as any).user;
        const { status, note } = req.body;
        const updated = nearMartStore.updateOrderStatus(
          user.id,
          req.params.orderId,
          status as OrderStatus,
          note
        );
        res.json(updated);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.patch(
    '/api/owner/inventory/:inventoryId',
    authenticateToken,
    requireRole(['SHOP_OWNER', 'ADMIN']),
    (req: Request, res: Response): void => {
      try {
        const user = (req as any).user;
        const { price, discountPercentage, stockQuantity } = req.body;
        const updated = nearMartStore.updateInventoryItem(user.id, req.params.inventoryId, {
          price: price !== undefined ? parseFloat(price) : undefined,
          discountPercentage:
            discountPercentage !== undefined ? parseInt(discountPercentage, 10) : undefined,
          stockQuantity:
            stockQuantity !== undefined ? parseInt(stockQuantity, 10) : undefined,
        });
        res.json(updated);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  // --- 7. Admin Endpoints ---
  app.get(
    '/api/admin/dashboard',
    authenticateToken,
    requireRole(['ADMIN']),
    (req: Request, res: Response): void => {
      res.json(nearMartStore.getAdminDashboard());
    }
  );

  app.get(
    '/api/admin/users',
    authenticateToken,
    requireRole(['ADMIN']),
    (req: Request, res: Response): void => {
      res.json(nearMartStore.getAllUsers());
    }
  );

  app.patch(
    '/api/admin/users/:userId/toggle',
    authenticateToken,
    requireRole(['ADMIN']),
    (req: Request, res: Response): void => {
      try {
        const updated = nearMartStore.toggleUserEnabled(req.params.userId);
        res.json(updated);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.get(
    '/api/admin/stores',
    authenticateToken,
    requireRole(['ADMIN']),
    (req: Request, res: Response): void => {
      res.json(nearMartStore.getAllStores());
    }
  );

  app.patch(
    '/api/admin/stores/:storeId/toggle',
    authenticateToken,
    requireRole(['ADMIN']),
    (req: Request, res: Response): void => {
      try {
        const updated = nearMartStore.toggleStoreActive(req.params.storeId);
        res.json(updated);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  // --- 8. Payment Gateway Demo & Webhook ---
  app.post('/api/payments/create', authenticateToken, (req: Request, res: Response): void => {
    const { amount, currency } = req.body;
    res.json({
      success: true,
      transactionId: `tx-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      amount: amount || 0,
      currency: currency || 'USD',
      mode: 'SIMULATED_DEMO',
      gateway: 'NearMart Pay Secure (Simulated)',
      message: 'Simulated payment channel created for college demonstration.',
    });
  });

  app.post('/api/payments/verify', authenticateToken, (req: Request, res: Response): void => {
    const { transactionId, orderId } = req.body;
    res.json({
      verified: true,
      transactionId,
      orderId,
      status: 'CAPTURED',
      timestamp: new Date().toISOString(),
    });
  });

  // --- 9. Vite Middleware for SPA Frontend ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NearMart 3D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
