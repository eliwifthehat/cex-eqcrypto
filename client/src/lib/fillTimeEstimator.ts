export interface OrderBookEntry {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

export interface FillTimeEstimate {
  estimatedTime: string; // e.g., "2-5 min", "Immediate", "15-30 min"
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  slippageEstimate?: number; // percentage
}

export interface MarketConditions {
  volatility: number; // 0-1 scale
  volume24h: number;
  spread: number; // bid-ask spread percentage
  liquidityDepth: number; // total volume within 1% of mid price
}

/**
 * Calculate estimated fill time for an order based on order book analysis
 */
export function estimateFillTime(
  orderSize: number,
  orderPrice: number,
  orderSide: 'buy' | 'sell',
  orderBook: OrderBookEntry[],
  marketConditions: MarketConditions,
  orderType: 'market' | 'limit' | 'advanced' = 'limit'
): FillTimeEstimate {
  
  // Market orders are typically filled immediately
  if (orderType === 'market') {
    return {
      estimatedTime: 'Immediate',
      confidence: 'high',
      reason: 'Market orders are executed immediately at current market price'
    };
  }

  // Filter order book by side and sort by price
  const relevantOrders = orderBook
    .filter(order => order.side === (orderSide === 'buy' ? 'sell' : 'buy'))
    .sort((a, b) => orderSide === 'buy' ? a.price - b.price : b.price - a.price);

  if (relevantOrders.length === 0) {
    return {
      estimatedTime: 'Unknown',
      confidence: 'low',
      reason: 'No matching orders in order book'
    };
  }

  // Calculate available liquidity at or better than order price
  let availableLiquidity = 0;
  let slippageEstimate = 0;
  
  for (const order of relevantOrders) {
    const isPriceAcceptable = orderSide === 'buy' 
      ? order.price <= orderPrice 
      : order.price >= orderPrice;
    
    if (isPriceAcceptable) {
      availableLiquidity += order.amount;
    }
  }

  // Calculate fill percentage
  const fillPercentage = Math.min(100, (availableLiquidity / orderSize) * 100);
  
  // Estimate slippage based on order size vs liquidity
  const liquidityRatio = orderSize / marketConditions.liquidityDepth;
  slippageEstimate = Math.min(5, liquidityRatio * marketConditions.spread * 10); // Max 5% slippage

  // Determine fill time based on various factors
  let estimatedTime: string;
  let confidence: 'high' | 'medium' | 'low';
  let reason: string;

  if (fillPercentage >= 90) {
    // High fill rate - likely to fill quickly
    if (marketConditions.volatility < 0.3) {
      estimatedTime = '1-3 min';
      confidence = 'high';
      reason = 'High liquidity available, low market volatility';
    } else {
      estimatedTime = '2-5 min';
      confidence = 'medium';
      reason = 'High liquidity but moderate volatility may cause delays';
    }
  } else if (fillPercentage >= 50) {
    // Medium fill rate
    if (marketConditions.volatility < 0.5) {
      estimatedTime = '5-15 min';
      confidence = 'medium';
      reason = 'Moderate liquidity, order may need to wait for new orders';
    } else {
      estimatedTime = '10-30 min';
      confidence = 'medium';
      reason = 'Moderate liquidity with higher volatility';
    }
  } else if (fillPercentage >= 20) {
    // Low fill rate
    estimatedTime = '30-60 min';
    confidence = 'low';
    reason = 'Limited liquidity, order may take significant time to fill';
  } else {
    // Very low fill rate
    estimatedTime = '1-4 hours';
    confidence = 'low';
    reason = 'Very limited liquidity, order unlikely to fill quickly';
  }

  // Adjust for market conditions
  if (marketConditions.volume24h < 1000000) { // Low volume market
    estimatedTime = adjustTimeForLowVolume(estimatedTime);
    reason += ', low market volume';
  }

  return {
    estimatedTime,
    confidence,
    reason,
    slippageEstimate: slippageEstimate > 0 ? slippageEstimate : undefined
  };
}

/**
 * Adjust estimated time for low volume markets
 */
function adjustTimeForLowVolume(originalTime: string): string {
  const timeMap: Record<string, string> = {
    '1-3 min': '3-8 min',
    '2-5 min': '5-12 min',
    '5-15 min': '15-45 min',
    '10-30 min': '30-90 min',
    '30-60 min': '1-3 hours',
    '1-4 hours': '2-8 hours'
  };
  
  return timeMap[originalTime] || originalTime;
}

/**
 * Get market conditions from order book and recent trades
 */
export function calculateMarketConditions(
  orderBook: OrderBookEntry[],
  recentTrades: Array<{ price: number; amount: number; timestamp: Date }>,
  currentPrice: number
): MarketConditions {
  
  // Calculate bid-ask spread
  const buyOrders = orderBook.filter(o => o.side === 'buy').sort((a, b) => b.price - a.price);
  const sellOrders = orderBook.filter(o => o.side === 'sell').sort((a, b) => a.price - b.price);
  
  const bestBid = buyOrders[0]?.price || currentPrice * 0.999;
  const bestAsk = sellOrders[0]?.price || currentPrice * 1.001;
  const spread = ((bestAsk - bestBid) / currentPrice) * 100;

  // Calculate liquidity depth (volume within 1% of mid price)
  const midPrice = (bestBid + bestAsk) / 2;
  const priceRange = midPrice * 0.01; // 1% range
  
  const liquidityDepth = orderBook
    .filter(order => Math.abs(order.price - midPrice) <= priceRange)
    .reduce((sum, order) => sum + order.amount, 0);

  // Calculate volatility from recent trades (simplified)
  const recentPrices = recentTrades
    .filter(trade => Date.now() - trade.timestamp.getTime() < 24 * 60 * 60 * 1000) // Last 24h
    .map(trade => trade.price);
  
  let volatility = 0.1; // Default low volatility
  if (recentPrices.length > 10) {
    const mean = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / recentPrices.length;
    volatility = Math.min(1, Math.sqrt(variance) / mean);
  }

  // Calculate 24h volume
  const volume24h = recentTrades
    .filter(trade => Date.now() - trade.timestamp.getTime() < 24 * 60 * 60 * 1000)
    .reduce((sum, trade) => sum + trade.amount, 0);

  return {
    volatility,
    volume24h,
    spread,
    liquidityDepth
  };
}

/**
 * Get a human-readable explanation of the fill time estimate
 */
export function getFillTimeExplanation(estimate: FillTimeEstimate): string {
  const confidenceText = {
    high: 'high confidence',
    medium: 'moderate confidence', 
    low: 'low confidence'
  };

  let explanation = `Estimated fill time: ${estimate.estimatedTime} (${confidenceText[estimate.confidence]})`;
  
  if (estimate.slippageEstimate) {
    explanation += `. Expected slippage: ${estimate.slippageEstimate.toFixed(2)}%`;
  }
  
  explanation += `. ${estimate.reason}`;
  
  return explanation;
} 