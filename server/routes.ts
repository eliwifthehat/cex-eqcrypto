import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userStorage } from "./userStorage";
import { insertUserOrderSchema, insertUserTradeSchema } from "../shared/schema";

// Extend Request type to include session
interface RequestWithSession extends Request {
  session: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get trading pair data
  app.get("/api/trading-pairs/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const tradingPair = await storage.getTradingPair(symbol);
      
      if (!tradingPair) {
        return res.status(404).json({ message: "Trading pair not found" });
      }
      
      res.json(tradingPair);
    } catch (error) {
      console.error("Error fetching trading pair:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get order book
  app.get("/api/order-book/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const orderBook = await storage.getOrderBook(symbol);
      
      res.json(orderBook);
    } catch (error) {
      console.error("Error fetching order book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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
      const order = await userStorage.createOrder(orderData);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Internal server error" });
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

  const httpServer = createServer(app);
  return httpServer;
}
