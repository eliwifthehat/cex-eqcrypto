import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function OrdersManagement() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock orders data
  const mockOrders = [
    {
      id: 1,
      symbol: "BTC/USDT",
      side: "buy",
      type: "Market",
      amount: "0.001",
      price: "42,350.00",
      filled: "100%",
      status: "Filled",
      time: "14:32:15"
    },
    {
      id: 2,
      symbol: "BTC/USDT",
      side: "sell",
      type: "Limit",
      amount: "0.0005",
      price: "42,400.00",
      filled: "50%",
      status: "Partial",
      time: "14:28:42"
    },
    {
      id: 3,
      symbol: "BTC/USDT",
      side: "buy",
      type: "Market",
      amount: "0.002",
      price: "42,320.00",
      filled: "100%",
      status: "Filled",
      time: "14:25:18"
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Orders</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-3">
            {/* Headers */}
            <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground font-medium px-2">
              <div>Pair</div>
              <div>Side</div>
              <div>Amount</div>
              <div>Price</div>
              <div>Filled</div>
              <div>Status</div>
            </div>
            
            {/* Orders List */}
            <div className="space-y-1">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-6 gap-2 text-sm hover:bg-muted rounded px-2 py-2 transition-colors cursor-pointer"
                >
                  <div className="text-foreground font-mono text-xs">
                    {order.symbol}
                  </div>
                  <div className={`text-xs font-medium ${
                    order.side === 'buy' ? 'crypto-green' : 'crypto-red'
                  }`}>
                    {order.side.toUpperCase()}
                  </div>
                  <div className="text-foreground font-mono text-xs">
                    {order.amount}
                  </div>
                  <div className="text-foreground font-mono text-xs">
                    {order.price}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {order.filled}
                  </div>
                  <div className={`text-xs font-medium ${
                    order.status === 'Filled' ? 'crypto-green' : 'text-yellow-500'
                  }`}>
                    {order.status}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state when no orders */}
            {mockOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">No orders yet</div>
                <div className="text-xs mt-1">Your trading history will appear here</div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}