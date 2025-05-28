import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TradingChartProps {
  selectedPair: string;
}

export default function TradingChart({ selectedPair }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("1h");

  const timeframes = [
    { label: "1h", value: "1h" },
    { label: "4h", value: "4h" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
  ];

  // Mock candlestick data
  const mockCandles = [
    { price: 42100, isPositive: false, height: 16 },
    { price: 42150, isPositive: true, height: 20 },
    { price: 42080, isPositive: false, height: 12 },
    { price: 42200, isPositive: true, height: 24 },
    { price: 42280, isPositive: true, height: 28 },
    { price: 42240, isPositive: false, height: 18 },
    { price: 42350, isPositive: true, height: 32 },
    { price: 42320, isPositive: true, height: 26 },
    { price: 42280, isPositive: false, height: 22 },
    { price: 42360, isPositive: true, height: 30 },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {selectedPair} {timeframe}
          </CardTitle>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className={timeframe === tf.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-background rounded border border-border p-4 relative overflow-hidden">
          {/* Mock Chart Area */}
          <div className="absolute inset-0 flex items-end justify-center space-x-1 p-4">
            {mockCandles.map((candle, index) => (
              <div
                key={index}
                className={`w-2 ${candle.isPositive ? 'bg-crypto-green' : 'bg-crypto-red'}`}
                style={{ height: `${candle.height * 4}px` }}
              />
            ))}
          </div>
          
          {/* Price levels overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-20 flex flex-col justify-between py-4 text-xs text-muted-foreground">
            <span>42,500</span>
            <span>42,400</span>
            <span>42,300</span>
            <span>42,200</span>
            <span>42,100</span>
            <span>42,000</span>
          </div>
          
          {/* Time axis labels */}
          <div className="absolute bottom-0 left-0 right-20 flex justify-between px-4 py-2 text-xs text-muted-foreground">
            <span>10</span>
            <span>12:00</span>
            <span>17</span>
            <span>24</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
