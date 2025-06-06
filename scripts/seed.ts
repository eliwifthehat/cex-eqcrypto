import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tradingPairs, orderBookEntries, trades } from "../shared/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seedDatabase() {
  console.log("Seeding database with trading data...");
  
  try {
    // Insert trading pairs
    await db.insert(tradingPairs).values([
      {
        symbol: "BTC/USDT",
        baseAsset: "BTC",
        quoteAsset: "USDT",
        currentPrice: "42350.00",
        priceChange24h: "350.00",
        priceChangePercent24h: "0.83",
        high24h: "42560.00",
        low24h: "41850.00",
        volume24h: "8500000000.00"
      },
      {
        symbol: "ETH/USDT",
        baseAsset: "ETH",
        quoteAsset: "USDT",
        currentPrice: "2654.30",
        priceChange24h: "-32.10",
        priceChangePercent24h: "-1.21",
        high24h: "2698.50",
        low24h: "2640.00",
        volume24h: "6100000000.00"
      },
      {
        symbol: "SOL/USDT",
        baseAsset: "SOL",
        quoteAsset: "USDT",
        currentPrice: "98.45",
        priceChange24h: "0.83",
        priceChangePercent24h: "0.85",
        high24h: "99.20",
        low24h: "97.10",
        volume24h: "1200000000.00"
      }
    ]);

    // Insert order book entries
    await db.insert(orderBookEntries).values([
      { symbol: "BTC/USDT", side: "sell", price: "42354.00", quantity: "0.5" },
      { symbol: "BTC/USDT", side: "sell", price: "42353.50", quantity: "0.3" },
      { symbol: "BTC/USDT", side: "sell", price: "42353.00", quantity: "0.7" },
      { symbol: "BTC/USDT", side: "buy", price: "42349.50", quantity: "0.4" },
      { symbol: "BTC/USDT", side: "buy", price: "42349.00", quantity: "0.6" },
      { symbol: "BTC/USDT", side: "buy", price: "42348.50", quantity: "0.8" }
    ]);

    // Insert recent trades
    await db.insert(trades).values([
      { symbol: "BTC/USDT", price: "42350.00", quantity: "0.1", side: "buy" },
      { symbol: "BTC/USDT", price: "42351.00", quantity: "0.2", side: "sell" },
      { symbol: "BTC/USDT", price: "42349.50", quantity: "0.15", side: "buy" }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
  }
}

seedDatabase();