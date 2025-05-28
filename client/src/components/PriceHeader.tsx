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
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Trading Pair Selector and Price */}
        <div className="flex items-center space-x-6">
          <Select value={selectedPair} onValueChange={onPairChange}>
            <SelectTrigger className="w-40 bg-card border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
              <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
              <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-foreground">
              {formatPrice(priceData.currentPrice)}
            </div>
            <div className={`text-sm font-medium ${isPositive ? 'crypto-green' : 'crypto-red'}`}>
              {change} {percent}
            </div>
          </div>
        </div>
        
        {/* 24H Stats */}
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <div className="text-muted-foreground">24H High</div>
            <div className="font-semibold text-foreground">
              {formatPrice(priceData.high24h)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">24H Low</div>
            <div className="font-semibold text-foreground">
              {formatPrice(priceData.low24h)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
