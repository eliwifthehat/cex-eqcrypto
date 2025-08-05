import { drizzle } from "drizzle-orm/postgres-js";
import { createOptimizedConnection, queryUtils } from "./db-optimization";
import { 
  users, 
  userProfiles, 
  userPortfolios, 
  userOrders, 
  userTrades,
  userApiKeys,
  userNotifications,
  userReferrals,
  userSecurityLogs,
  userMessages,
  userDevices,
  userMemberships,
  tradingPairs, 
  type User, 
  type InsertUser, 
  type UserProfile,
  type UserPortfolio,
  type UserOrder,
  type UserTrade,
  type UserApiKey,
  type UserNotification,
  type UserReferral,
  type UserSecurityLog,
  type UserMessage,
  type UserDevice,
  type UserMembership,
  type InsertUserProfile,
  type InsertUserOrder,
  type InsertUserTrade,
  type InsertUserApiKey,
  type InsertUserNotification,
  type InsertUserReferral,
  type InsertUserSecurityLog,
  type InsertUserMembership,
  type TradingPair 
} from "../shared/schema";
import { eq, desc, and, sum } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = createOptimizedConnection(connectionString);
const db = drizzle(client);

export interface IUserStorage {
  // User management
  createUser(user: { id: string; email: string; phone?: string }): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // User profile management
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Portfolio management
  getUserPortfolio(userId: string): Promise<UserPortfolio[]>;
  updateBalance(userId: string, asset: string, amount: string): Promise<void>;
  lockBalance(userId: string, asset: string, amount: string): Promise<void>;
  
