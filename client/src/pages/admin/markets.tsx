import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Platform } from "@/components/PlatformSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Activity, 
  Search, 
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Volume2,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Market {
  id: string;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  is_active: boolean;
  min_order_size: number;
  max_order_size: number;
  price_precision: number;
  volume_precision: number;
}

export default function AdminMarkets() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("cex");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMarkets();
  }, [currentPlatform]);

  const fetchMarkets = async () => {
    setIsLoading(true);
    try {
      // Mock data - in production, this would call the API
      const mockMarkets: Market[] = [
        {
          id: "1",
          symbol: "BTC/USDT",
          base_asset: "BTC",
          quote_asset: "USDT",
          price: 45000,
          change_24h: 2.5,
          volume_24h: 1250000,
          is_active: true,
          min_order_size: 0.001,
          max_order_size: 100,
          price_precision: 2,
          volume_precision: 6
        },
        {
          id: "2",
          symbol: "ETH/USDT",
          base_asset: "ETH",
          quote_asset: "USDT",
          price: 2800,
          change_24h: -1.2,
          volume_24h: 890000,
          is_active: true,
          min_order_size: 0.01,
          max_order_size: 1000,
          price_precision: 2,
          volume_precision: 5
        },
        {
          id: "3",
          symbol: "SOL/USDT",
          base_asset: "SOL",
          quote_asset: "USDT",
          price: 95,
          change_24h: 5.8,
          volume_24h: 450000,
          is_active: false,
          min_order_size: 0.1,
          max_order_size: 10000,
          price_precision: 2,
          volume_precision: 3
        }
      ];
      
      setMarkets(mockMarkets);
    } catch (error) {
      console.error("Failed to fetch markets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMarkets = markets.filter(market => 
    market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.base_asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.quote_asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMarketStatus = (marketId: string) => {
    setMarkets(prev => prev.map(market => 
      market.id === marketId 
        ? { ...market, is_active: !market.is_active }
        : market
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const activeMarkets = markets.filter(market => market.is_active).length;
  const totalVolume = markets.reduce((sum, market) => sum + market.volume_24h, 0);

  return (
    <AdminLayout
      currentPlatform={currentPlatform}
      onPlatformChange={setCurrentPlatform}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {currentPlatform.toUpperCase()} Markets
            </h1>
            <p className="text-gray-400 mt-1">
              Manage trading pairs and market settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Market
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{markets.length}</div>
                  <div className="text-sm text-gray-400">Total Markets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Play className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{activeMarkets}</div>
                  <div className="text-sm text-gray-400">Active Markets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{formatVolume(totalVolume)}</div>
                  <div className="text-sm text-gray-400">24h Volume</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {markets.filter(m => m.change_24h > 0).length}
                  </div>
                  <div className="text-sm text-gray-400">Gaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search markets by symbol or asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Markets Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Market Management</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Symbol</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">24h Change</TableHead>
                    <TableHead className="text-gray-300">24h Volume</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Min Order</TableHead>
                    <TableHead className="text-gray-300">Max Order</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarkets.map((market) => (
                    <TableRow key={market.id} className="border-gray-700">
                      <TableCell>
                        <div className="font-medium text-white">{market.symbol}</div>
                        <div className="text-sm text-gray-400">
                          {market.base_asset}/{market.quote_asset}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {formatCurrency(market.price)}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-1 ${getChangeColor(market.change_24h)}`}>
                          {getChangeIcon(market.change_24h)}
                          <span>{market.change_24h > 0 ? '+' : ''}{market.change_24h}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {formatVolume(market.volume_24h)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={market.is_active}
                            onCheckedChange={() => toggleMarketStatus(market.id)}
                          />
                          <Badge variant="outline" className={
                            market.is_active 
                              ? "text-green-400 bg-green-500/10 border-green-500/20"
                              : "text-gray-400 bg-gray-500/10 border-gray-500/20"
                          }>
                            {market.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {market.min_order_size} {market.base_asset}
                      </TableCell>
                      <TableCell className="text-white">
                        {market.max_order_size} {market.base_asset}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Market
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Market
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

