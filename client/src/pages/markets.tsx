import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";

export default function Markets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("volume");

  // Market data
  const markets = [
    {
      icon: "₿",
      pair: "BTC/USDT",
      price: "42,350.00",
      change: "+2.14%",
      isPositive: true,
      volume: "$8.5B",
      color: "text-orange-500"
    },
    {
      icon: "⟠", 
      pair: "ETH/USDT",
      price: "2,654.30",
      change: "-1.21%",
      isPositive: false,
      volume: "$6.1B",
      color: "text-blue-500"
    },
    {
      icon: "◎",
      pair: "SOL/USDT", 
      price: "98.45",
      change: "+0.85%",
      isPositive: true,
      volume: "$1.2B",
      color: "text-purple-500"
    },
    {
      icon: "🐸",
      pair: "PEPE/USDT",
      price: "0.00001234",
      change: "+10.2%", 
      isPositive: true,
      volume: "$180M",
      color: "text-green-500"
    },
    {
      icon: "🐕",
      pair: "DOGE/USDT",
      price: "0.08542",
      change: "+3.45%",
      isPositive: true,
      volume: "$450M",
      color: "text-yellow-500"
    },
    {
      icon: "🦴",
      pair: "SHIB/USDT",
      price: "0.00000891",
      change: "-2.67%",
      isPositive: false,
      volume: "$320M",
      color: "text-red-500"
    },
    {
      icon: "🪙",
      pair: "BNB/USDT",
      price: "315.67",
      change: "+1.89%",
      isPositive: true,
      volume: "$2.1B",
      color: "text-yellow-600"
    },
    {
      icon: "💎",
      pair: "ADA/USDT",
      price: "0.4821",
      change: "+0.67%",
      isPositive: true,
      volume: "$890M",
      color: "text-blue-600"
    }
  ];

  const trendingCoins = ["BTC", "ETH", "PEPE", "DOGE", "SHIB"];

  const filteredMarkets = markets.filter(market => 
    market.pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    switch (sortBy) {
      case "gainers":
        return parseFloat(b.change) - parseFloat(a.change);
      case "volume":
        return parseFloat(b.volume.replace(/[$B-M]/g, "")) - parseFloat(a.volume.replace(/[$B-M]/g, ""));
      case "new":
        return 0; // Keep original order for "new"
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation - Same as other pages */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="text-2xl font-bold text-foreground cursor-pointer">
                  EQCRYPTO
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/">
                  <a className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </a>
                </Link>
                <Link href="/markets">
                  <a className="text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium bg-muted">
                    Markets
                  </a>
                </Link>
                <Link href="/exchange">
                  <a className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Trade
                  </a>
                </Link>
                <Link href="/derivatives">
                  <a className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Derivatives
                  </a>
                </Link>
              </nav>
            </div>
            
            {/* Auth Area */}
            <div className="flex items-center">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>
            
            {/* Sort Filters */}
            <div className="flex gap-2">
              <span className="text-muted-foreground text-sm self-center">Sort by:</span>
              <Button
                variant={sortBy === "gainers" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("gainers")}
                className={sortBy === "gainers" ? "bg-primary text-primary-foreground" : ""}
              >
                Top Gainers
              </Button>
              <Button
                variant={sortBy === "volume" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("volume")}
                className={sortBy === "volume" ? "bg-primary text-primary-foreground" : ""}
              >
                Volume
              </Button>
              <Button
                variant={sortBy === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("new")}
                className={sortBy === "new" ? "bg-primary text-primary-foreground" : ""}
              >
                New
              </Button>
            </div>
          </div>
        </div>

        {/* Markets Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-border bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground">Coin</div>
              <div className="text-sm font-medium text-muted-foreground">Pair</div>
              <div className="text-sm font-medium text-muted-foreground">Price</div>
              <div className="text-sm font-medium text-muted-foreground">24h Change</div>
              <div className="text-sm font-medium text-muted-foreground">Volume</div>
              <div className="text-sm font-medium text-muted-foreground">Action</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-border">
              {sortedMarkets.map((market, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 hover:bg-muted/30 transition-colors">
                  {/* Coin Icon */}
                  <div className="flex items-center">
                    <span className={`text-2xl ${market.color}`}>{market.icon}</span>
                  </div>
                  
                  {/* Pair */}
                  <div className="flex items-center">
                    <span className="font-semibold text-foreground">{market.pair}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center">
                    <span className="font-mono text-foreground">${market.price}</span>
                  </div>
                  
                  {/* 24h Change */}
                  <div className="flex items-center">
                    <div className={`flex items-center gap-1 ${market.isPositive ? 'crypto-green' : 'crypto-red'}`}>
                      {market.isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">{market.change}</span>
                    </div>
                  </div>
                  
                  {/* Volume */}
                  <div className="flex items-center">
                    <span className="text-muted-foreground">{market.volume}</span>
                  </div>
                  
                  {/* Action */}
                  <div className="flex items-center">
                    <Link href="/exchange">
                      <Button size="sm" className="bg-crypto-blue hover:bg-blue-600 text-white">
                        Trade
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Section */}
        <div className="mt-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold text-foreground">Trending:</span>
                <div className="flex gap-2 flex-wrap">
                  {trendingCoins.map((coin, index) => (
                    <Badge key={index} variant="secondary" className="bg-muted text-foreground hover:bg-accent cursor-pointer">
                      {coin}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-foreground mb-4 md:mb-0">
              EQCRYPTO
            </div>
            <div className="flex space-x-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}