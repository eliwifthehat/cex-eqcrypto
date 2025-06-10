import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, MoreHorizontal, List, Grid3X3, BarChart3, ChevronDown } from "lucide-react";
import { useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrderBook() {
  // Log order book container width
  const containerRef = useRef<HTMLDivElement>(null);
  
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
          <span>Price (USDT)</span>
          <span>Amount (BTC)</span>
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
          {buyOrders.slice(0, 8).map((order, index) => (
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
      </div>
    </div>
  );
}
