import { useState, useEffect } from "react";

export interface PriceData {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
}

export function usePriceSimulation(initialPrice: number = 42350.00) {
  const [priceData, setPriceData] = useState<PriceData>({
    currentPrice: initialPrice,
    priceChange: 350.00,
    priceChangePercent: 0.83,
    high24h: 42560.00,
    low24h: 41850.00,
    lastUpdate: new Date(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prev => {
        // Simulate small price movements
        const change = (Math.random() - 0.5) * 20; // Random change between -10 and +10
        const newPrice = Math.max(prev.currentPrice + change, 40000); // Prevent negative prices
        
        // Calculate 24h change (simulate based on starting price)
        const startPrice = initialPrice - 350; // Reverse calculate start price
        const totalChange = newPrice - startPrice;
        const percentChange = (totalChange / startPrice) * 100;
        
        // Update 24h high/low if needed
        const newHigh = Math.max(prev.high24h, newPrice);
        const newLow = Math.min(prev.low24h, newPrice);
        
        return {
          currentPrice: newPrice,
          priceChange: totalChange,
          priceChangePercent: percentChange,
          high24h: newHigh,
          low24h: newLow,
          lastUpdate: new Date(),
        };
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [initialPrice]);

  return priceData;
}
