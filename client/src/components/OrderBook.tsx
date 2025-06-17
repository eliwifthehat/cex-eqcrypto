import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, MoreHorizontal, List, Grid3X3, BarChart3, ChevronDown } from "lucide-react";
import { useRef, useEffect, useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrderBook() {
  // Log order book container width
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedBuyPercentage, setAnimatedBuyPercentage] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    if (containerRef.current) {
      console.log(`OrderBook container width: ${containerRef.current.clientWidth}px`);
    }
  }, []);

  // Real order book data structure matching the reference
  const sellOrders = [
    { price: 66683.1, amount: 0.088268 },
    { price: 66682.1, amount: 0.082093 },
    { price: 66671.1, amount: 0.020283 },
    { price: 66653.0, amount: 0.020873 },
    { price: 66688.3, amount: 0.020873 },
    { price: 66680.2, amount: 0.098272 },
    { price: 66673.0, amount: 0.020883 },
  ];

  const buyOrders = [
    { price: 66673.6, amount: 0.080000 },
    { price: 66673.2, amount: 0.020873 },
    { price: 66663.0, amount: 0.020873 },
    { price: 66681.3, amount: 0.020873 },
    { price: 66680.1, amount: 0.020873 },
    { price: 66683.8, amount: 0.020873 },
    { price: 66686.3, amount: 0.020873 },
    { price: 66673.4, amount: 0.020873 },
  ];

  // Calculate buy/sell sentiment dynamically
  const sentimentData = useMemo(() => {
    const totalBuyVolume = buyOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalSellVolume = sellOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalVolume = totalBuyVolume + totalSellVolume;
    
    const buyPercentage = totalVolume > 0 ? (totalBuyVolume / totalVolume) * 100 : 0;
    const sellPercentage = totalVolume > 0 ? (totalSellVolume / totalVolume) * 100 : 0;
    
    return {
      buyPercentage: Number(buyPercentage.toFixed(2)),
      sellPercentage: Number(sellPercentage.toFixed(2)),
      totalBuyVolume: Number(totalBuyVolume.toFixed(6)),
      totalSellVolume: Number(totalSellVolume.toFixed(6)),
      currentPrice: 66673.4
    };
  }, [buyOrders, sellOrders]);

  // Animate percentage changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedBuyPercentage(sentimentData.buyPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [sentimentData.buyPercentage]);

  return (
    <div ref={containerRef} className="bg-gray-900 border border-gray-800 rounded h-full">
      {/* Header */}
      <div className="border-b border-gray-800 p-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            {/* View control icons */}
            <List className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
            <Grid3X3 className="w-3 h-3 text-blue-400 cursor-pointer" />
            <BarChart3 className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer" />
          </div>
          
          {/* Size dropdown */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">0.1</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>Price</span>
          <span>Amount</span>
        </div>
      </div>

      {/* Order book content */}
      <div className="p-2 h-[400px] overflow-hidden">
        {/* Sell orders (red) */}
        <div className="space-y-0.5">
          {sellOrders.slice(0, 8).map((order, index) => (
            <div key={index} className="flex justify-between items-center text-xs hover:bg-gray-800 px-1 py-0.5 rounded">
              <span className="text-red-400 font-mono">
                {order.price.toFixed(1)}
              </span>
              <span className="text-white font-mono">
                {order.amount.toFixed(6)}
              </span>
            </div>
          ))}
        </div>

        {/* Current price */}
        <div className="flex items-center justify-center py-2 my-2 border-y border-gray-800">
          <div className="text-center">
            <div className="text-white text-sm font-bold">
              66,800.0
            </div>
            <div className="text-red-400 text-xs">↓ 0.12%</div>
          </div>
        </div>

        {/* Buy orders (green) */}
        <div className="space-y-0.5">
          {buyOrders.slice(0, 6).map((order, index) => (
            <div key={index} className="flex justify-between items-center text-xs hover:bg-gray-800 px-1 py-0.5 rounded">
              <span className="text-green-400 font-mono">
                {order.price.toFixed(1)}
              </span>
              <span className="text-white font-mono">
                {order.amount.toFixed(6)}
              </span>
            </div>
          ))}
        </div>

        {/* Buy/Sell Ratio Indicator */}
        <div className="mt-3 p-2 bg-gray-800 rounded relative">
          {/* Price and Volume Display */}
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-green-400 font-mono font-medium">
              {sentimentData.currentPrice.toLocaleString()}
            </span>
            <div className="flex space-x-3 text-gray-300 font-mono">
              <span>{sentimentData.totalBuyVolume}</span>
              <span>{sentimentData.totalSellVolume}</span>
            </div>
          </div>
          
          {/* Ratio Bar */}
          <div 
            className="flex items-center space-x-2 relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Buy Button */}
            <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            
            {/* Progress Bar with smooth animation */}
            <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
              <div className="h-full flex transition-all duration-500 ease-in-out">
                <div 
                  className="bg-green-500 h-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${animatedBuyPercentage || sentimentData.buyPercentage}%` }}
                ></div>
                <div 
                  className="bg-red-500 h-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${100 - (animatedBuyPercentage || sentimentData.buyPercentage)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Sell Button */}
            <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <div>Buy Volume: {sentimentData.totalBuyVolume} BTC</div>
                <div>Sell Volume: {sentimentData.totalSellVolume} BTC</div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-black/90"></div>
              </div>
            )}
          </div>
          
          {/* Percentage Labels */}
          <div className="flex justify-between mt-1 text-xs">
            <span className="text-green-400 font-medium">
              {sentimentData.buyPercentage}%
            </span>
            <span className="text-red-400 font-medium">
              {sentimentData.sellPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
