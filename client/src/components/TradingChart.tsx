import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Minus, RotateCcw, Square, 
  Triangle, Circle, Type, Home, Settings, HelpCircle 
} from "lucide-react";

interface TradingChartProps {
  selectedPair: string;
}

export default function TradingChart({ selectedPair }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("1h");

  const timeframes = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "30m", value: "30m" },
    { label: "1h", value: "1h" },
    { label: "6h", value: "6h" },
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
    <div className="bg-gray-900 border border-gray-800 rounded">
      {/* Chart Header with Tools */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Drawing tools */}
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Minus className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <TrendingUp className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Square className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Triangle className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Circle className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Type className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Home className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Right side - Timeframes */}
          <div className="flex items-center space-x-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-sm rounded ${
                  timeframe === tf.value 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative h-[400px] bg-gray-950">
        {/* Chart Canvas Area */}
        <div className="absolute inset-0 flex items-end justify-center space-x-1 p-8">
          {mockCandles.map((candle, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div
                className={`w-3 ${candle.isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ height: `${candle.height * 3}px` }}
              />
              <div className={`w-1 h-2 ${candle.isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          ))}
        </div>
        
        {/* Price scale on right */}
        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between py-4 text-xs text-gray-400">
          <span>67,400.0</span>
          <span>67,200.0</span>
          <span>67,000.0</span>
          <span>66,800.0</span>
          <span>66,600.0</span>
          <span>66,400.0</span>
          <span>66,200.0</span>
          <span>66,000.0</span>
          <span>65,800.0</span>
          <span>65,600.0</span>
          <span>65,400.0</span>
          <span>65,200.0</span>
          <span>65,000.0</span>
          <span>64,800.0</span>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="relative h-[120px] bg-gray-950 border-t border-gray-800">
        <div className="absolute left-4 top-2 text-sm text-gray-400">
          <span>Volume SMA 9</span>
          <span className="text-green-400 ml-4">286,225k</span>
        </div>
        
        {/* Volume bars */}
        <div className="absolute inset-0 flex items-end justify-center space-x-1 p-8 pt-8">
          {mockCandles.map((_, index) => (
            <div
              key={index}
              className={`w-3 ${index % 3 === 0 ? 'bg-green-500/50' : 'bg-red-500/50'}`}
              style={{ height: `${Math.random() * 40 + 10}px` }}
            />
          ))}
        </div>

        {/* Time labels */}
        <div className="absolute bottom-0 left-0 right-16 flex justify-between px-8 py-2 text-xs text-gray-400">
          <span>18:00:00</span>
          <span>23</span>
          <span>12:00:00</span>
          <span>06:00:00</span>
          <span>18:00:00</span>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>17:06:25 (UTC+1)</span>
          <span>% log auto</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            <span className="text-green-400 text-sm">71.58%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            <span className="text-red-400 text-sm">28.41%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
