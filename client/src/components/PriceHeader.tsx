import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePriceSimulation } from "@/hooks/use-price-simulation";
import { Settings, Layout, TrendingUp, Wifi } from "lucide-react";

interface PriceHeaderProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
}

export default function PriceHeader({ selectedPair, onPairChange }: PriceHeaderProps) {
  const priceData = usePriceSimulation();

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPriceChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    return {
      change: `${sign}${formatPrice(Math.abs(change))}`,
      percent: `(${sign}${percent.toFixed(2)}%)`,
      isPositive
    };
  };

  const { change, percent, isPositive } = formatPriceChange(priceData.priceChange, priceData.priceChangePercent);

  return (
    <div className="bg-gray-900 border-b border-gray-800 py-4 mt-16 relative">
      <div className="flex items-center justify-between">
        {/* Left side - Trading pair and price info */}
        <div className="flex items-center space-x-4 px-6">
          {/* Bitcoin Icon and Pair */}
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.08.64-.48 1.28-1.28 1.52-.24.08-.56.16-.88.16v.88c0 .32-.24.56-.56.56s-.56-.24-.56-.56v-.88h-.88v.88c0 .32-.24.56-.56.56s-.56-.24-.56-.56v-.88H9.52c-.32 0-.56-.24-.56-.56s.24-.56.56-.56h.32v-3.04H9.52c-.32 0-.56-.24-.56-.56s.24-.56.56-.56h2.88v-.88c0-.32.24-.56.56-.56s.56.24.56.56v.88h.88v-.88c0-.32.24-.56.56-.56s.56.24.56.56v.88c.32 0 .64.08.88.16.8.24 1.2.88 1.28 1.52z" fill="#F7931A"/>
            </svg>
            <span className="text-white font-medium" style={{ fontSize: '14px' }}>BTC/USDT</span>
          </div>

          {/* Price */}
          <div className="text-white font-bold" style={{ fontSize: '18px' }}>
            ${priceData.currentPrice.toLocaleString()}
          </div>

          {/* 24h Change */}
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span style={{ fontSize: '12px' }}>{change}</span>
            <span style={{ fontSize: '12px' }}>({percent})</span>
          </div>

          {/* 24h Stats */}
          <div className="flex items-center" style={{ fontSize: '12px' }}>
            <div className="text-gray-400 px-3">
              <span className="block">24h High</span>
              <span className="text-white">${priceData.high24h.toLocaleString()}</span>
            </div>
            <div className="text-gray-400 px-3">
              <span className="block">24h Low</span>
              <span className="text-white">${priceData.low24h.toLocaleString()}</span>
            </div>
            <div className="text-gray-400 px-3">
              <span className="block">24h Volume (BTC)</span>
              <span className="text-white">1.93K</span>
            </div>
            <div className="text-gray-400 px-3">
              <span className="block">24h Volume (USDT)</span>
              <span className="text-white">129.09M</span>
            </div>
          </div>
        </div>
      
        {/* Right side control icons - positioned at right edge with no padding */}
        <div className="flex items-center space-x-3 pr-0">
          {/* Connection Strength */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-green-400" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Short divider */}
          <div className="h-4 w-px bg-gray-600"></div>
          
          {/* Trading Info */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Trading Info</span>
          </div>
          
          {/* Short divider */}
          <div className="h-4 w-px bg-gray-600"></div>
          
          {/* Layout icon */}
          <Layout className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
          
          {/* Settings cog */}
          <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Horizontal divider under BTC/USDT pair */}
      <div className="border-t border-gray-700 mt-2 pt-2 px-6">
        {/* Chart navigation buttons positioned under the pair */}
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
            Chart
          </button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
            Depth
          </button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
            Overview
          </button>
        </div>
      </div>
    </div>
  );
}
