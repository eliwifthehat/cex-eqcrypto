import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface OrderStatusUpdate {
  orderId: number;
  status: 'pending' | 'filled' | 'cancelled' | 'failed' | 'partial';
  message: string;
  tradeData?: any;
}

export function useOrderUpdates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState<OrderStatusUpdate[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    // Connect to WebSocket for order updates
    const ws = new WebSocket(`ws://localhost:5002?userId=${user.id}`);
    
    ws.onopen = () => {
      console.log('Connected to order updates WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'order_status_update') {
          const update: OrderStatusUpdate = data.data;
          
          // Add to order updates list
          setOrderUpdates(prev => [...prev, update]);
          
          // Show toast notification based on status
          switch (update.status) {
            case 'pending':
              toast({
                title: "Order Pending",
                description: update.message,
              });
              break;
              
            case 'filled':
              toast({
                title: "Order Filled! 🎉",
                description: update.message,
              });
              break;
              
            case 'cancelled':
              toast({
                title: "Order Cancelled",
                description: update.message,
                variant: "destructive",
              });
              break;
              
            case 'failed':
              toast({
                title: "Order Failed",
                description: update.message,
                variant: "destructive",
              });
              break;
              
            case 'partial':
              toast({
                title: "Order Partially Filled",
                description: update.message,
              });
              break;
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from order updates WebSocket');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.id, toast]);

  return {
    isConnected,
    orderUpdates,
    clearUpdates: () => setOrderUpdates([])
  };
} 