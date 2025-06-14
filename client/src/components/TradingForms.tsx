import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";

export default function TradingForms() {
  const [tradeMode, setTradeMode] = useState("buy"); // 'buy' or 'sell'
  const [orderType, setOrderType] = useState("limit"); // 'limit', 'market', 'advanced'
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Mock user balance data
  const userBalance = {
    USDT: "12,450.67",
    BTC: "0.0273"
  };
  

  
  // Log trading forms container width
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      console.log(`TradingForms container width: ${containerRef.current.clientWidth}px`);
    }
  }, []);

  const handleOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: `${tradeMode === 'buy' ? 'Buy' : 'Sell'} Order Placed`,
      description: `${orderType} ${tradeMode} order for ${amount} BTC has been placed`,
    });
    setAmount("");
    setPrice("");
    setTotal("");
  };

  const handlePercentageClick = (percentage: string) => {
    const availableBalance = tradeMode === 'buy' ? 
      parseFloat(userBalance.USDT.replace(/,/g, '')) : 
      parseFloat(userBalance.BTC);
    
    const percentValue = parseInt(percentage) / 100;
    const calculatedAmount = (availableBalance * percentValue).toString();
    setAmount(calculatedAmount);
  };

  return (
    <div ref={containerRef} className="bg-gray-900 border border-gray-800 rounded h-fit">
      {/* Top Navigation Buttons */}
      <div className="border-b border-gray-800 p-1">
        <div className="flex space-x-1 mb-2">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded">Trade</button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 hover:text-white text-sm rounded">Spot</button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 hover:text-white text-sm rounded">Futures</button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 hover:text-white text-sm rounded">More</button>
        </div>
        
        {/* Buy/Sell Toggle */}
        <div className="flex rounded-lg overflow-hidden">
          <button 
            onClick={() => setTradeMode('buy')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tradeMode === 'buy' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button 
            onClick={() => setTradeMode('sell')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tradeMode === 'sell' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Order Type Buttons */}
        <div className="space-y-2">
          <div className="flex space-x-1">
            <button 
              onClick={() => setOrderType('limit')}
              className={`px-3 py-1 text-xs rounded transition-colors relative ${
                orderType === 'limit' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Limit
              {orderType === 'limit' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => setOrderType('market')}
              className={`px-3 py-1 text-xs rounded transition-colors relative ${
                orderType === 'market' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Market
              {orderType === 'market' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => setOrderType('advanced')}
              className={`px-3 py-1 text-xs rounded transition-colors relative ${
                orderType === 'advanced' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Advanced Limit
              {orderType === 'advanced' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Price Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '8px' }} className="text-gray-400">Price</span>
            <span style={{ fontSize: '8px' }} className="text-gray-400">{userBalance.USDT} USDT</span>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-xs pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">USDT</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-xs pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">BTC</span>
          </div>
        </div>

        {/* Percentage Buttons - Centered */}
        <div className="flex justify-center space-x-2">
          {["25%", "50%", "75%", "100%"].map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePercentageClick(percentage)}
              className="px-3 py-1 bg-gray-800 text-gray-400 hover:text-white text-xs rounded border border-gray-700 hover:border-gray-600"
            >
              {percentage}
            </button>
          ))}
        </div>

        {/* Total Input */}
        <div className="space-y-1">
          <span style={{ fontSize: '8px' }} className="text-gray-400">Total</span>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-xs"
            />
          </div>
        </div>

        {/* Buy/Sell Button */}
        <Button 
          onClick={handleOrder}
          className={`w-full text-xs py-2 font-medium ${
            tradeMode === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {tradeMode === 'buy' ? 'BUY BTC' : 'SELL BTC'}
        </Button>

        {/* Fees */}
        <div className="text-xs text-gray-400 text-center">
          0.1% FEES
        </div>
      </div>
    </div>
  );
}