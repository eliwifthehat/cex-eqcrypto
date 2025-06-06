import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Supabase UUID
  email: text("email").unique().notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
  kycStatus: text("kyc_status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPortfolios = pgTable("user_portfolios", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  asset: text("asset").notNull(), // BTC, ETH, USDT, etc.
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  lockedBalance: decimal("locked_balance", { precision: 20, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userOrders = pgTable("user_orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  symbol: text("symbol").notNull(), // BTC/USDT
  side: text("side").notNull(), // buy, sell
  type: text("type").notNull(), // market, limit
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  price: decimal("price", { precision: 20, scale: 8 }),
  filledQuantity: decimal("filled_quantity", { precision: 20, scale: 8 }).default("0"),
  status: text("status").default("pending"), // pending, filled, cancelled, partial
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userTrades = pgTable("user_trades", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  orderId: integer("order_id").references(() => userOrders.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 20, scale: 8 }).default("0"),
  feeAsset: text("fee_asset").default("USDT"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const insertUserPortfolioSchema = createInsertSchema(userPortfolios);
export const insertUserOrderSchema = createInsertSchema(userOrders);
export const insertUserTradeSchema = createInsertSchema(userTrades);
export const insertTradingPairSchema = createInsertSchema(tradingPairs);
export const insertOrderBookEntrySchema = createInsertSchema(orderBookEntries);
export const insertTradeSchema = createInsertSchema(trades);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type UserPortfolio = typeof userPortfolios.$inferSelect;
export type UserOrder = typeof userOrders.$inferSelect;
export type UserTrade = typeof userTrades.$inferSelect;
export type TradingPair = typeof tradingPairs.$inferSelect;
export type OrderBookEntry = typeof orderBookEntries.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertUserPortfolio = z.infer<typeof insertUserPortfolioSchema>;
export type InsertUserOrder = z.infer<typeof insertUserOrderSchema>;
export type InsertUserTrade = z.infer<typeof insertUserTradeSchema>;
export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type InsertOrderBookEntry = z.infer<typeof insertOrderBookEntrySchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
