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
import SentimentBar from "@/components/SentimentBar";

export default function Exchange() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [activeBottomTab, setActiveBottomTab] = useState("orders");
  const [activeMobileTab, setActiveMobileTab] = useState("orderbook");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Price Header */}
      <PriceHeader selectedPair={selectedPair} onPairChange={setSelectedPair} />

      {/* Desktop Layout */}
      <div className="hidden lg:block w-full mx-auto h-[calc(100vh-120px)] overflow-hidden flex flex-col">
        {/* Top Trading Panels */}
        <div className="flex h-[calc(100%-200px)] w-full">
          {/* Chart Panel - 62% width */}
          <div className="w-[62%] bg-gray-900 border-l border-gray-800 flex flex-col">
            <TradingChart selectedPair={selectedPair} />
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-800 flex-shrink-0"></div>

          {/* Order Book Panel - 20% width */}
          <div className="w-[20%] bg-gray-900 flex flex-col">
            <div className="border-b border-gray-800">
              <div className="flex space-x-1 p-1">
                <button className="px-3 py-2 text-white bg-gray-700 rounded text-xs">
                  Order Book
                </button>
                <button className="px-3 py-2 text-gray-400 hover:text-white text-xs">
                  Recent Trades
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <OrderBook />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-800 flex-shrink-0"></div>

          {/* Trading Forms Panel - 18% width */}
          <div className="w-[18%] bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="flex-1 px-3 py-3">
              <TradingForms />
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Bottom Section - Order Management Panel */}
        <div className="bg-gray-900 border-l border-r border-b border-gray-800 h-[200px] flex flex-col flex-shrink-0">
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
              <button 
                onClick={() => setActiveBottomTab("assets")}
                className={`px-4 py-2 rounded text-sm ${
                  activeBottomTab === "assets" 
                    ? "text-white bg-gray-800" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Assets
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

            {activeBottomTab === "assets" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Trading Account Section */}
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-sm font-medium text-white mb-3">Trading Account</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">₿</span>
                        </div>
                        <span className="text-white">BTC</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">0.00150000</div>
                        <div className="text-gray-400 text-xs">≈ $100.28</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">$</span>
                        </div>
                        <span className="text-white">USDT</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">1,250.75</div>
                        <div className="text-gray-400 text-xs">≈ $1,250.75</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">E</span>
                        </div>
                        <span className="text-white">ETH</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">0.50000000</div>
                        <div className="text-gray-400 text-xs">≈ $1,850.50</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">B</span>
                        </div>
                        <span className="text-white">BNB</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">4.25000000</div>
                        <div className="text-gray-400 text-xs">≈ $1,275.00</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <span className="text-white">ADA</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">1,250.00000000</div>
                        <div className="text-gray-400 text-xs">≈ $525.00</div>
                      </div>
                    </div>
                    
                    {/* Total Portfolio Value */}
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Value</span>
                        <span className="text-white font-medium">≈ $5,001.53</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Assets Information */}
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-sm font-medium text-white mb-3">Asset Performance</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h P&L</span>
                      <span className="text-green-400">+$125.50 (+2.58%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unrealized P&L</span>
                      <span className="text-red-400">-$45.20 (-0.90%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available Balance</span>
                      <span className="text-white">$4,256.33</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">In Orders</span>
                      <span className="text-white">$745.20</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-140px)] bg-gray-900">
        {/* Chart Section - Fixed height for optimal mobile display */}
        <div className="h-[280px] w-full bg-gray-900 border border-gray-800 m-2 rounded-lg overflow-hidden">
          <TradingChart selectedPair={selectedPair} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 mx-4"></div>

        {/* Order Book / Order Panel Section */}
        <div className="flex-1 flex flex-col m-2">
          {/* Tabs for Order Book and Order Panel */}
          <div className="flex border-b border-gray-800 bg-gray-900 rounded-t-lg">
            <button
              onClick={() => setActiveMobileTab("orderbook")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-tl-lg ${
                activeMobileTab === "orderbook"
                  ? "text-white bg-gray-700 border-b-2 border-blue-500"
                  : "text-gray-400 bg-gray-800"
              }`}
            >
              Order Book
            </button>
            <button
              onClick={() => setActiveMobileTab("orderpanel")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-tr-lg ${
                activeMobileTab === "orderpanel"
                  ? "text-white bg-gray-700 border-b-2 border-blue-500"
                  : "text-gray-400 bg-gray-800"
              }`}
            >
              Order Panel
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-gray-900 border border-gray-800 border-t-0 rounded-b-lg overflow-hidden">
            {activeMobileTab === "orderbook" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-3 overflow-auto">
                  <OrderBook />
                  {/* Sentiment Bar */}
                  <div className="mt-4">
                    <SentimentBar />
                  </div>
                </div>
              </div>
            )}

            {activeMobileTab === "orderpanel" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-3 overflow-auto">
                  <TradingForms />
                </div>
              </div>
            )}
          </div>

          {/* Buy/Sell Buttons */}
          <div className="flex gap-2 p-3 bg-gray-900 border border-gray-800 border-t-0 rounded-b-lg">
            <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
              BUY BTC
            </button>
            <button className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
              SELL BTC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}