import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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
  type TradingPair 
} from "../shared/schema";
import { eq, desc, and, sum } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
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
}

export class UserStorage implements IUserStorage {
  async createUser(userData: { id: string; email: string; phone?: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    
    // Initialize default portfolio balances
    await db.insert(userPortfolios).values([
      { userId: userData.id, asset: 'USDT', balance: '10000.00000000' }, // Demo balance
      { userId: userData.id, asset: 'BTC', balance: '0.00000000' },
      { userId: userData.id, asset: 'ETH', balance: '0.00000000' },
      { userId: userData.id, asset: 'SOL', balance: '0.00000000' },
    ]);
    
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserPortfolio(userId: string): Promise<UserPortfolio[]> {
    return await db.select().from(userPortfolios).where(eq(userPortfolios.userId, userId));
  }

  async updateBalance(userId: string, asset: string, amount: string): Promise<void> {
    await db
      .update(userPortfolios)
      .set({ balance: amount, updatedAt: new Date() })
      .where(and(eq(userPortfolios.userId, userId), eq(userPortfolios.asset, asset)));
  }

  async lockBalance(userId: string, asset: string, amount: string): Promise<void> {
    await db
      .update(userPortfolios)
      .set({ lockedBalance: amount, updatedAt: new Date() })
      .where(and(eq(userPortfolios.userId, userId), eq(userPortfolios.asset, asset)));
  }

  async createOrder(orderData: Omit<InsertUserOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserOrder> {
    const [order] = await db.insert(userOrders).values(orderData).returning();
    return order;
  }

  async getUserOrders(userId: string, limit: number = 50): Promise<UserOrder[]> {
    return await db
      .select()
      .from(userOrders)
      .where(eq(userOrders.userId, userId))
      .orderBy(desc(userOrders.createdAt))
      .limit(limit);
  }

  async updateOrderStatus(orderId: number, status: string, filledQuantity?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (filledQuantity) {
      updateData.filledQuantity = filledQuantity;
    }
    
    await db
      .update(userOrders)
      .set(updateData)
      .where(eq(userOrders.id, orderId));
  }

  async cancelOrder(orderId: number): Promise<void> {
    await db
      .update(userOrders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(userOrders.id, orderId));
  }

  async createTrade(tradeData: Omit<InsertUserTrade, 'id' | 'createdAt'>): Promise<UserTrade> {
    const [trade] = await db.insert(userTrades).values(tradeData).returning();
    return trade;
  }

  async getUserTrades(userId: string, limit: number = 100): Promise<UserTrade[]> {
    return await db
      .select()
      .from(userTrades)
      .where(eq(userTrades.userId, userId))
      .orderBy(desc(userTrades.createdAt))
      .limit(limit);
  }

  async getTradesBySymbol(userId: string, symbol: string): Promise<UserTrade[]> {
    return await db
      .select()
      .from(userTrades)
      .where(and(eq(userTrades.userId, userId), eq(userTrades.symbol, symbol)))
      .orderBy(desc(userTrades.createdAt));
  }

  // User profile management
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId));
    return profile || undefined;
  }

  async createUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values(profileData).returning();
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.id, userId))
      .returning();
    return profile;
  }

  // API key management
  async getUserApiKeys(userId: string): Promise<UserApiKey[]> {
    return await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId))
      .orderBy(desc(userApiKeys.createdAt));
  }

  async createApiKey(apiKeyData: InsertUserApiKey): Promise<UserApiKey> {
    const [apiKey] = await db.insert(userApiKeys).values(apiKeyData).returning();
    return apiKey;
  }

  async updateApiKey(keyId: number, updates: Partial<InsertUserApiKey>): Promise<void> {
    await db
      .update(userApiKeys)
      .set(updates)
      .where(eq(userApiKeys.id, keyId));
  }

  async deleteApiKey(keyId: number): Promise<void> {
    await db
      .delete(userApiKeys)
      .where(eq(userApiKeys.id, keyId));
  }

  // Notification management
  async getUserNotifications(userId: string, limit: number = 50): Promise<UserNotification[]> {
    return await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId))
      .orderBy(desc(userNotifications.createdAt))
      .limit(limit);
  }

  async createNotification(notificationData: InsertUserNotification): Promise<UserNotification> {
    const [notification] = await db.insert(userNotifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(userNotifications)
      .set({ isRead: true })
      .where(eq(userNotifications.id, notificationId));
  }

  // Referral management
  async getUserReferrals(userId: string): Promise<UserReferral[]> {
    return await db
      .select()
      .from(userReferrals)
      .where(eq(userReferrals.referrerId, userId))
      .orderBy(desc(userReferrals.createdAt));
  }

  async createReferral(referralData: InsertUserReferral): Promise<UserReferral> {
    const [referral] = await db.insert(userReferrals).values(referralData).returning();
    return referral;
  }

  async updateReferralStatus(referralId: number, status: string): Promise<void> {
    await db
      .update(userReferrals)
      .set({ status })
      .where(eq(userReferrals.id, referralId));
  }

  // Security logs
  async getSecurityLogs(userId: string, limit: number = 100): Promise<UserSecurityLog[]> {
    return await db
      .select()
      .from(userSecurityLogs)
      .where(eq(userSecurityLogs.userId, userId))
      .orderBy(desc(userSecurityLogs.createdAt))
      .limit(limit);
  }

  async createSecurityLog(logData: InsertUserSecurityLog): Promise<UserSecurityLog> {
    const [log] = await db.insert(userSecurityLogs).values(logData).returning();
    return log;
  }

  // Additional user management methods
  async getUserMessages(userId: string, limit: number = 50): Promise<UserMessage[]> {
    return await db
      .select()
      .from(userMessages)
      .where(eq(userMessages.userId, userId))
      .orderBy(desc(userMessages.createdAt))
      .limit(limit);
  }

  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return await db
      .select()
      .from(userDevices)
      .where(eq(userDevices.userId, userId))
      .orderBy(desc(userDevices.lastSeen));
  }

  async getUserMembership(userId: string): Promise<UserMembership | undefined> {
    const [membership] = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, userId));
    return membership || undefined;
  }
}

export const userStorage = new UserStorage();