import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import UserDropdown from "@/components/UserDropdown";
import { Search, FileText, Globe } from "lucide-react";
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
      {/* Header Navigation */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Search */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-muted rounded-lg px-3 py-2 space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">EQCRYPTO</span>
              </div>
            </div>

            {/* Center Icons */}
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <FileText className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Globe className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Right Side - Connect and Start */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="secondary" 
                className="bg-muted text-foreground hover:bg-accent"
              >
                Connect
              </Button>
              <UserDropdown />
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Price Header */}
        <PriceHeader 
          selectedPair={selectedPair} 
          onPairChange={setSelectedPair} 
        />

        {/* Trading Interface Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <TradingChart selectedPair={selectedPair} />
          </div>
          
          {/* Order Book */}
          <div className="xl:col-span-1">
            <OrderBook />
          </div>

          {/* Portfolio and Trade History */}
          <div className="xl:col-span-1 space-y-6">
            <Portfolio />
            <TradeHistory />
          </div>
        </div>

        {/* Trading Forms and Orders Management */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradingForms />
          <OrdersManagement />
        </div>

      </main>
    </div>
  );
}
