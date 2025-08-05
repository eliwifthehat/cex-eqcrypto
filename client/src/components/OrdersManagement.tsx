import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { estimateFillTime, calculateMarketConditions, OrderBookEntry } from "@/lib/fillTimeEstimator";
import { CompactFillTimeDisplay } from "@/components/FillTimeDisplay";
import { useAuth } from "@/components/AuthProvider";
import { useOrderUpdates } from "@/hooks/use-order-updates";

interface UserOrder {
  id: number;
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price: string;
  filledQuantity: string;
  status: string;
  createdAt: string;
}

export default function OrdersManagement() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { orderUpdates } = useOrderUpdates();

  // Mock order book data for fill time estimation
  const mockOrderBook: OrderBookEntry[] = [
    { price: 66683.1, amount: 0.088268, side: 'sell' },
    { price: 66682.1, amount: 0.082093, side: 'sell' },
    { price: 66671.1, amount: 0.020283, side: 'sell' },
    { price: 66653.0, amount: 0.020873, side: 'sell' },
    { price: 66673.6, amount: 0.080000, side: 'buy' },
    { price: 66673.2, amount: 0.020873, side: 'buy' },
    { price: 66663.0, amount: 0.020873, side: 'buy' },
  ];

  const currentPrice = 66673.4;

  // Calculate market conditions
  const marketConditions = useMemo(() => {
    const mockRecentTrades = [
      { price: 66673.4, amount: 0.001, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { price: 66673.8, amount: 0.002, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    ];
    return calculateMarketConditions(mockOrderBook, mockRecentTrades, currentPrice);
  }, []);

  // Fetch user orders from backend
  useEffect(() => {
    if (!user?.id) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${user.id}`);
        if (response.ok) {
          const userOrders = await response.json();
          setOrders(userOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Update orders when we receive WebSocket updates
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[orderUpdates.length - 1];
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === latestUpdate.orderId 
            ? { ...order, status: latestUpdate.status }
            : order
        )
      );
    }
  }, [orderUpdates]);

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'cancelled':
      case 'failed':
        return 'text-red-500';
      case 'partial':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getFilledPercentage = (filledQuantity: string, totalQuantity: string) => {
    const filled = parseFloat(filledQuantity);
    const total = parseFloat(totalQuantity);
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

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
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">Loading orders...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Headers */}
              <div className="grid grid-cols-8 gap-2 text-xs text-muted-foreground font-medium px-2">
                <div>Pair</div>
                <div>Side</div>
                <div>Amount</div>
                <div>Price</div>
                <div>Filled</div>
                <div>Status</div>
                <div>Fill Time</div>
                <div>Action</div>
              </div>
              
              {/* Orders List */}
              <div className="space-y-1">
                {orders.map((order) => {
                  // Calculate fill time estimate for pending orders
                  const fillTimeEstimate = order.status === 'pending' ? 
                    estimateFillTime(
                      parseFloat(order.quantity),
                      parseFloat(order.price),
                      order.side as 'buy' | 'sell',
                      mockOrderBook,
                      marketConditions,
                      order.type.toLowerCase() as 'market' | 'limit' | 'advanced'
                    ) : null;

                  const filledPercentage = getFilledPercentage(order.filledQuantity, order.quantity);

                  return (
                    <div
                      key={order.id}
                      className="grid grid-cols-8 gap-2 text-sm hover:bg-muted rounded px-2 py-2 transition-colors"
                    >
                      <div className="text-foreground font-mono text-xs">
                        {order.symbol}
                      </div>
                      <div className={`text-xs font-medium ${
                        order.side === 'buy' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {order.side.toUpperCase()}
                      </div>
                      <div className="text-foreground font-mono text-xs">
                        {order.quantity}
                      </div>
                      <div className="text-foreground font-mono text-xs">
                        {order.price || 'Market'}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {filledPercentage}%
                      </div>
                      <div className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                      <div className="text-xs">
                        {fillTimeEstimate ? (
                          <CompactFillTimeDisplay estimate={fillTimeEstimate} />
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                      <div className="text-xs">
                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Empty state when no orders */}
              {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No orders yet</div>
                  <div className="text-xs mt-1">Your trading history will appear here</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}