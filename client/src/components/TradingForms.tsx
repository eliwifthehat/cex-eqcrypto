import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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
    <div className="bg-gray-900 border border-gray-800 rounded">
      {/* Trading Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button className="flex-1 px-4 py-3 text-center text-white bg-green-600 hover:bg-green-700 transition-colors">
            Buy
          </button>
          <button className="flex-1 px-4 py-3 text-center text-white bg-red-600 hover:bg-red-700 transition-colors">
            Sell
          </button>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex space-x-1 bg-gray-800 rounded p-1">
          <button className="flex-1 px-3 py-2 text-white bg-gray-700 rounded text-sm">
            Limit
          </button>
          <button className="flex-1 px-3 py-2 text-gray-400 hover:text-white text-sm">
            Market
          </button>
          <button className="flex-1 px-3 py-2 text-gray-400 hover:text-white text-sm">
            Advanced limit
          </button>
        </div>
      </div>

      {/* Trading Form */}
      <div className="p-4 space-y-4">
        {/* Price Input */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Price</label>
          <div className="relative">
            <input
              type="text"
              value="732.96 USDT"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              readOnly
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
              <span className="text-xs">USDT ▼</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Amount</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Amount"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
              <span className="text-xs">BTC ▼</span>
            </button>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-sm">
            25%
          </button>
          <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-sm">
            50%
          </button>
          <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-sm">
            75%
          </button>
          <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-sm">
            100%
          </button>
        </div>

        {/* Total */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Total</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Total"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>

        {/* Buy Button */}
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded transition-colors">
          Buy BTC
        </button>

        {/* Fees */}
        <div className="text-center">
          <span className="text-gray-400 text-xs">⚡ Fees</span>
        </div>
      </div>

      {/* Assets Section */}
      <div className="border-t border-gray-800 p-4">
        <h3 className="text-white font-medium mb-3">Assets</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Trading account</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">BTC</span>
            <span className="text-white text-sm">0.0273.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