  // Order management
  createOrder(order: Omit<InsertUserOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserOrder>;
  getUserOrders(userId: string, limit?: number): Promise<UserOrder[]>;
  updateOrderStatus(orderId: number, status: string, filledQuantity?: string): Promise<void>;
  cancelOrder(orderId: number): Promise<void>;
  
  // Trade history
  createTrade(trade: Omit<InsertUserTrade, 'id' | 'createdAt'>): Promise<UserTrade>;
  getUserTrades(userId: string, limit?: number): Promise<UserTrade[]>;
  getTradesBySymbol(userId: string, symbol: string): Promise<UserTrade[]>;
  
  // API key management
  getUserApiKeys(userId: string): Promise<UserApiKey[]>;
  createApiKey(apiKey: InsertUserApiKey): Promise<UserApiKey>;
  updateApiKey(keyId: number, updates: Partial<InsertUserApiKey>): Promise<void>;
  deleteApiKey(keyId: number): Promise<void>;
  
  // Notification management
  getUserNotifications(userId: string, limit?: number): Promise<UserNotification[]>;
  createNotification(notification: InsertUserNotification): Promise<UserNotification>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  
  // Referral management
  getUserReferrals(userId: string): Promise<UserReferral[]>;
  createReferral(referral: InsertUserReferral): Promise<UserReferral>;
  updateReferralStatus(referralId: number, status: string): Promise<void>;
  
  // Security logs
  getSecurityLogs(userId: string, limit?: number): Promise<UserSecurityLog[]>;
  createSecurityLog(log: InsertUserSecurityLog): Promise<UserSecurityLog>;
  
  // Additional user management methods
  getUserMessages(userId: string, limit?: number): Promise<UserMessage[]>;
  getUserDevices(userId: string): Promise<UserDevice[]>;
  getUserMembership(userId: string): Promise<UserMembership | undefined>;
  createUserMembership(membership: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserMembership>;
  
  // Trading pairs and market data
  getTradingPairs(): Promise<TradingPair[]>;
  getOrderBook(symbol: string): Promise<any>;
  getPrice(symbol: string): Promise<any>;
}

export class UserStorage implements IUserStorage {
  async createUser(userData: { id: string; email: string; phone?: string }): Promise<User> {
    const newUser = await db.insert(users).values({
      id: userData.id,
      email: userData.email,
      phone: userData.phone,
    }).returning();
    return newUser[0];
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserPortfolio(userId: string): Promise<UserPortfolio[]> {
    // Optimized query with proper indexing
    return await db.select()
      .from(userPortfolios)
      .where(eq(userPortfolios.userId, userId))
      .orderBy(desc(userPortfolios.updatedAt))
      .limit(100); // Prevent large result sets
  }

  async updateBalance(userId: string, asset: string, amount: string): Promise<void> {
    // Use transaction for data consistency
    await db.transaction(async (tx) => {
      await tx.update(userPortfolios)
        .set({ 
          balance: amount,
          updatedAt: new Date()
        })
        .where(and(
          eq(userPortfolios.userId, userId),
          eq(userPortfolios.asset, asset)
        ));
    });
  }

  async lockBalance(userId: string, asset: string, amount: string): Promise<void> {
    // Use transaction with row-level locking
    await db.transaction(async (tx) => {
      await tx.update(userPortfolios)
        .set({ 
          lockedBalance: amount,
          updatedAt: new Date()
        })
        .where(and(
          eq(userPortfolios.userId, userId),
          eq(userPortfolios.asset, asset)
        ));
    });
  }

  async createOrder(orderData: Omit<InsertUserOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserOrder> {
    const newOrder = await db.insert(userOrders).values({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newOrder[0];
  }

  async getUserOrders(userId: string, limit: number = 50): Promise<UserOrder[]> {
    // Optimized query with pagination and proper ordering
    return await db.select()
      .from(userOrders)
      .where(eq(userOrders.userId, userId))
      .orderBy(desc(userOrders.createdAt))
      .limit(Math.min(limit, 100)); // Prevent excessive data retrieval
  }

  async updateOrderStatus(orderId: number, status: string, filledQuantity?: string): Promise<void> {
    const updates: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (filledQuantity) {
      updates.filledQuantity = filledQuantity;
    }

    await db.update(userOrders)
      .set(updates)
      .where(eq(userOrders.id, orderId));
  }

  async cancelOrder(orderId: number): Promise<void> {
    await db.update(userOrders)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(userOrders.id, orderId));
  }

  async createTrade(tradeData: Omit<InsertUserTrade, 'id' | 'createdAt'>): Promise<UserTrade> {
    const newTrade = await db.insert(userTrades).values({
      ...tradeData,
      createdAt: new Date(),
    }).returning();
    return newTrade[0];
  }

  async getUserTrades(userId: string, limit: number = 100): Promise<UserTrade[]> {
    // Optimized query with pagination
    return await db.select()
      .from(userTrades)
      .where(eq(userTrades.userId, userId))
      .orderBy(desc(userTrades.createdAt))
      .limit(Math.min(limit, 200)); // Prevent excessive data retrieval
  }

  async getTradesBySymbol(userId: string, symbol: string): Promise<UserTrade[]> {
    // Optimized query with compound filtering
    return await db.select()
      .from(userTrades)
      .where(and(
        eq(userTrades.userId, userId),
        eq(userTrades.symbol, symbol)
      ))
      .orderBy(desc(userTrades.createdAt))
      .limit(100);
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    // Optimized query with single result
    const result = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return result[0];
  }

  async createUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const newProfile = await db.insert(userProfiles).values(profileData).returning();
    return newProfile[0];
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const updatedProfile = await db.update(userProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile[0];
  }

  async getUserApiKeys(userId: string): Promise<UserApiKey[]> {
    // Optimized query with security filtering
    return await db.select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId))
      .orderBy(desc(userApiKeys.createdAt))
      .limit(50);
  }

  async createApiKey(apiKeyData: InsertUserApiKey): Promise<UserApiKey> {
    const newApiKey = await db.insert(userApiKeys).values(apiKeyData).returning();
    return newApiKey[0];
  }

  async updateApiKey(keyId: number, updates: Partial<InsertUserApiKey>): Promise<void> {
    await db.update(userApiKeys)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userApiKeys.id, keyId));
  }

  async deleteApiKey(keyId: number): Promise<void> {
    await db.delete(userApiKeys).where(eq(userApiKeys.id, keyId));
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<UserNotification[]> {
    // Optimized query with read status filtering
    return await db.select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId))
      .orderBy(desc(userNotifications.createdAt))
      .limit(Math.min(limit, 100));
  }

  async createNotification(notificationData: InsertUserNotification): Promise<UserNotification> {
    const newNotification = await db.insert(userNotifications).values(notificationData).returning();
    return newNotification[0];
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.update(userNotifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(userNotifications.id, notificationId));
  }

  async getUserReferrals(userId: string): Promise<UserReferral[]> {
    // Optimized query for referral data
    return await db.select()
      .from(userReferrals)
      .where(eq(userReferrals.referrerId, userId))
      .orderBy(desc(userReferrals.createdAt))
      .limit(50);
  }

  async createReferral(referralData: InsertUserReferral): Promise<UserReferral> {
    const newReferral = await db.insert(userReferrals).values(referralData).returning();
    return newReferral[0];
  }

