import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePriceSimulation } from "@/hooks/use-price-simulation";

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
    <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Trading pair and price info */}
        <div className="flex items-center space-x-4">
          {/* Bitcoin Icon and Pair */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-white font-semibold text-lg">BTC/USDT</span>
              <div className="w-4 h-4 border border-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs">?</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <div className="text-white text-2xl font-bold">
              66,800.0
            </div>
            <div className="text-red-400 text-sm">
              -0.49% +44.4
            </div>
          </div>

          {/* 24h Stats */}
          <div className="flex space-x-8 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-400">24h High</span>
              <span className="text-white font-medium">67,458.8</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">24h Low</span>
              <span className="text-white font-medium">65,807.8</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">24h Amount (BTC)</span>
              <span className="text-white font-medium">1.93K</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">24h Volume (USDT)</span>
              <span className="text-white font-medium">129.09M</span>
            </div>
          </div>
        </div>

        {/* Right side - Chart/Order book tabs */}
        <div className="flex items-center space-x-6">
          <div className="flex space-x-1 bg-gray-800 rounded p-1">
            <button className="px-4 py-2 text-white bg-gray-700 rounded text-sm">Chart</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">Depth</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">Overview</button>
          </div>
          
          <div className="flex space-x-1 bg-gray-800 rounded p-1">
            <button className="px-4 py-2 text-white bg-gray-700 rounded text-sm">Order book</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">Recent Trades</button>
          </div>
        </div>
      </div>
    </div>
  );
}
