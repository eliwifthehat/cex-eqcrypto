import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export default function MobileTradingForms() {
  const [tradeMode, setTradeMode] = useState("buy");
  const [orderType, setOrderType] = useState("limit");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userBalance = {
    USDT: "12,450.67",
    BTC: "0.0273"
  };

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
    <div className="space-y-3">
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

      {/* Order Type */}
      <div className="flex space-x-1">
        <button 
          onClick={() => setOrderType('limit')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            orderType === 'limit' 
              ? 'text-white bg-gray-700' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Limit
        </button>
        <button 
          onClick={() => setOrderType('market')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            orderType === 'market' 
              ? 'text-white bg-gray-700' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Market
        </button>
      </div>

      {/* Price Input */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Price</span>
          <span className="text-gray-400 text-xs">{userBalance.USDT} USDT</span>
        </div>
        <Input
          type="number"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white text-xs h-8"
        />
      </div>

      {/* Amount Input */}
      <div className="space-y-1">
        <span className="text-gray-400 text-xs">Amount</span>
        <Input
          type="number"
          placeholder="0.00000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white text-xs h-8"
        />
      </div>

      {/* Percentage Buttons */}
      <div className="grid grid-cols-4 gap-1">
        {["25%", "50%", "75%", "100%"].map((percentage) => (
          <button
            key={percentage}
            onClick={() => handlePercentageClick(percentage)}
            className="py-1 bg-gray-800 text-gray-400 hover:text-white text-xs rounded border border-gray-700 hover:border-gray-600"
          >
            {percentage}
          </button>
        ))}
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
    </div>
  );
}