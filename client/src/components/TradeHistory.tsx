import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { History, TrendingUp, TrendingDown } from "lucide-react";

interface UserTrade {
  id: number;
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  fee: string;
  feeAsset: string;
  createdAt: string;
}

export default function TradeHistory() {
  const { user } = useAuth();

  const { data: trades, isLoading } = useQuery<UserTrade[]>({
    queryKey: ['/api/user-trades', user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Trade History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-6 bg-gray-600 rounded-full" />
                <div>
                  <Skeleton className="w-20 h-4 bg-gray-600 mb-1" />
                  <Skeleton className="w-32 h-3 bg-gray-600" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="w-24 h-4 bg-gray-600 mb-1" />
                <Skeleton className="w-16 h-3 bg-gray-600" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Trade History
          </div>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {trades && trades.map((trade: UserTrade) => {
          const isBuy = trade.side === 'buy';
          const totalValue = parseFloat(trade.quantity) * parseFloat(trade.price);
          
          return (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant={isBuy ? "default" : "destructive"} className={`${isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isBuy ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trade.side.toUpperCase()}
                </Badge>
                <div>
                  <div className="text-white font-medium">{trade.symbol}</div>
                  <div className="text-sm text-gray-400">
                    {parseFloat(trade.quantity).toFixed(8)} @ ${parseFloat(trade.price).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-400">
                  Fee: {trade.fee} {trade.feeAsset}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(trade.createdAt).toLocaleDateString()} {new Date(trade.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        
        {(!trades || trades.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No trade history</p>
            <p className="text-sm">Your completed trades will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}