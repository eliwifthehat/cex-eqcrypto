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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Chart and Order Book */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trading Chart */}
            <div className="bg-card rounded-lg border">
              <TradingChart selectedPair={selectedPair} />
            </div>

            {/* Order Book */}
            <div className="bg-card rounded-lg border p-4">
              <OrderBook />
            </div>
          </div>

          {/* Right Column - Trading Forms */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-4">
              <TradingForms />
            </div>
          </div>
        </div>

        {/* Bottom Section - Portfolio, Orders, Trade History */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border p-4">
            <Portfolio />
          </div>
          <div className="bg-card rounded-lg border p-4">
            <OrdersManagement />
          </div>
          <div className="bg-card rounded-lg border p-4">
            <TradeHistory />
          </div>
        </div>
      </div>
    </div>
  );
}