import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, BarChart3, Zap, FileText, Loader2, Clock, Lock } from "lucide-react";
import { estimateFillTime, calculateMarketConditions, OrderBookEntry, FillTimeEstimate } from "@/lib/fillTimeEstimator";
import FillTimeDisplay from "@/components/FillTimeDisplay";
import { usePriceSimulation } from "@/hooks/use-price-simulation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradingFormsProps {
  selectedPair?: string;
  tradeMode?: 'buy' | 'sell';
  onTradeModeChange?: (mode: 'buy' | 'sell') => void;
}

export default function TradingForms({ 
  selectedPair = "BTC/USDT", 
  tradeMode = "buy", 
  onTradeModeChange 
}: TradingFormsProps) {
  const [internalTradeMode, setInternalTradeMode] = useState(tradeMode);
  
  // Use external tradeMode if provided, otherwise use internal state
  const currentTradeMode = onTradeModeChange ? tradeMode : internalTradeMode;
  const setCurrentTradeMode = onTradeModeChange || setInternalTradeMode;
  const [orderType, setOrderType] = useState("limit"); // 'limit', 'market'
  
  // Form state
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [volume, setVolume] = useState("");
  const [total, setTotal] = useState("");
  
  // Validation states
  const [limitPriceError, setLimitPriceError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [volumeError, setVolumeError] = useState("");
  const [totalError, setTotalError] = useState("");
  
  // Loading state for order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Parse selected pair to get base and quote tokens
  const [baseToken, quoteToken] = selectedPair.split('/');
  
  // Mock user balance data - dynamically based on selected pair
  const userBalance = useMemo(() => {
    const balances = {
      "BTC/USDT": { USDT: "12,450.67", BTC: "0.0273" },
      "ETH/USDT": { USDT: "12,450.67", ETH: "2.45" },
      "SOL/USDT": { USDT: "12,450.67", SOL: "125.8" }
    };
    return balances[selectedPair as keyof typeof balances] || balances["BTC/USDT"];
  }, [selectedPair]);

  // Get live price data
  const priceData = usePriceSimulation(66673.4);
  const currentPrice = priceData.currentPrice;

  // Calculate total based on inputs
  useEffect(() => {
    if (orderType === 'limit') {
      // For limit orders: total = limitPrice * amount
      if (limitPrice && amount) {
        const price = parseFloat(limitPrice);
        const amountValue = parseFloat(amount);
        if (!isNaN(price) && !isNaN(amountValue)) {
          const calculatedTotal = (price * amountValue).toFixed(2);
          setTotal(calculatedTotal);
        }
      }
    } else if (orderType === 'market') {
      // For market orders: total = volume (user types USDT amount)
      if (volume) {
        setTotal(volume);
      }
    }
  }, [limitPrice, amount, volume, orderType]);

  // Calculate volume for limit orders when amount changes
  useEffect(() => {
    if (orderType === 'limit' && limitPrice && amount) {
      const price = parseFloat(limitPrice);
      const amountValue = parseFloat(amount);
      if (!isNaN(price) && !isNaN(amountValue)) {
        const calculatedVolume = (price * amountValue).toFixed(2);
        setVolume(calculatedVolume);
      }
    }
  }, [limitPrice, amount, orderType]);

  // Calculate amount for limit orders when volume changes
  useEffect(() => {
    if (orderType === 'limit' && limitPrice && volume) {
      const price = parseFloat(limitPrice);
      const volumeValue = parseFloat(volume);
      if (!isNaN(price) && !isNaN(volumeValue)) {
        const calculatedAmount = (volumeValue / price).toFixed(8);
        setAmount(calculatedAmount);
      }
    }
  }, [limitPrice, volume, orderType]);

  // Calculate amount for market orders
  useEffect(() => {
    if (orderType === 'market' && volume && currentPrice) {
      const volumeValue = parseFloat(volume);
      if (!isNaN(volumeValue)) {
        const calculatedAmount = (volumeValue / currentPrice).toFixed(8);
        setAmount(calculatedAmount);
      }
    }
  }, [volume, currentPrice, orderType]);

  const handleOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place orders.",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs based on order type
    if (orderType === 'limit') {
      if (!limitPrice || !amount || !total) {
        toast({
          title: "Invalid Input",
          description: "Please fill in all required fields for limit order.",
          variant: "destructive",
        });
        return;
      }
    } else if (orderType === 'market') {
      if (!volume || !total) {
        toast({
          title: "Invalid Input",
          description: "Please fill in the volume for market order.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Order Submitted",
        description: `${currentTradeMode.toUpperCase()} ${orderType} order placed successfully!`,
      });
      
      // Reset form
      setLimitPrice("");
      setAmount("");
      setVolume("");
      setTotal("");
      
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageClick = (percentage: string) => {
    const percent = parseFloat(percentage) / 100;
    const balance = currentTradeMode === 'buy' 
      ? parseFloat(userBalance[quoteToken as keyof typeof userBalance].replace(',', ''))
      : parseFloat(userBalance[baseToken as keyof typeof userBalance].replace(',', ''));
    
    if (orderType === 'limit') {
      // For limit orders, calculate amount based on percentage of balance
      const calculatedAmount = (balance * percent / parseFloat(limitPrice || currentPrice.toString())).toFixed(8);
      setAmount(calculatedAmount);
    } else if (orderType === 'market') {
      // For market orders, calculate volume based on percentage of balance
      const calculatedVolume = (balance * percent).toFixed(2);
      setVolume(calculatedVolume);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded h-fit">
      {/* Top Navigation Buttons */}
      <div className="border-b border-gray-800 p-2">
        <div className="flex space-x-2 mb-3">
          <button className="px-3 py-2 bg-blue-600 text-white text-xs rounded-md flex items-center gap-1.5 shadow-sm">
            <BarChart3 className="w-3 h-3" />
            Trade
          </button>
          <button className="px-3 py-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 text-xs rounded-md flex items-center gap-1.5 transition-colors">
            <Zap className="w-3 h-3" />
            Spot
          </button>
          <button className="px-3 py-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 text-xs rounded-md flex items-center gap-1.5 transition-colors">
            <FileText className="w-3 h-3" />
            Futures
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Type Buttons */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button 
              onClick={() => setOrderType('limit')}
              className={`px-4 py-2 text-xs rounded-md transition-colors relative ${
                orderType === 'limit' 
                  ? 'text-white bg-gray-700 shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Limit Orders
              {orderType === 'limit' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => setOrderType('market')}
              className={`px-4 py-2 text-xs rounded-md transition-colors relative ${
                orderType === 'market' 
                  ? 'text-white bg-gray-700 shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Market
              {orderType === 'market' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>



        {/* Limit Order Form */}
        {orderType === 'limit' && (
          <>
            {/* Limit Price Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Limit USDT</span>
                <span className="text-xs text-gray-400">{currentPrice.toFixed(2)}</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Limit USDT"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="bg-gray-800 text-white text-xs pr-12 border-gray-700"
                />
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={`Amount (${baseToken})`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-800 text-white text-xs pr-12 border-gray-700"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">{baseToken}</span>
              </div>
            </div>

            {/* Volume (USDT) - User input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Volume (USDT)"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="bg-gray-800 text-white text-xs pr-12 border-gray-700"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">USDT</span>
              </div>
            </div>

            {/* Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {["25%", "50%", "75%", "100%"].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handlePercentageClick(percentage)}
                  className="px-2 py-2 bg-gray-800 text-gray-400 hover:text-white text-xs rounded-md border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  {percentage}
                </button>
              ))}
            </div>

            {/* Total - Auto-calculated */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400">Total</span>
              <div className="relative">
                <Input
                  type="number"
                  value={total}
                  readOnly
                  className="bg-gray-800 text-white text-xs border-gray-700"
                />
              </div>
            </div>
          </>
        )}

        {/* Market Order Form */}
        {orderType === 'market' && (
          <>
            {/* Market Price - Locked */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="number"
                  value={currentPrice.toFixed(2)}
                  readOnly
                  className="bg-gray-800 text-white text-xs pr-12 border-gray-700"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
              </div>
            </div>

            {/* Volume (USDT) - User input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Volume (USDT)"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="bg-gray-800 text-white text-xs pr-12 border-gray-700"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">USDT</span>
              </div>
            </div>

            {/* Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {["25%", "50%", "75%", "100%"].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handlePercentageClick(percentage)}
                  className="px-2 py-2 bg-gray-800 text-gray-400 hover:text-white text-xs rounded-md border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  {percentage}
                </button>
              ))}
            </div>

            {/* Total - Auto-calculated */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400">Total</span>
              <div className="relative">
                <Input
                  type="number"
                  value={total}
                  readOnly
                  className="bg-gray-800 text-white text-xs border-gray-700"
                />
              </div>
            </div>
          </>
        )}



        {/* Fees */}
        <div className="text-xs text-gray-400 text-center">
          0.1% FEES
        </div>
      </div>
    </div>
  );
}