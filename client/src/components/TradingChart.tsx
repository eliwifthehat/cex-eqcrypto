import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

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
    const now = new Date();
    
    for (let i = 100; i >= 0; i--) {
      const timeStr = Math.floor((now.getTime() - i * 60 * 60 * 1000) / 1000) as any;
      
      const volatility = Math.random() * 600 + 200;
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      const open = currentPrice;
      const change = (Math.random() * volatility) * direction;
      const close = open + change;
      
      const high = Math.max(open, close) + Math.random() * 150;
      const low = Math.min(open, close) - Math.random() * 150;
      
      data.push({
        time: timeStr,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
      
      currentPrice = close;
    }
    
    return data.sort((a, b) => a.time - b.time);
  };

  const generateVolumeData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 100; i >= 0; i--) {
      const timeStr = Math.floor((now.getTime() - i * 60 * 60 * 1000) / 1000) as any;
      const volume = Math.random() * 1000000 + 100000;
      
      data.push({
        time: timeStr,
        value: volume,
        color: Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
      });
    }
    
    return data.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(75, 85, 99, 0.3)' },
        horzLines: { color: 'rgba(75, 85, 99, 0.3)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#9ca3af',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#9ca3af',
          width: 1,
          style: 3,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(75, 85, 99, 0.5)',
      },
      rightPriceScale: {
        borderColor: 'rgba(75, 85, 99, 0.5)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      },
    });

    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    const volumeSeries = chart.addSeries('Histogram', {
      color: '#9ca3af',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });

    candlestickSeries.setData(generateCandlestickData());
    volumeSeries.setData(generateVolumeData());

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current) {
      candlestickSeriesRef.current.setData(generateCandlestickData());
      volumeSeriesRef.current.setData(generateVolumeData());
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
        className="h-[500px] w-full"
        style={{ backgroundColor: '#0f172a' }}
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
