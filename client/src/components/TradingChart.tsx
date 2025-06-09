import { useState, useEffect, useRef } from "react";
import { createChart, ColorType } from 'lightweight-charts';
import { 
  TrendingUp, TrendingDown, Minus, RotateCcw, Square, 
  Triangle, Circle, Type, Home, Settings, HelpCircle 
} from "lucide-react";

interface TradingChartProps {
  selectedPair: string;
}

export default function TradingChart({ selectedPair }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("1h");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);

  const timeframes = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "30m", value: "30m" },
    { label: "1h", value: "1h" },
    { label: "6h", value: "6h" },
  ];

  // Generate realistic Bitcoin candlestick data
  const generateCandlestickData = () => {
    const data = [];
    const basePrice = 66800;
    let currentPrice = basePrice;
    const now = Date.now();
    
    for (let i = 200; i >= 0; i--) {
      const timestamp = Math.floor((now - i * 60 * 60 * 1000) / 1000);
      
      const volatility = Math.random() * 800 + 300;
      const direction = Math.random() > 0.48 ? 1 : -1;
      
      const open = currentPrice;
      const change = (Math.random() * volatility) * direction;
      const close = open + change;
      
      const high = Math.max(open, close) + Math.random() * 200;
      const low = Math.min(open, close) - Math.random() * 200;
      
      data.push({
        time: timestamp as any,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
      
      currentPrice = close + (Math.random() - 0.5) * 100;
    }
    
    return data.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Wait for container to be properly mounted
    const timeoutId = setTimeout(() => {
      if (!chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#0f172a' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: 'rgba(75, 85, 99, 0.2)' },
          horzLines: { color: 'rgba(75, 85, 99, 0.2)' },
        },
        crosshair: {
          mode: 1,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: 'rgba(75, 85, 99, 0.5)',
        },
        rightPriceScale: {
          borderColor: 'rgba(75, 85, 99, 0.5)',
        },
        width: chartContainerRef.current.clientWidth,
        height: 480,
      });

      const candlestickSeries = chart.addSeries('candlestick', {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });

      const data = generateCandlestickData();
      candlestickSeries.setData(data);

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: 480,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current) {
      const data = generateCandlestickData();
      candlestickSeriesRef.current.setData(data);
    }
  }, [timeframe]);

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

      {/* TradingView Chart Container */}
      <div 
        ref={chartContainerRef}
        className="w-full"
        style={{ 
          backgroundColor: '#0f172a',
          height: '480px',
          minHeight: '480px'
        }}
      />

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
