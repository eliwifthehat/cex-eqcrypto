import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { 
  users, 
  tradingPairs, 
  orderBookEntries, 
  trades,
  type User, 
  type InsertUser, 
  type TradingPair, 
  type OrderBookEntry, 
  type Trade 
} from "@shared/schema";

// Database connection
const connectionString = process.env.DATABASE_URL!;
// URL encode the connection string to handle special characters
const encodedConnectionString = connectionString.replace(/!/g, '%21').replace(/#/g, '%23').replace(/&/g, '%26').replace(/%/g, '%25');
const client = postgres(encodedConnectionString);
const db = drizzle(client);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTradingPair(symbol: string): Promise<TradingPair | undefined>;
  getOrderBook(symbol: string): Promise<OrderBookEntry[]>;
  getRecentTrades(symbol: string): Promise<Trade[]>;
  getAllTradingPairs(): Promise<TradingPair[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      id: insertUser.id,
      email: insertUser.email,
      phone: insertUser.phone ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getTradingPair(symbol: string): Promise<TradingPair | undefined> {
    // Mock data for now - will be replaced with database calls
    const mockPairs = {
      "BTC/USDT": {
        id: 1,
        symbol: "BTC/USDT",
        baseAsset: "BTC",
        quoteAsset: "USDT",
        currentPrice: "42350.00",
        priceChange24h: "350.00",
        priceChangePercent24h: "0.83",
        high24h: "42560.00",
        low24h: "41850.00",
        volume24h: "8500000000.00"
      }
    };
    return mockPairs[symbol as keyof typeof mockPairs] as TradingPair;
  }

  async getOrderBook(symbol: string): Promise<OrderBookEntry[]> {
    // Mock order book data
    return [
      { id: 1, symbol, side: "sell", price: "42354.00", quantity: "0.5", timestamp: new Date() },
      { id: 2, symbol, side: "sell", price: "42353.50", quantity: "0.3", timestamp: new Date() },
      { id: 3, symbol, side: "buy", price: "42349.50", quantity: "0.4", timestamp: new Date() },
      { id: 4, symbol, side: "buy", price: "42349.00", quantity: "0.6", timestamp: new Date() }
    ] as OrderBookEntry[];
  }

  async getRecentTrades(symbol: string): Promise<Trade[]> {
    // Mock trade data
    return [
      { id: 1, symbol, price: "42350.00", quantity: "0.1", side: "buy", timestamp: new Date() },
      { id: 2, symbol, price: "42351.00", quantity: "0.2", side: "sell", timestamp: new Date() }
    ] as Trade[];
  }

  async getAllTradingPairs(): Promise<TradingPair[]> {
    // Mock trading pairs data
    return [
      {
        id: 1,
        symbol: "BTC/USDT",
        baseAsset: "BTC",
        quoteAsset: "USDT",
        currentPrice: "42350.00",
        priceChange24h: "350.00",
        priceChangePercent24h: "0.83",
        high24h: "42560.00",
        low24h: "41850.00",
        volume24h: "8500000000.00"
      }
    ] as TradingPair[];
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db = drizzle(client);

  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email));
      return result[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getTradingPair(symbol: string): Promise<TradingPair | undefined> {
    try {
      const result = await this.db.select().from(tradingPairs).where(eq(tradingPairs.symbol, symbol));
      return result[0];
    } catch (error) {
      console.error('Error fetching trading pair:', error);
      // Return mock data if database fails for development
      return {
        id: 1,
        symbol: "BTC/USDT",
        baseAsset: "BTC",
        quoteAsset: "USDT",
        currentPrice: "42350.00",
        priceChange24h: "350.00",
        priceChangePercent24h: "0.83",
        high24h: "42560.00",
        low24h: "41850.00",
        volume24h: "8500000000.00"
      } as TradingPair;
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBookEntry[]> {
    try {
      const result = await this.db.select().from(orderBookEntries).where(eq(orderBookEntries.symbol, symbol));
      return result;
    } catch (error) {
      console.error('Error fetching order book:', error);
      // Return mock data if database fails
      return [
        { id: 1, symbol, side: "sell", price: "42354.00", quantity: "0.5", timestamp: new Date() },
        { id: 2, symbol, side: "sell", price: "42353.50", quantity: "0.3", timestamp: new Date() },
        { id: 3, symbol, side: "buy", price: "42349.50", quantity: "0.4", timestamp: new Date() },
        { id: 4, symbol, side: "buy", price: "42349.00", quantity: "0.6", timestamp: new Date() }
      ] as OrderBookEntry[];
    }
  }

  async getRecentTrades(symbol: string): Promise<Trade[]> {
    try {
      const result = await this.db.select().from(trades).where(eq(trades.symbol, symbol));
      return result;
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      return [];
    }
  }

  async getAllTradingPairs(): Promise<TradingPair[]> {
    try {
      const result = await this.db.select().from(tradingPairs);
      return result;
    } catch (error) {
      console.error('Error fetching all trading pairs:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
