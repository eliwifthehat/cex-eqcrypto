import React from 'react';

interface SentimentBarProps {
  buyPercent?: number;
  sellPercent?: number;
}

export default function SentimentBar({ buyPercent = 71.58, sellPercent = 28.41 }: SentimentBarProps) {
  return (
    <div className="w-full mt-4 bg-gray-800 rounded-full h-6 flex items-center relative overflow-hidden shadow-inner">
      {/* Buy Side */}
      <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${buyPercent}%` }}></div>
      {/* Sell Side (positioned absolutely to right) */}
      <div
        className="bg-red-500 h-full absolute right-0 top-0 transition-all duration-300"
        style={{ width: `${sellPercent}%` }}
      ></div>

      {/* Labels */}
      <div className="absolute left-2 text-sm text-green-200 flex items-center gap-1">
        <div className="bg-green-700 px-1 py-0.5 rounded text-xs font-bold">B</div>
        {buyPercent.toFixed(2)}%
      </div>
      <div className="absolute right-2 text-sm text-red-200 flex items-center gap-1">
        {sellPercent.toFixed(2)}%
        <div className="bg-red-700 px-1 py-0.5 rounded text-xs font-bold">S</div>
      </div>
    </div>
  );
}