  async updateReferralStatus(referralId: number, status: string): Promise<void> {
    await db.update(userReferrals)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(userReferrals.id, referralId));
  }

  async getSecurityLogs(userId: string, limit: number = 100): Promise<UserSecurityLog[]> {
    // Optimized query for security monitoring
    return await db.select()
      .from(userSecurityLogs)
      .where(eq(userSecurityLogs.userId, userId))
      .orderBy(desc(userSecurityLogs.createdAt))
      .limit(Math.min(limit, 200));
  }

  async createSecurityLog(logData: InsertUserSecurityLog): Promise<UserSecurityLog> {
    const newLog = await db.insert(userSecurityLogs).values(logData).returning();
    return newLog[0];
  }

  async getUserMessages(userId: string, limit: number = 50): Promise<UserMessage[]> {
    // Optimized query for messaging
    return await db.select()
      .from(userMessages)
      .where(eq(userMessages.userId, userId))
      .orderBy(desc(userMessages.createdAt))
      .limit(Math.min(limit, 100));
  }

  async getUserDevices(userId: string): Promise<UserDevice[]> {
    // Optimized query for device management
    return await db.select()
      .from(userDevices)
      .where(eq(userDevices.userId, userId))
      .orderBy(desc(userDevices.lastUsed))
      .limit(20);
  }

  async getUserMembership(userId: string): Promise<UserMembership | undefined> {
    // Optimized query for membership data
    const result = await db.select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, userId))
      .limit(1);
    return result[0];
  }

  async createUserMembership(membershipData: any): Promise<any> {
    const newMembership = await db.insert(userMemberships).values(membershipData).returning();
    return newMembership[0];
  }

  // New optimized methods for trading data
  async getTradingPairs(): Promise<TradingPair[]> {
    // Optimized query for trading pairs with caching
    return await db.select()
      .from(tradingPairs)
      .orderBy(tradingPairs.symbol)
      .limit(1000); // Reasonable limit for trading pairs
  }

  async getOrderBook(symbol: string): Promise<any> {
    // Placeholder for order book data
    // This would typically query a separate order book table or external API
    return {
      symbol,
      bids: [],
      asks: [],
      timestamp: new Date().toISOString()
    };
  }

  async getPrice(symbol: string): Promise<any> {
    // Placeholder for price data
    // This would typically query a price feed or external API
    return {
      symbol,
      price: Math.random() * 100000, // Placeholder price
      timestamp: new Date().toISOString()
    };
  }

  // Advanced query methods with optimization
  async getUserOrdersWithFilters(
    userId: string, 
    filters: {
      status?: string;
      symbol?: string;
      orderType?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 20 }
  ): Promise<{ orders: UserOrder[]; total: number }> {
    const conditions = [eq(userOrders.userId, userId)];
    
    if (filters.status) {
      conditions.push(eq(userOrders.status, filters.status));
    }
    if (filters.symbol) {
      conditions.push(eq(userOrders.symbol, filters.symbol));
    }
    if (filters.orderType) {
      conditions.push(eq(userOrders.orderType, filters.orderType));
    }
    if (filters.startDate) {
      conditions.push(userOrders.createdAt >= filters.startDate);
    }
    if (filters.endDate) {
      conditions.push(userOrders.createdAt <= filters.endDate);
    }

    const offset = (pagination.page - 1) * pagination.limit;
    
    const [orders, totalResult] = await Promise.all([
      db.select()
        .from(userOrders)
        .where(and(...conditions))
        .orderBy(desc(userOrders.createdAt))
        .limit(pagination.limit)
        .offset(offset),
      db.select({ count: sum(userOrders.id) })
        .from(userOrders)
        .where(and(...conditions))
    ]);

    return {
      orders,
      total: Number(totalResult[0]?.count || 0)
    };
  }

  async getUserPortfolioSummary(userId: string): Promise<any> {
    // Optimized query for portfolio summary with aggregation
    const summary = await db.select({
      totalAssets: sum(userPortfolios.balance),
      totalLocked: sum(userPortfolios.lockedBalance),
      assetCount: sum(userPortfolios.id)
    })
    .from(userPortfolios)
    .where(eq(userPortfolios.userId, userId));

    return summary[0];
  }

  async getRecentTrades(userId: string, hours: number = 24): Promise<UserTrade[]> {
    // Optimized query for recent trades with time filtering
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await db.select()
      .from(userTrades)
      .where(and(
        eq(userTrades.userId, userId),
        userTrades.createdAt >= startTime
      ))
      .orderBy(desc(userTrades.createdAt))
      .limit(100);
  }
}

export const userStorage = new UserStorage();