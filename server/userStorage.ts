import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  userProfiles, 
  userPortfolios, 
  userOrders, 
  userTrades,
  tradingPairs, 
  type User, 
  type InsertUser, 
  type UserProfile,
  type UserPortfolio,
  type UserOrder,
  type UserTrade,
  type InsertUserOrder,
  type InsertUserTrade,
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
}

export const userStorage = new UserStorage();