import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, MoreHorizontal } from "lucide-react";

export default function OrderBook() {
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
    <div className="bg-gray-900 border border-gray-800 rounded h-full">
      {/* Header */}
      <div className="border-b border-gray-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium text-sm">Price (USDT)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium text-sm">Amount (BTC)</span>
          </div>
        </div>
      </div>

      {/* Order book content */}
      <div className="p-3 h-[500px] overflow-hidden">
        {/* Sell orders (red) */}
        <div className="space-y-1">
          {sellOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-center text-sm hover:bg-gray-800 px-2 py-1 rounded">
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
        <div className="flex items-center justify-center py-4 my-4 border-y border-gray-800">
          <div className="text-center">
            <div className="text-white text-lg font-bold">
              66,800.0 <span className="text-red-400 text-sm ml-2">↓ +66,790.07</span>
            </div>
          </div>
        </div>

        {/* Buy orders (green) */}
        <div className="space-y-1">
          {buyOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-center text-sm hover:bg-gray-800 px-2 py-1 rounded">
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
