import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);
  return httpServer;
}
