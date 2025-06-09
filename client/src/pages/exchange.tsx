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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Price Header */}
      <PriceHeader selectedPair={selectedPair} onPairChange={setSelectedPair} />

      {/* Main Trading Layout */}
      <div className="max-w-7xl mx-auto px-4 py-2 pt-20">
        <div className="grid grid-cols-12 gap-3">
          {/* Chart - Takes up 7 columns */}
          <div className="col-span-7">
            <TradingChart selectedPair={selectedPair} />
          </div>

          {/* Order Book - Takes up 3 columns, smaller */}
          <div className="col-span-3">
            <OrderBook />
          </div>

          {/* Trading Forms - Takes up 2 columns */}
          <div className="col-span-2">
            <TradingForms />
          </div>
        </div>

        {/* Bottom Section - Order Management Tabs - Aligned with Chart */}
        <div className="mt-4 grid grid-cols-12 gap-3">
          <div className="col-span-7">
            <div className="bg-gray-900 border border-gray-800 rounded">
              {/* Tab Navigation */}
              <div className="border-b border-gray-800">
                <div className="flex space-x-1 p-1">
                  <button className="px-4 py-2 text-white bg-gray-800 rounded text-sm font-medium">
                    Open Orders (1)
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                    Order History
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                    Assets
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {/* Order Types Tabs */}
                <div className="flex space-x-1 mb-4">
                  <button className="px-4 py-2 text-white bg-gray-800 rounded text-sm">
                    Limit
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                    Market
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                    Advanced limit
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                    TP/SL
                  </button>
                  <button className="px-4 py-2 text-gray-400 hover:text-white text-sm">
                    Trailing stop
                  </button>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
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
                        <td className="py-3">
                          <span className="text-green-400">Buy</span>
                        </td>
                        <td className="py-3 text-right">0.001000</td>
                        <td className="py-3 text-right">66,500.00</td>
                        <td className="py-3 text-right">0%</td>
                        <td className="py-3 text-right">66.50</td>
                        <td className="py-3 text-right">
                          <button className="text-red-400 hover:text-red-300 text-xs">
                            Cancel
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side empty space to maintain layout */}
          <div className="col-span-5"></div>
        </div>
      </div>
    </div>
  );
}