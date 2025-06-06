import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Zap, CheckCircle, AlertTriangle, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";

export default function Derivatives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contractType, setContractType] = useState("all");
  const [sortBy, setSortBy] = useState("volume");

  // Derivatives contracts data
  const contracts = [
    {
      icon: "₿",
      pair: "BTC/USDT",
      type: "Perpetual",
      price: "42,350.00",
      change: "+2.14%",
      isPositive: true,
      fundingRate: "0.015%",
      leverage: "1x–50x",
      color: "text-orange-500"
    },
    {
      icon: "⟠",
      pair: "ETH/USDT",
      type: "Futures",
      price: "2,654.30",
      change: "-1.21%",
      isPositive: false,
      fundingRate: "0.010%",
      leverage: "1x–25x",
      color: "text-blue-500"
    },
    {
      icon: "◎",
      pair: "SOL/USDT",
      type: "Perpetual",
      price: "98.45",
      change: "+0.85%",
      isPositive: true,
      fundingRate: "0.030%",
      leverage: "1x–20x",
      color: "text-purple-500"
    },
    {
      icon: "🐕",
      pair: "DOGE/USDT",
      type: "Options",
      price: "0.08542",
      change: "+5.1%",
      isPositive: true,
      fundingRate: "N/A",
      leverage: "Varies",
      color: "text-yellow-500"
    },
    {
      icon: "🪙",
      pair: "BNB/USDT",
      type: "Perpetual",
      price: "315.67",
      change: "+1.89%",
      isPositive: true,
      fundingRate: "0.025%",
      leverage: "1x–30x",
      color: "text-yellow-600"
    },
    {
      icon: "💎",
      pair: "ADA/USDT",
      type: "Futures",
      price: "0.4821",
      change: "+0.67%",
      isPositive: true,
      fundingRate: "0.008%",
      leverage: "1x–15x",
      color: "text-blue-600"
    }
  ];

  const features = [
    { icon: CheckCircle, text: "Up to 50x Leverage" },
    { icon: CheckCircle, text: "Real-Time Risk Engine" },
    { icon: CheckCircle, text: "Low Fees, High Speed" }
  ];

  const contractTypes = ["Perpetuals", "Futures", "Options"];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.pair.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = contractType === "all" || contract.type.toLowerCase() === contractType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case "volume":
        return 0; // Keep original order for volume
      case "funding":
        return parseFloat(b.fundingRate) - parseFloat(a.fundingRate);
      case "change":
        return parseFloat(b.change) - parseFloat(a.change);
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
                  <a className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Markets
                  </a>
                </Link>
                <Link href="/exchange">
                  <a className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Trade
                  </a>
                </Link>
                <Link href="/derivatives">
                  <a className="text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium bg-muted">
                    Derivatives
                  </a>
                </Link>
              </nav>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <AuthButton />
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="h-8 w-8 text-crypto-blue" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Trade Derivatives with Leverage on EQCrypto
            </h1>
          </div>
          
          {/* Contract Types */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {contractTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="bg-muted text-foreground px-4 py-2 text-sm">
                {type}
              </Badge>
            ))}
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 justify-center">
                <feature.icon className="h-5 w-5 crypto-green" />
                <span className="text-foreground font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
          
          <Button size="lg" className="bg-crypto-blue hover:bg-blue-600 text-white px-8 py-4 text-lg">
            Start Trading Derivatives
          </Button>
        </section>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>
            
            {/* Contract Type Filters */}
            <div className="flex gap-2">
              <span className="text-muted-foreground text-sm self-center">Filters:</span>
              <Button
                variant={contractType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("all")}
                className={contractType === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All
              </Button>
              <Button
                variant={contractType === "perpetual" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("perpetual")}
                className={contractType === "perpetual" ? "bg-primary text-primary-foreground" : ""}
              >
                Perpetuals
              </Button>
              <Button
                variant={contractType === "futures" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("futures")}
                className={contractType === "futures" ? "bg-primary text-primary-foreground" : ""}
              >
                Futures
              </Button>
              <Button
                variant={contractType === "options" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("options")}
                className={contractType === "options" ? "bg-primary text-primary-foreground" : ""}
              >
                Options
              </Button>
            </div>
            
            {/* Sort Options */}
            <div className="flex gap-2">
              <span className="text-muted-foreground text-sm self-center">Sort By:</span>
              <Button
                variant={sortBy === "volume" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("volume")}
                className={sortBy === "volume" ? "bg-primary text-primary-foreground" : ""}
              >
                Volume
              </Button>
              <Button
                variant={sortBy === "funding" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("funding")}
                className={sortBy === "funding" ? "bg-primary text-primary-foreground" : ""}
              >
                Funding Rate
              </Button>
              <Button
                variant={sortBy === "change" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("change")}
                className={sortBy === "change" ? "bg-primary text-primary-foreground" : ""}
              >
                24h Change
              </Button>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4 p-4 border-b border-border bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground">🔗</div>
              <div className="text-sm font-medium text-muted-foreground">Pair</div>
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div className="text-sm font-medium text-muted-foreground">Price</div>
              <div className="text-sm font-medium text-muted-foreground">24h Change</div>
              <div className="text-sm font-medium text-muted-foreground">Funding Rate</div>
              <div className="text-sm font-medium text-muted-foreground">Leverage</div>
              <div className="text-sm font-medium text-muted-foreground">Action</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-border">
              {sortedContracts.map((contract, index) => (
                <div key={index} className="grid grid-cols-8 gap-4 p-4 hover:bg-muted/30 transition-colors">
                  {/* Icon */}
                  <div className="flex items-center">
                    <span className={`text-xl ${contract.color}`}>{contract.icon}</span>
                  </div>
                  
                  {/* Pair */}
                  <div className="flex items-center">
                    <span className="font-semibold text-foreground">{contract.pair}</span>
                  </div>
                  
                  {/* Type */}
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs">
                      {contract.type}
                    </Badge>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center">
                    <span className="font-mono text-foreground">${contract.price}</span>
                  </div>
                  
                  {/* 24h Change */}
                  <div className="flex items-center">
                    <div className={`flex items-center gap-1 ${contract.isPositive ? 'crypto-green' : 'crypto-red'}`}>
                      {contract.isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">{contract.change}</span>
                    </div>
                  </div>
                  
                  {/* Funding Rate */}
                  <div className="flex items-center">
                    <span className="text-muted-foreground font-mono">{contract.fundingRate}</span>
                  </div>
                  
                  {/* Leverage */}
                  <div className="flex items-center">
                    <span className="text-muted-foreground">{contract.leverage}</span>
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

        {/* Educational Banner */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="h-8 w-8 text-crypto-blue flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">📘 New to Derivatives?</h3>
                <p className="text-muted-foreground mb-4">
                  Learn how perpetual contracts, funding rates, and leverage work.
                </p>
                <Button variant="outline" className="border-crypto-blue text-crypto-blue hover:bg-crypto-blue hover:text-white">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Disclaimer */}
        <Card className="bg-card border-border border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">⚠️ Risk Disclaimer</h4>
                <p className="text-muted-foreground">
                  Derivatives trading involves significant risk. You may lose your entire position. Please trade responsibly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <a href="#" className="hover:text-foreground transition-colors">Fees</a>
              <a href="#" className="hover:text-foreground transition-colors">API</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            <div className="text-muted-foreground text-sm mt-4 md:mt-0">
              © EQCRYPTO 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}