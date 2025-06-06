import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface PortfolioAsset {
  asset: string;
  balance: string;
  lockedBalance: string;
  totalValue: number;
  priceChange24h: number;
}

export default function Portfolio() {
  const { user } = useAuth();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/portfolio', user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                <div>
                  <Skeleton className="w-12 h-4 bg-gray-600 mb-1" />
                  <Skeleton className="w-20 h-3 bg-gray-600" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="w-16 h-4 bg-gray-600 mb-1" />
                <Skeleton className="w-12 h-3 bg-gray-600" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalPortfolioValue = portfolio?.reduce((sum: number, asset: PortfolioAsset) => sum + asset.totalValue, 0) || 0;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Portfolio
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {portfolio?.map((asset: PortfolioAsset) => {
          const availableBalance = parseFloat(asset.balance) - parseFloat(asset.lockedBalance);
          const isPositive = asset.priceChange24h >= 0;
          
          return (
            <div key={asset.asset} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {asset.asset.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{asset.asset}</div>
                  <div className="text-sm text-gray-400">
                    {parseFloat(asset.balance).toFixed(8)} total
                    {parseFloat(asset.lockedBalance) > 0 && (
                      <span className="text-yellow-400 ml-1">
                        ({parseFloat(asset.lockedBalance).toFixed(8)} locked)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  ${asset.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {!portfolio || portfolio.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No assets in portfolio</p>
            <p className="text-sm">Start trading to build your portfolio</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}