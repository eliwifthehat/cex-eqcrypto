import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, MoreHorizontal } from "lucide-react";
import { usePriceSimulation } from "@/hooks/use-price-simulation";

export default function OrderBook() {
  const priceData = usePriceSimulation();

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Mock order book data
  const sellOrders = [
    { price: 42354.00, size: 42354.00 },
    { price: 42353.50, size: 42353.90 },
    { price: 42353.00, size: 42353.00 },
    { price: 42352.00, size: 42352.90 },
    { price: 42352.50, size: 42352.50 },
    { price: 42352.00, size: 42352.00 },
  ];

  const buyOrders = [
    { price: 42349.50, size: 42349.50 },
    { price: 42349.00, size: 42349.00 },
    { price: 42348.50, size: 42348.50 },
    { price: 42348.00, size: 42348.00 },
    { price: 42347.50, size: 42347.50 },
    { price: 42347.00, size: 42347.00 },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Order Book</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-crypto-red hover:bg-muted">
              <span className="transform rotate-180">▲</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-crypto-green hover:bg-muted">
              ▲
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Order Book Headers */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3 font-medium px-2">
          <div className="text-right">Price (USDT)</div>
          <div className="text-right">Size ◊</div>
        </div>
        
        {/* Sell Orders (Red) */}
        <div className="space-y-1 mb-3">
          {sellOrders.map((order, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 text-sm hover:bg-muted rounded px-2 py-1 transition-colors cursor-pointer">
              <div className="text-right crypto-red font-mono">
                {formatPrice(order.price)}
              </div>
              <div className="text-right text-foreground font-mono">
                {formatPrice(order.size)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Spread Indicator */}
        <div className="text-center py-2 border-y border-border">
          <div className="text-lg font-bold font-mono text-foreground">
            {formatPrice(priceData.currentPrice)}
          </div>
          <div className="text-xs text-muted-foreground">
            ≈ ${formatPrice(priceData.currentPrice)}
          </div>
        </div>
        
        {/* Buy Orders (Green) */}
        <div className="space-y-1 mt-3">
          {buyOrders.map((order, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 text-sm hover:bg-muted rounded px-2 py-1 transition-colors cursor-pointer">
              <div className="text-right crypto-green font-mono">
                {formatPrice(order.price)}
              </div>
              <div className="text-right text-foreground font-mono">
                {formatPrice(order.size)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
