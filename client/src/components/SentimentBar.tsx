import React, { useState, useEffect } from 'react';

interface SentimentBarProps {
  buyPercent?: number;
  sellPercent?: number;
}

export default function SentimentBar({ buyPercent = 71.58, sellPercent = 28.41 }: SentimentBarProps) {
  const [animatedBuyPercentage, setAnimatedBuyPercentage] = useState(0);

  // Animate buy percentage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedBuyPercentage(buyPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [buyPercent]);

  return (
    <div className="w-full bg-gray-800 rounded-lg p-3 flex items-center justify-between">
      {/* Buy indicator */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <span className="text-green-400 font-semibold text-sm">
          {buyPercent.toFixed(2)}%
        </span>
      </div>

      {/* Center progress bar */}
      <div className="flex-1 mx-4 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-700 ease-out rounded-full"
          style={{ width: `${animatedBuyPercentage}%` }}
        />
      </div>

      {/* Sell indicator */}
      <div className="flex items-center space-x-3">
        <span className="text-red-400 font-semibold text-sm">
          {sellPercent.toFixed(2)}%
        </span>
        <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
      </div>
    </div>
  );
}