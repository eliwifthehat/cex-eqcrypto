import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Zap, CheckCircle, AlertTriangle, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";
import Header from "@/components/Header";

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
    }
  ];

  const filteredContracts = contracts.filter(contract => 
    contract.pair.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (contractType === "all" || contract.type.toLowerCase() === contractType)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Derivatives Trading</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Trade crypto futures and perpetual contracts with up to 50x leverage
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
            
            {/* Contract Type Filter */}
            <div className="flex gap-2">
              <Button
                variant={contractType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("all")}
              >
                All
              </Button>
              <Button
                variant={contractType === "perpetual" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("perpetual")}
              >
                Perpetual
              </Button>
              <Button
                variant={contractType === "futures" ? "default" : "outline"}
                size="sm"
                onClick={() => setContractType("futures")}
              >
                Futures
              </Button>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Contract</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">24h Change</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Funding Rate</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Leverage</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl ${contract.color}`}>{contract.icon}</span>
                        <div>
                          <div className="font-medium text-foreground">{contract.pair}</div>
                          <div className="text-sm text-muted-foreground">{contract.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-foreground">${contract.price}</div>
                    </td>
                    <td className="p-4 text-right">
                      <Badge variant={contract.isPositive ? "default" : "destructive"}>
                        {contract.change}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-muted-foreground">{contract.fundingRate}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-muted-foreground">{contract.leverage}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          Trade
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-8 w-8 text-yellow-500" />
                <h3 className="text-lg font-semibold">High Leverage</h3>
              </div>
              <p className="text-muted-foreground">
                Trade with up to 50x leverage on major cryptocurrency pairs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h3 className="text-lg font-semibold">Advanced Orders</h3>
              </div>
              <p className="text-muted-foreground">
                Use stop-loss, take-profit, and conditional orders for better risk management
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <h3 className="text-lg font-semibold">Learn Trading</h3>
              </div>
              <p className="text-muted-foreground">
                Access educational resources and trading guides for derivatives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Warning */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Risk Warning</h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                Derivatives trading involves substantial risk and is not suitable for all investors. 
                You may lose more than your initial investment due to leverage.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}