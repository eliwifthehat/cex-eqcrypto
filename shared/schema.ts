import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tradingPairs = pgTable("trading_pairs", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  baseAsset: text("base_asset").notNull(),
  quoteAsset: text("quote_asset").notNull(),
  currentPrice: decimal("current_price", { precision: 18, scale: 8 }).notNull(),
  priceChange24h: decimal("price_change_24h", { precision: 18, scale: 8 }).notNull(),
  priceChangePercent24h: decimal("price_change_percent_24h", { precision: 5, scale: 2 }).notNull(),
  high24h: decimal("high_24h", { precision: 18, scale: 8 }).notNull(),
  low24h: decimal("low_24h", { precision: 18, scale: 8 }).notNull(),
  volume24h: decimal("volume_24h", { precision: 18, scale: 8 }).notNull(),
});

export const orderBookEntries = pgTable("order_book_entries", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy' or 'sell'
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  side: text("side").notNull(), // 'buy' or 'sell'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs);
export const insertOrderBookEntrySchema = createInsertSchema(orderBookEntries);
export const insertTradeSchema = createInsertSchema(trades);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TradingPair = typeof tradingPairs.$inferSelect;
export type OrderBookEntry = typeof orderBookEntries.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type InsertOrderBookEntry = z.infer<typeof insertOrderBookEntrySchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
