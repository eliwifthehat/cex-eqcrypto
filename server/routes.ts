import express, { Express, Request } from "express";
import { createServer, Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { userStorage } from "./userStorage";
import { insertUserOrderSchema, insertUserTradeSchema, userProfiles } from "../shared/schema";
import { estimateFillTime, calculateMarketConditions } from "../client/src/lib/fillTimeEstimator";
import { eq } from "drizzle-orm";
import { db } from "./db";
import logger, { logUserActivity, logDatabase, logPerformance } from "./logger";
import { apiKeyManager } from "./api-key-manager";
import { validateApiKey, requirePermissions, AuthenticatedRequest } from "./api-key-middleware";
import { validate, validationChains } from "./validation-middleware";
import { validateSession, sessionUtils } from "./session-config";
import { cacheManager, cacheMiddleware, CacheType, cacheUtils } from "./cache-config";

// Extend Request type to include session
interface RequestWithSession extends Request {
  session: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // WebSocket connection management
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const userId = req.url?.split('?userId=')[1];
    if (userId) {
      clients.set(userId, ws);
      logUserActivity(userId, 'websocket_connected', {
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
      logger.info(`User ${userId} connected to WebSocket`);
    }

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        logUserActivity(userId, 'websocket_disconnected');
        logger.info(`User ${userId} disconnected from WebSocket`);
      }
    });
  });

  // Function to notify user about order status changes
  const notifyOrderStatusChange = (userId: string, orderData: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify({
        type: 'order_status_update',
        data: orderData
      }));
    }
  };

  // Trading pairs with caching
  app.get("/api/trading-pairs", 
    cacheMiddleware(CacheType.TRADING_PAIRS, 3600), // Cache for 1 hour
    async (req, res) => {
      try {
        const cacheKey = 'all-trading-pairs';
        const cachedPairs = await cacheManager.get(CacheType.TRADING_PAIRS, cacheKey);
        
        if (cachedPairs) {
          return res.json(cachedPairs);
        }

        const pairs = await userStorage.getTradingPairs();
        await cacheManager.set(CacheType.TRADING_PAIRS, cacheKey, pairs, 3600);
        res.json(pairs);
      } catch (error) {
        console.error("Error fetching trading pairs:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Order book with aggressive caching
  app.get("/api/order-book/:symbol", 
    cacheMiddleware(CacheType.ORDER_BOOK, 10), // Cache for 10 seconds
    async (req, res) => {
      try {
        const { symbol } = req.params;
        const cacheKey = `order-book-${symbol}`;
        
        const cachedOrderBook = await cacheManager.get(CacheType.ORDER_BOOK, cacheKey);
        if (cachedOrderBook) {
          return res.json(cachedOrderBook);
        }

        const orderBook = await userStorage.getOrderBook(symbol);
        await cacheManager.set(CacheType.ORDER_BOOK, cacheKey, orderBook, 10);
        res.json(orderBook);
      } catch (error) {
        console.error("Error fetching order book:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Price data with very short caching
  app.get("/api/price/:symbol", 
    cacheMiddleware(CacheType.PRICE_DATA, 5), // Cache for 5 seconds
    async (req, res) => {
      try {
        const { symbol } = req.params;
        const cacheKey = `price-${symbol}`;
        
        const cachedPrice = await cacheManager.get(CacheType.PRICE_DATA, cacheKey);
        if (cachedPrice) {
          return res.json(cachedPrice);
        }

        const price = await userStorage.getPrice(symbol);
        await cacheManager.set(CacheType.PRICE_DATA, cacheKey, price, 5);
        res.json(price);
      } catch (error) {
        console.error("Error fetching price:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // User profile with caching
  app.get("/api/user-profile/:userId", 
    validateSession,
    cacheMiddleware(CacheType.USER_PROFILE, 300), // Cache for 5 minutes
    async (req: RequestWithSession, res) => {
      try {
        const session = req.session;
        if (!session || !session.userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const cacheKey = `profile-${session.userId}`;
        const cachedProfile = await cacheManager.get(CacheType.USER_PROFILE, cacheKey);
        
        if (cachedProfile) {
          return res.json(cachedProfile);
        }

        let profile = await userStorage.getUserProfile(session.userId);
        if (!profile) {
          profile = {
            id: session.userId,
            firstName: "User",
            lastName: "Name",
            email: session.userEmail || "user@example.com",
            phone: null,
            country: "US",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        await cacheManager.set(CacheType.USER_PROFILE, cacheKey, profile, 300);
        res.json(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // User portfolio with caching
  app.get("/api/user-portfolio", 
    validateSession,
    cacheMiddleware(CacheType.USER_PORTFOLIO, 60), // Cache for 1 minute
    async (req: RequestWithSession, res) => {
      try {
        const session = req.session;
        if (!session || !session.userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const cacheKey = `portfolio-${session.userId}`;
        const cachedPortfolio = await cacheManager.get(CacheType.USER_PORTFOLIO, cacheKey);
        
        if (cachedPortfolio) {
          return res.json(cachedPortfolio);
        }

        const portfolio = await userStorage.getUserPortfolio(session.userId);
        await cacheManager.set(CacheType.USER_PORTFOLIO, cacheKey, portfolio, 60);
        res.json(portfolio);
      } catch (error) {
        console.error("Error fetching user portfolio:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Get recent trades
  app.get("/api/trades/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const trades = await storage.getRecentTrades(symbol);
      
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User portfolio endpoints
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const portfolio = await userStorage.getUserPortfolio(userId);
      
      // Add current market prices and calculate values
      const enrichedPortfolio = await Promise.all(
        portfolio.map(async (asset) => {
          let currentPrice = 1; // Default for USDT
          let priceChange24h = 0;
          
          // Get price data for crypto assets
          if (asset.asset !== 'USDT') {
            try {
              const pair = await storage.getTradingPair(`${asset.asset}/USDT`);
              if (pair) {
                currentPrice = parseFloat(pair.currentPrice);
                priceChange24h = parseFloat(pair.priceChangePercent24h);
              }
            } catch (error) {
              console.log(`Price not found for ${asset.asset}`);
            }
          }
          
          const totalValue = parseFloat(asset.balance) * currentPrice;
          
          return {
            ...asset,
            currentPrice: currentPrice.toString(),
            totalValue,
            priceChange24h
          };
        })
      );
      
      res.json(enrichedPortfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User orders endpoints
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const orders = await userStorage.getUserOrders(userId, limit);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertUserOrderSchema.parse(req.body);
      
      // Validate user exists
      const user = await userStorage.getUser(orderData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's current portfolio
      const portfolio = await userStorage.getUserPortfolio(orderData.userId);
      
      // Parse the trading pair to get base and quote assets
      const [baseAsset, quoteAsset] = orderData.symbol.split('/');
      
      // Validate balance for the order
      if (orderData.side === 'buy') {
        // For buy orders, check quote asset balance (e.g., USDT)
        const quoteBalance = portfolio.find(p => p.asset === quoteAsset);
        const requiredAmount = parseFloat(orderData.quantity) * parseFloat(orderData.price || '0');
        
        if (!quoteBalance || parseFloat(quoteBalance.balance) < requiredAmount) {
          return res.status(400).json({ 
            message: `Insufficient ${quoteAsset} balance. Required: ${requiredAmount.toFixed(2)} ${quoteAsset}` 
          });
        }
        
        // Lock the required amount
        await userStorage.lockBalance(orderData.userId, quoteAsset, requiredAmount.toString());
        
      } else {
        // For sell orders, check base asset balance (e.g., BTC)
        const baseBalance = portfolio.find(p => p.asset === baseAsset);
        
        if (!baseBalance || parseFloat(baseBalance.balance) < parseFloat(orderData.quantity)) {
          return res.status(400).json({ 
            message: `Insufficient ${baseAsset} balance. Required: ${orderData.quantity} ${baseAsset}` 
          });
        }
        
        // Lock the required amount
        await userStorage.lockBalance(orderData.userId, baseAsset, orderData.quantity);
      }

      // Create the order
      const order = await userStorage.createOrder(orderData);
      
      // Notify user about order creation
      notifyOrderStatusChange(orderData.userId, {
        orderId: order.id,
        status: 'pending',
        message: 'Order placed successfully'
      });

      // Simulate order processing (in real implementation, this would be handled by a trading engine)
      setTimeout(async () => {
        try {
          // --- Slippage Tolerance Enforcement ---
          // Only enforce for limit/market orders with price
          let slippageTolerance = typeof orderData.slippageTolerance === 'number' ? orderData.slippageTolerance : 0.5;
          let estimatedSlippage = 0;
          if (orderData.price && orderData.quantity) {
            // Get order book and recent trades for the symbol
            const orderBook = await storage.getOrderBook(orderData.symbol);
            const recentTrades = await storage.getRecentTrades(orderData.symbol);
            const currentPrice = parseFloat(orderData.price);
            const marketConditions = calculateMarketConditions(orderBook, recentTrades, currentPrice);
            const fillEstimate = estimateFillTime(
              parseFloat(orderData.quantity),
              parseFloat(orderData.price),
              orderData.side,
              orderBook,
              marketConditions,
              orderData.type
            );
            estimatedSlippage = fillEstimate.slippageEstimate || 0;
            if (estimatedSlippage > slippageTolerance) {
              // Fail the order due to slippage
              await userStorage.updateOrderStatus(order.id, 'failed');
              // Unlock balances
              if (orderData.side === 'buy') {
                const totalCost = parseFloat(orderData.quantity) * parseFloat(orderData.price || '0');
                await userStorage.updateBalance(orderData.userId, quoteAsset, totalCost.toString());
              } else {
                await userStorage.updateBalance(orderData.userId, baseAsset, orderData.quantity);
              }
              notifyOrderStatusChange(orderData.userId, {
                orderId: order.id,
                status: 'failed',
                message: `Order failed: estimated slippage (${estimatedSlippage.toFixed(2)}%) exceeds your tolerance (${slippageTolerance}%)`
              });
              return;
            }
          }
          // --- End Slippage Enforcement ---
          // Simulate order execution with 80% success rate
          const isSuccess = Math.random() > 0.2;
          
          if (isSuccess) {
            // Order filled
            await userStorage.updateOrderStatus(order.id, 'filled', orderData.quantity);
            
            // Create trade record
            const tradeData = {
              userId: orderData.userId,
              orderId: order.id,
              symbol: orderData.symbol,
              side: orderData.side,
              quantity: orderData.quantity,
              price: orderData.price || '0',
              fee: '0.001', // 0.1% fee
              feeAsset: quoteAsset
            };
            
            await userStorage.createTrade(tradeData);
            
            // Update balances
            if (orderData.side === 'buy') {
              // Unlock quote asset and add base asset
              const totalCost = parseFloat(orderData.quantity) * parseFloat(orderData.price || '0');
              await userStorage.updateBalance(orderData.userId, quoteAsset, (-totalCost).toString());
              await userStorage.updateBalance(orderData.userId, baseAsset, orderData.quantity);
            } else {
              // Unlock base asset and add quote asset
              const totalReceived = parseFloat(orderData.quantity) * parseFloat(orderData.price || '0');
              await userStorage.updateBalance(orderData.userId, baseAsset, (-parseFloat(orderData.quantity)).toString());
              await userStorage.updateBalance(orderData.userId, quoteAsset, totalReceived.toString());
            }
            
            notifyOrderStatusChange(orderData.userId, {
              orderId: order.id,
              status: 'filled',
              message: 'Order filled successfully',
              tradeData
            });
            
          } else {
            // Order failed
            await userStorage.updateOrderStatus(order.id, 'cancelled');
            
            // Unlock balances
            if (orderData.side === 'buy') {
              const totalCost = parseFloat(orderData.quantity) * parseFloat(orderData.price || '0');
              await userStorage.updateBalance(orderData.userId, quoteAsset, totalCost.toString());
            } else {
              await userStorage.updateBalance(orderData.userId, baseAsset, orderData.quantity);
            }
            
            notifyOrderStatusChange(orderData.userId, {
              orderId: order.id,
              status: 'cancelled',
              message: 'Order cancelled due to insufficient liquidity'
            });
          }
        } catch (error) {
          console.error('Error processing order:', error);
          await userStorage.updateOrderStatus(order.id, 'failed');
          
          notifyOrderStatusChange(orderData.userId, {
            orderId: order.id,
            status: 'failed',
            message: 'Order processing failed'
          });
        }
      }, Math.random() * 5000 + 2000); // Random delay between 2-7 seconds
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/orders/:orderId/cancel", async (req, res) => {
    try {
      const { orderId } = req.params;
      await userStorage.cancelOrder(parseInt(orderId));
      
      res.json({ message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User trades endpoints
  app.get("/api/user-trades/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const trades = await userStorage.getUserTrades(userId, limit);
      
      res.json(trades);
    } catch (error) {
      console.error("Error fetching user trades:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertUserTradeSchema.parse(req.body);
      const trade = await userStorage.createTrade(tradeData);
      
      res.status(201).json(trade);
    } catch (error) {
      console.error("Error creating trade:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile endpoint - returns real security verification data
  app.get("/api/user-profile", async (req, res) => {
    try {
      const session = (req as any).session;
      if (!session || !session.userId) {
        // Return default profile data for display purposes
        return res.json({
          verified: false,
          emailVerified: false,
          phoneVerified: false,
          twoFactorEnabled: false,
          securityLevel: 1,
          kycStatus: "pending",
          withdrawalLimit: "1000.00",
          uid: "EQ" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        });
      }
      
      let user = await userStorage.getUser(session.userId);
      
      // Create user if doesn't exist (first time login)
      if (!user) {
        user = await userStorage.createUser({
          id: session.userId,
          email: session.userEmail || "user@example.com",
        });
      }

      // Get user profile with security fields
      let profile = await userStorage.getUserProfile(session.userId);
      
      // Create profile if doesn't exist
      if (!profile) {
        profile = await userStorage.createUserProfile({
          id: session.userId,
          uid: "EQ" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          verified: false,
          emailVerified: false,
          phoneVerified: false,
          twoFactorEnabled: false,
          securityLevel: 1,
          kycStatus: "pending",
          withdrawalLimit: "1000.00",
        });
      }
      
      res.json({
        verified: profile.verified || false,
        emailVerified: profile.emailVerified || false,
        phoneVerified: profile.phoneVerified || false,
        twoFactorEnabled: profile.twoFactorEnabled || false,
        securityLevel: profile.securityLevel || 1,
        kycStatus: profile.kycStatus || "pending",
        withdrawalLimit: profile.withdrawalLimit || "1000.00",
        uid: profile.uid,
      });
    } catch (error) {
      console.error("User profile error:", error);
      // Return default profile on error to prevent UI breaking
      res.json({
        verified: false,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        securityLevel: 1,
        kycStatus: "pending",
        withdrawalLimit: "1000.00",
        uid: "EQ" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      });
    }
  });

  // Update user profile
  app.patch('/api/user-profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Validate slippage tolerance if provided
      if (updates.slippageTolerance !== undefined) {
        const slippage = parseFloat(updates.slippageTolerance);
        if (isNaN(slippage) || slippage < 0.01 || slippage > 10) {
          return res.status(400).json({ error: 'Slippage tolerance must be between 0.01% and 10%' });
        }
      }

      const result = await db
        .update(userProfiles)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Dashboard data endpoints - all with proper authentication
  app.get("/api/user-notifications", async (req: RequestWithSession, res) => {
    try {
      const session = req.session;
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const notifications = await userStorage.getUserNotifications(session.userId);
      res.json(notifications || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // API Key Management Routes (require authentication)
  app.get("/api/user-api-keys", async (req: RequestWithSession, res) => {
    try {
      const session = req.session;
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const apiKeys = await userStorage.getUserApiKeys(session.userId);
      res.json(apiKeys || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  // Create new API key
  app.post("/api/user-api-keys", 
    validate(validationChains.createApiKey),
    async (req: RequestWithSession, res) => {
      try {
        const session = req.session;
        if (!session || !session.userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { name, permissions, ipWhitelist, expiresInDays } = req.body;

        const result = await apiKeyManager.generateApiKey(
          session.userId,
          name,
          permissions || ['read'],
          ipWhitelist,
          expiresInDays
        );

        res.json({
          message: "API key created successfully",
          apiKey: result.apiKey,
          secretKey: result.secretKey,
          keyId: result.keyId,
          // Note: secretKey is only shown once
        });
      } catch (error) {
        console.error("Error creating API key:", error);
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  );

  // Rotate API key
  app.post("/api/user-api-keys/:keyId/rotate", 
    validate(validationChains.orderId),
    async (req: RequestWithSession, res) => {
      try {
        const session = req.session;
        if (!session || !session.userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { keyId } = req.params;
        const result = await apiKeyManager.rotateApiKey(parseInt(keyId), session.userId);

        res.json({
          message: "API key rotated successfully",
          newApiKey: result.newApiKey,
          newSecretKey: result.newSecretKey,
          // Note: newSecretKey is only shown once
        });
      } catch (error) {
        console.error("Error rotating API key:", error);
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  );

  // Revoke API key
  app.delete("/api/user-api-keys/:keyId", 
    validate(validationChains.orderId),
    async (req: RequestWithSession, res) => {
      try {
        const session = req.session;
        if (!session || !session.userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { keyId } = req.params;
        await apiKeyManager.revokeApiKey(parseInt(keyId), session.userId);

        res.json({ message: "API key revoked successfully" });
      } catch (error) {
        console.error("Error revoking API key:", error);
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  );

  // API Key Management Routes (require API key authentication)
  app.get("/api/v1/account", 
    validateApiKey({ requiredPermissions: ['read'], trackUsage: true }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const user = await userStorage.getUser(req.apiKey!.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({
          userId: user.id,
          email: user.email,
          createdAt: user.createdAt,
        });
      } catch (error) {
        console.error("Error fetching account:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get("/api/v1/portfolio", 
    validateApiKey({ requiredPermissions: ['read'], trackUsage: true }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const portfolio = await userStorage.getUserPortfolio(req.apiKey!.userId);
        res.json(portfolio);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get("/api/v1/orders", 
    validateApiKey({ requiredPermissions: ['read'], trackUsage: true }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const orders = await userStorage.getUserOrders(req.apiKey!.userId, limit);
        res.json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post("/api/v1/orders", 
    validateApiKey({ requiredPermissions: ['trade'], trackUsage: true }),
    validate(validationChains.createOrder),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { symbol, side, type, quantity, price } = req.body;

        const order = await userStorage.createOrder({
          userId: req.apiKey!.userId,
          symbol,
          side,
          type,
          quantity,
          price: price || null,
          status: 'pending',
        });

        res.json({
          message: "Order created successfully",
          orderId: order.id,
          order,
        });
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.delete("/api/v1/orders/:orderId", 
    validateApiKey({ requiredPermissions: ['trade'], trackUsage: true }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { orderId } = req.params;
        await userStorage.cancelOrder(parseInt(orderId));
        res.json({ message: "Order cancelled successfully" });
      } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get("/api/user-referrals", async (req: RequestWithSession, res) => {
    try {
      const session = req.session;
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const referrals = await userStorage.getUserReferrals(session.userId);
      res.json(referrals || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  app.get("/api/user-messages", async (req: RequestWithSession, res) => {
    try {
      const session = req.session;
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const messages = await userStorage.getUserMessages(session.userId);
      res.json(messages || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/user-devices", async (req: RequestWithSession, res) => {
    try {
      const session = req.session;
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const devices = await userStorage.getUserDevices(session.userId);
      res.json(devices || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  app.get("/api/user-membership", async (req: RequestWithSession, res) => {
    try {
      const session = req.session;
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      let membership = await userStorage.getUserMembership(session.userId);
      
      // Create default membership if none exists
      if (!membership) {
        membership = await userStorage.createUserMembership({
          userId: session.userId,
          level: "basic",
          perks: ["Standard trading fees", "Basic support"],
          isActive: true,
        });
      }
      
      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch membership" });
    }
  });

  // Phone authentication placeholder
  app.post("/api/auth/phone/send", async (req, res) => {
    res.status(501).json({
      success: false,
      message: "Phone authentication is coming soon. Please use email or Google login for now."
    });
  });

  app.post("/api/auth/phone/verify", async (req, res) => {
    res.status(501).json({
      success: false,
      message: "Phone authentication is coming soon. Please use email or Google login for now."
    });
  });

  // WebSocket endpoint for order status updates
  app.get("/api/ws", (req, res) => {
    res.json({ message: "WebSocket endpoint available at ws://localhost:5002" });
  });

  // Session management routes
  app.post("/api/login", 
    validate(validationChains.loginUser),
    async (req: RequestWithSession, res) => {
      try {
        const { email, password } = req.body;
        
        // TODO: Implement actual authentication logic
        // For now, create a mock session
        req.session.userId = 'mock-user-id';
        req.session.userEmail = email;
        req.session.createdAt = new Date().toISOString();
        
        logUserActivity('mock-user-id', 'user_login_success', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        res.json({
          message: "Login successful",
          user: {
            id: req.session.userId,
            email: req.session.userEmail,
          },
        });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    }
  );

  app.post("/api/logout", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        const sessionId = req.sessionID;
        const userId = req.session.userId;
        
        req.session.destroy((err) => {
          if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ message: "Logout failed" });
          }
          
          logUserActivity(userId, 'user_logout_success', {
            sessionId,
            userId,
            ip: req.ip,
          });

          res.json({ message: "Logout successful" });
        });
      } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed" });
      }
    }
  );

  app.get("/api/session", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        res.json({
          sessionId: req.sessionID,
          userId: req.session.userId,
          userEmail: req.session.userEmail,
          createdAt: req.session.createdAt,
          lastAccess: req.session.lastAccess,
        });
      } catch (error) {
        console.error("Session info error:", error);
        res.status(500).json({ message: "Failed to get session info" });
      }
    }
  );

  app.post("/api/session/refresh", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // Regenerate session ID for security
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session refresh error:", err);
            return res.status(500).json({ message: "Session refresh failed" });
          }
          
          logUserActivity(req.session.userId, 'session_refreshed', {
            oldSessionId: req.sessionID,
            newSessionId: req.sessionID,
            userId: req.session.userId,
            ip: req.ip,
          });

          res.json({
            message: "Session refreshed",
            sessionId: req.sessionID,
          });
        });
      } catch (error) {
        console.error("Session refresh error:", error);
        res.status(500).json({ message: "Session refresh failed" });
      }
    }
  );

  // Session statistics (admin only)
  app.get("/api/admin/sessions/stats", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const stats = await sessionUtils.getSessionStats(req.sessionStore);
        res.json(stats);
      } catch (error) {
        console.error("Session stats error:", error);
        res.status(500).json({ message: "Failed to get session stats" });
      }
    }
  );

  app.post("/api/admin/sessions/cleanup", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const cleanedCount = await sessionUtils.cleanupExpiredSessions(req.sessionStore);
        res.json({
          message: "Session cleanup completed",
          cleanedCount,
        });
      } catch (error) {
        console.error("Session cleanup error:", error);
        res.status(500).json({ message: "Session cleanup failed" });
      }
    }
  );

  // Cache management endpoints
  app.get("/api/admin/cache/stats", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        const stats = await Promise.all(
          Object.values(CacheType).map(type => cacheManager.getStats(type))
        );
        res.json(stats);
      } catch (error) {
        console.error("Error fetching cache stats:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post("/api/admin/cache/clear/:type", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        const { type } = req.params;
        const cacheType = type as CacheType;
        
        if (!Object.values(CacheType).includes(cacheType)) {
          return res.status(400).json({ error: "Invalid cache type" });
        }

        const success = await cacheManager.clear(cacheType);
        if (success) {
          res.json({ message: `Cache ${type} cleared successfully` });
        } else {
          res.status(500).json({ error: "Failed to clear cache" });
        }
      } catch (error) {
        console.error("Error clearing cache:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post("/api/admin/cache/clear-all", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        const clearPromises = Object.values(CacheType).map(type => cacheManager.clear(type));
        await Promise.all(clearPromises);
        res.json({ message: "All caches cleared successfully" });
      } catch (error) {
        console.error("Error clearing all caches:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // ===== CEX ADMIN ENDPOINTS FOR UNIFIED ADMIN =====

  // CEX User Management
  app.get("/api/admin/cex/users", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const users = await userStorage.getAllUsers();
        res.json(users);
      } catch (error) {
        console.error("Error fetching CEX users:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // CEX Order Overview
  app.get("/api/admin/cex/orders", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const orders = await userStorage.getAllOrders();
        res.json(orders);
      } catch (error) {
        console.error("Error fetching CEX orders:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // CEX Market Management
  app.get("/api/admin/cex/markets", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const markets = await userStorage.getTradingPairs();
        res.json(markets);
      } catch (error) {
        console.error("Error fetching CEX markets:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Update CEX Trading Pair
  app.post("/api/admin/cex/markets/:symbol", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const { symbol } = req.params;
        const updateData = req.body;
        
        // Update trading pair logic here
        const updated = await userStorage.updateTradingPair(symbol, updateData);
        res.json({ message: `Trading pair ${symbol} updated successfully`, data: updated });
      } catch (error) {
        console.error("Error updating CEX trading pair:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Disable CEX Trading Pair
  app.delete("/api/admin/cex/markets/:symbol", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const { symbol } = req.params;
        
        // Disable trading pair logic here
        const disabled = await userStorage.disableTradingPair(symbol);
        res.json({ message: `Trading pair ${symbol} disabled successfully`, data: disabled });
      } catch (error) {
        console.error("Error disabling CEX trading pair:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // CEX Analytics
  app.get("/api/admin/cex/analytics", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const analytics = {
          totalUsers: await userStorage.getTotalUsers(),
          totalOrders: await userStorage.getTotalOrders(),
          totalTrades: await userStorage.getTotalTrades(),
          totalVolume: await userStorage.getTotalVolume(),
          activeMarkets: await userStorage.getActiveMarkets(),
          systemHealth: await userStorage.getSystemHealth()
        };
        res.json(analytics);
      } catch (error) {
        console.error("Error fetching CEX analytics:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // CEX System Health
  app.get("/api/admin/cex/system", 
    validateSession,
    async (req: RequestWithSession, res) => {
      try {
        // TODO: Add admin role check
        const systemHealth = {
          database: await userStorage.checkDatabaseHealth(),
          cache: await cacheManager.getStats(CacheType.ORDER_BOOK),
          sessions: await sessionUtils.getSessionStats(req.sessionStore),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        };
        res.json(systemHealth);
      } catch (error) {
        console.error("Error fetching CEX system health:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  return server;
}
