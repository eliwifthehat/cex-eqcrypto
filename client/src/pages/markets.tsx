import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";
import Header from "@/components/Header";

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
      icon: "🔥",
      pair: "SHIB/USDT",
      price: "0.00002456",
      change: "+5.45%",
      isPositive: true,
      volume: "$120M",
      color: "text-red-500"
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
      <Header />

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
              <Button
                variant={sortBy === "volume" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("volume")}
              >
                Volume
              </Button>
              <Button
                variant={sortBy === "gainers" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("gainers")}
              >
                Gainers
              </Button>
              <Button
                variant={sortBy === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("new")}
              >
                New
              </Button>
            </div>
          </div>
        </div>

        {/* Trending Coins Banner */}
        <div className="mb-6 bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">🔥 Trending</h2>
            <div className="flex gap-2 text-sm">
              {trendingCoins.map((coin, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {coin}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Markets Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Pair</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">24h Change</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Volume</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMarkets.map((market, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl ${market.color}`}>{market.icon}</span>
                        <div>
                          <div className="font-medium text-foreground">{market.pair}</div>
                          <div className="text-sm text-muted-foreground">Spot</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-foreground">${market.price}</div>
                    </td>
                    <td className="p-4 text-right">
                      <Badge variant={market.isPositive ? "default" : "destructive"}>
                        {market.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {market.change}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-muted-foreground">{market.volume}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href="/exchange">
                          <Button size="sm" variant="outline">
                            Trade
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Trading Pairs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground">$48.2B</div>
              <div className="text-sm text-muted-foreground">24h Volume</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground">0.1%</div>
              <div className="text-sm text-muted-foreground">Trading Fee</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
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