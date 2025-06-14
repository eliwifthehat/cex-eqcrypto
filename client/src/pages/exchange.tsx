import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";
import Header from "@/components/Header";
import PriceHeader from "@/components/PriceHeader";
import TradingChart from "@/components/TradingChart";
import OrderBook from "@/components/OrderBook";
import OrdersManagement from "@/components/OrdersManagement";
import TradingForms from "@/components/TradingForms";
import Portfolio from "@/components/Portfolio";
import TradeHistory from "@/components/TradeHistory";

export default function Exchange() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [activeBottomTab, setActiveBottomTab] = useState("orders");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Price Header */}
      <PriceHeader selectedPair={selectedPair} onPairChange={setSelectedPair} />

      {/* Main Trading Layout - Connected Panels */}
      <div className="max-w-[100vw] mx-auto h-[calc(100vh-120px)]">
        <div className="flex h-full">
          {/* Chart Panel - 60% width */}
          <div className="w-[60%] bg-gray-900 border-l border-gray-800 flex flex-col">
            <TradingChart selectedPair={selectedPair} />
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-800"></div>

          {/* Order Book Panel - 25% width */}
          <div className="w-[25%] bg-gray-900 flex flex-col">
            <div className="border-b border-gray-800">
              <div className="flex space-x-1 p-1">
                <button className="px-4 py-2 text-white bg-gray-700 rounded text-sm">
                  Order Book
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                  Recent Trades
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <OrderBook />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-800"></div>

          {/* Trading Forms Panel - 15% width */}
          <div className="w-[15%] bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="flex-1 px-4 py-3">
              <TradingForms />
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Bottom Section - Order Management Panel */}
        <div className="bg-gray-900 border-l border-r border-b border-gray-800 h-[200px] flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-800">
            <div className="flex space-x-1 p-1">
              <button 
                onClick={() => setActiveBottomTab("orders")}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeBottomTab === "orders" 
                    ? "text-white bg-gray-800" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Open Orders (1)
              </button>
              <button 
                onClick={() => setActiveBottomTab("history")}
                className={`px-4 py-2 rounded text-sm ${
                  activeBottomTab === "history" 
                    ? "text-white bg-gray-800" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Order History
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4">
            {activeBottomTab === "orders" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Pair</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Side</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Filled</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-white hover:bg-gray-800">
                    <td className="py-3">2024-01-15 14:23</td>
                    <td className="py-3">BTC/USDT</td>
                    <td className="py-3">Limit</td>
                    <td className="py-3 text-green-400">Buy</td>
                    <td className="py-3 text-right">0.00150000</td>
                    <td className="py-3 text-right">66,850.00</td>
                    <td className="py-3 text-right">0.00000000</td>
                    <td className="py-3 text-right">100.28</td>
                    <td className="py-3 text-right">
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeBottomTab === "history" && (
              <div className="text-center text-gray-400 py-8">
                <p>No order history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}