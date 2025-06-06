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
const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTradingPair(symbol: string): Promise<TradingPair | undefined>;
  getOrderBook(symbol: string): Promise<OrderBookEntry[]>;
  getRecentTrades(symbol: string): Promise<Trade[]>;
  getAllTradingPairs(): Promise<TradingPair[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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

export const storage = new MemStorage();
