import React, { useState } from 'react';

interface SentimentBarProps {
  buyPercent?: number;
  sellPercent?: number;
  buyVolume?: number;
  sellVolume?: number;
}

export default function SentimentBar({ 
  buyPercent = 71.58, 
  sellPercent = 28.41,
  buyVolume = 0.42,
  sellVolume = 0.16
}: SentimentBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="w-full mt-4 bg-gray-800 rounded-full h-7 flex items-center relative overflow-hidden shadow-inner cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Buy Side */}
      <div 
        className="bg-green-500 h-full transition-all duration-500 ease-in-out border-r border-gray-700" 
        style={{ width: `${buyPercent}%` }}
      ></div>
      
      {/* Sell Side (positioned absolutely to right) */}
      <div
        className="bg-red-500 h-full absolute right-0 top-0 transition-all duration-500 ease-in-out"
        style={{ width: `${sellPercent}%` }}
      ></div>

      {/* Labels */}
      <div className="absolute left-2 flex items-center gap-1">
        <span className="bg-green-700 text-white px-2 py-0.5 rounded-full text-xs font-bold">B</span>
        <span className="text-white text-xs sm:text-sm font-bold">{buyPercent.toFixed(2)}%</span>
      </div>
      
      <div className="absolute right-2 flex items-center gap-1">
        <span className="text-white text-xs sm:text-sm font-bold">{sellPercent.toFixed(2)}%</span>
        <span className="bg-red-700 text-white px-2 py-0.5 rounded-full text-xs font-bold">S</span>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-20 shadow-lg">
          <div className="text-center">
            <div className="text-green-400">Buy Volume: {buyVolume.toFixed(6)} BTC</div>
            <div className="text-red-400">Sell Volume: {sellVolume.toFixed(6)} BTC</div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      )}
    </div>
  );
}