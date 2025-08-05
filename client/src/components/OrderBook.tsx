import { useRef, useState, useEffect, useMemo } from "react";
import { List, Grid3X3, BarChart3, ChevronDown, Star } from "lucide-react";

export default function OrderBook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [priceFlash, setPriceFlash] = useState(false);
  const [lastPrice, setLastPrice] = useState(66673.4);

  const sellOrders = [
    { price: 66683.1, amount: 0.088268 },
    { price: 66682.1, amount: 0.082093 },
    { price: 66671.1, amount: 0.020283 },
    { price: 66653.0, amount: 0.020873 },
    { price: 66688.3, amount: 0.020873 },
    { price: 66680.2, amount: 0.098272 },
    { price: 66673.0, amount: 0.020883 },
  ];
  const buyOrders =  [
    { price: 66673.6, amount: 0.080000 },
    { price: 66673.2, amount: 0.020873 },
    { price: 66663.0, amount: 0.020873 },
    { price: 66681.3, amount: 0.020873 },
    { price: 66680.1, amount: 0.020873 },
    { price: 66683.8, amount: 0.020873 },
    { price: 66686.3, amount: 0.020873 },
    { price: 66673.4, amount: 0.020873 },
  ];

  // Only show 6 sell (top) and 6 buy (bottom) orders
  const topSellOrders = sellOrders.slice(0, 6);
  const bottomBuyOrders = buyOrders.slice(0, 6);

  // Cumulative size calculation
  const sellCumulative = topSellOrders.reduce((acc, order, idx) => {
    acc.push((acc[idx - 1] || 0) + order.amount);
    return acc;
  }, [] as number[]);
  const buyCumulative = bottomBuyOrders.reduce((acc, order, idx) => {
    acc.push((acc[idx - 1] || 0) + order.amount);
    return acc;
  }, [] as number[]);

  // Find max order amount for depth bar scaling
  const maxSellAmount = Math.max(...topSellOrders.map(o => o.amount), 1);
  const maxBuyAmount = Math.max(...bottomBuyOrders.map(o => o.amount), 1);

  // Best bid/ask
  const bestBid = Math.max(...bottomBuyOrders.map(o => o.price));
  const bestAsk = Math.min(...topSellOrders.map(o => o.price));

  // Animate price row flash
  useEffect(() => {
    const currentPrice = 66673.4;
    if (currentPrice !== lastPrice) {
      setPriceFlash(true);
      setTimeout(() => setPriceFlash(false), 350);
      setLastPrice(currentPrice);
    }
  }, [lastPrice]);

  return (
    <div
      ref={containerRef}
      className="bg-gray-900 border border-gray-800 rounded flex flex-col h-full"
    >
      {/* Header */}
      <div className="border-b border-gray-800 p-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <List className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
            <Grid3X3 className="w-3 h-3 text-blue-400 cursor-pointer" />
            <BarChart3 className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">0.1</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>Price</span>
          <span>Amount</span>
          <span>Cumulative</span>
        </div>
      </div>

      {/* Main Content: Orders and Sentiment Bar */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Order List (scrollable) */}
        <div className="flex-1 overflow-y-auto px-2 pt-2 pb-2">
          {/* Sell Orders (top, red) */}
          {topSellOrders.map((order, idx) => {
            const isBestAsk = order.price === bestAsk;
            const depthWidth = (order.amount / maxSellAmount) * 100;
            return (
              <div
                key={"sell-" + idx}
                className={`relative flex justify-between items-center text-[11px] font-mono leading-tight mb-1 px-2 py-1 rounded transition-all duration-200 hover:bg-gray-800/50 ${
                  isBestAsk 
                    ? 'ring-1 ring-yellow-400 bg-yellow-900/20 shadow-sm' 
                    : ''
                }`}
                style={{ overflow: 'hidden' }}
              >
                {/* Depth bar */}
                <div
                  className="absolute left-0 top-0 h-full bg-red-900/30 rounded"
                  style={{ width: `${depthWidth}%` }}
                />
                <div className="flex items-center space-x-1 z-10">
                  <span className="text-red-400">
                    {order.price.toFixed(1)}
                  </span>
                  {isBestAsk && (
                    <Star 
                      className="w-3 h-3 text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition-transform" 
                    />
                  )}
                </div>
                <span className="text-gray-400 z-10">{order.amount.toFixed(6)}</span>
                <span className="text-gray-500 z-10">{sellCumulative[idx].toFixed(6)}</span>
              </div>
            );
          })}

          {/* Current Price Row (center, animated) */}
          <div
            className={`flex justify-between items-center text-[12px] font-mono font-bold bg-gray-800 rounded my-3 py-2 px-3 border border-blue-500 transition-colors duration-300 ${
              priceFlash ? 'bg-blue-700/80 border-blue-400' : ''
            }`}
          >
            <span className="text-blue-400">Current</span>
            <span className="text-white text-sm">{(66673.4).toFixed(1)}</span>
            <span className="text-blue-400">Price</span>
          </div>

          {/* Buy Orders (bottom, green) */}
          {bottomBuyOrders.map((order, idx) => {
            const isBestBid = order.price === bestBid;
            const depthWidth = (order.amount / maxBuyAmount) * 100;
            return (
              <div
                key={"buy-" + idx}
                className={`relative flex justify-between items-center text-[11px] font-mono leading-tight mb-1 px-2 py-1 rounded transition-all duration-200 hover:bg-gray-800/50 ${
                  isBestBid 
                    ? 'ring-1 ring-yellow-400 bg-yellow-900/20 shadow-sm' 
                    : ''
                }`}
                style={{ overflow: 'hidden' }}
              >
                {/* Depth bar */}
                <div
                  className="absolute left-0 top-0 h-full bg-green-900/30 rounded"
                  style={{ width: `${depthWidth}%` }}
                />
                <div className="flex items-center space-x-1 z-10">
                  <span className="text-green-500">
                    {order.price.toFixed(1)}
                  </span>
                  {isBestBid && (
                    <Star 
                      className="w-3 h-3 text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition-transform" 
                    />
                  )}
                </div>
                <span className="text-gray-400 z-10">{order.amount.toFixed(6)}</span>
                <span className="text-gray-500 z-10">{buyCumulative[idx].toFixed(6)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
