import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userStorage } from "./userStorage";
import { insertUserOrderSchema, insertUserTradeSchema } from "../shared/schema";

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
