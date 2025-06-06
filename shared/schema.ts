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
  uid: text("uid").unique().notNull(), // Display UID like EQ123456789
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
  kycStatus: text("kyc_status").default("pending"), // pending, approved, rejected
  securityLevel: integer("security_level").default(1), // 1-5 security level
  withdrawalLimit: decimal("withdrawal_limit", { precision: 20, scale: 2 }).default("1000.00"), // Daily withdrawal limit
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  apiKeyEnabled: boolean("api_key_enabled").default(false),
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

export const userApiKeys = pgTable("user_api_keys", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  apiKey: text("api_key").unique().notNull(),
  secretKey: text("secret_key").notNull(),
  permissions: text("permissions").array().default(["read"]), // read, trade, withdraw
  ipWhitelist: text("ip_whitelist").array(),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // security, trade, system, marketing
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

export const userReferrals = pgTable("user_referrals", {
  id: serial("id").primaryKey(),
  referrerId: text("referrer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  referredId: text("referred_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  referralCode: text("referral_code").notNull(),
  status: text("status").default("pending"), // pending, active, completed
  rewardAmount: decimal("reward_amount", { precision: 20, scale: 8 }).default("0"),
  rewardCurrency: text("reward_currency").default("USDT"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSecurityLogs = pgTable("user_security_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  action: text("action").notNull(), // login, logout, password_change, 2fa_enable, etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  details: text("details"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

export const userMemberships = pgTable("user_memberships", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  level: text("level").default("basic"), // basic, silver, gold, platinum
  perks: text("perks").array().default([]), // array of perk strings
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  deviceId: text("device_id").notNull(),
  deviceName: text("device_name"),
  lastSeen: timestamp("last_seen").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userMessages = pgTable("user_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("general"), // general, security, trading, system
  isRead: boolean("is_read").default(false),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  createdAt: timestamp("created_at").defaultNow(),
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
export const insertUserApiKeySchema = createInsertSchema(userApiKeys);
export const insertUserNotificationSchema = createInsertSchema(userNotifications);
export const insertUserReferralSchema = createInsertSchema(userReferrals);
export const insertUserSecurityLogSchema = createInsertSchema(userSecurityLogs);
export const insertUserMembershipSchema = createInsertSchema(userMemberships);
export const insertUserDeviceSchema = createInsertSchema(userDevices);
export const insertUserMessageSchema = createInsertSchema(userMessages);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type UserPortfolio = typeof userPortfolios.$inferSelect;
export type UserOrder = typeof userOrders.$inferSelect;
export type UserTrade = typeof userTrades.$inferSelect;
export type TradingPair = typeof tradingPairs.$inferSelect;
export type OrderBookEntry = typeof orderBookEntries.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type UserNotification = typeof userNotifications.$inferSelect;
export type UserReferral = typeof userReferrals.$inferSelect;
export type UserSecurityLog = typeof userSecurityLogs.$inferSelect;
export type UserMembership = typeof userMemberships.$inferSelect;
export type UserDevice = typeof userDevices.$inferSelect;
export type UserMessage = typeof userMessages.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertUserPortfolio = z.infer<typeof insertUserPortfolioSchema>;
export type InsertUserOrder = z.infer<typeof insertUserOrderSchema>;
export type InsertUserTrade = z.infer<typeof insertUserTradeSchema>;
export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type InsertOrderBookEntry = z.infer<typeof insertOrderBookEntrySchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type InsertUserApiKey = z.infer<typeof insertUserApiKeySchema>;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type InsertUserReferral = z.infer<typeof insertUserReferralSchema>;
export type InsertUserSecurityLog = z.infer<typeof insertUserSecurityLogSchema>;
export type InsertUserMembership = z.infer<typeof insertUserMembershipSchema>;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type InsertUserMessage = z.infer<typeof insertUserMessageSchema>;
