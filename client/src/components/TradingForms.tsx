import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";

export default function TradingForms() {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [orderType, setOrderType] = useState("Market");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Log trading forms container width
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      console.log(`TradingForms container width: ${containerRef.current.clientWidth}px`);
    }
  }, []);

  const handleBuyOrder = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Buy Order Placed",
      description: `Market buy order for ${buyAmount} BTC has been placed`,
    });
    setBuyAmount("");
  };

  const handleSellOrder = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a valid amount to sell",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Sell Order Placed",
      description: `Market sell order for ${sellAmount} BTC has been placed`,
    });
    setSellAmount("");
  };

  const percentageButtons = ["25%", "50%", "75%", "100%"];

  return (
    <div ref={containerRef} className="bg-gray-900 border border-gray-800 rounded h-fit">
      {/* Trading Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button className="flex-1 px-2 py-2 text-center text-white bg-green-600 hover:bg-green-700 transition-colors text-xs">
            Buy
          </button>
          <button className="flex-1 px-2 py-2 text-center text-white bg-red-600 hover:bg-red-700 transition-colors text-xs">
            Sell
          </button>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="border-b border-gray-800 p-2">
        <div className="flex space-x-1 bg-gray-800 rounded p-1">
          <button className="flex-1 px-2 py-1 text-white bg-gray-700 rounded text-xs">
            Limit
          </button>
          <button className="flex-1 px-2 py-1 text-gray-400 hover:text-white text-xs">
            Market
          </button>
        </div>
      </div>

      {/* Trading Form */}
      <div className="p-3 space-y-3">
        {/* Price Input */}
        <div>
          <label className="block text-gray-400 text-xs mb-1">Price</label>
          <input
            type="text"
            value="66,800"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
            readOnly
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-gray-400 text-xs mb-1">Amount</label>
          <input
            type="text"
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs placeholder-gray-500"
          />
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-1">
          <button className="px-1 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-xs">
            25%
          </button>
          <button className="px-1 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-xs">
            50%
          </button>
          <button className="px-1 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-xs">
            75%
          </button>
          <button className="px-1 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-xs">
            MAX
          </button>
        </div>

        {/* Total */}
        <div>
          <label className="block text-gray-400 text-xs mb-1">Total</label>
          <input
            type="text"
            placeholder="0.00 USDT"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs placeholder-gray-500"
          />
        </div>

        {/* Buy Button */}
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded transition-colors text-xs">
          Buy BTC
        </button>

        {/* Available Balance */}
        <div className="text-center text-gray-400 text-xs">
          Available: 0.00 USDT
        </div>
      </div>
    </div>
  );
}
