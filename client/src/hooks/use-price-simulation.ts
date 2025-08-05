import { useState, useEffect, useRef } from "react";

export interface PriceData {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function usePriceSimulation(initialPrice: number = 42350.00) {
  const [priceData, setPriceData] = useState<PriceData>({
    currentPrice: initialPrice,
    priceChange: 350.00,
    priceChangePercent: 0.83,
    high24h: 42560.00,
    low24h: 41850.00,
    lastUpdate: new Date(),
    isConnected: false,
    connectionStatus: 'disconnected'
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // REST API fallback for getting price data
  const fetchPriceFromAPI = async () => {
    try {
      // Use CoinGecko API as fallback (no API key required)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true');
      const data = await response.json();
      
      if (data.bitcoin) {
        const currentPrice = data.bitcoin.usd;
        const priceChangePercent = data.bitcoin.usd_24h_change || 0;
        const high24h = data.bitcoin.usd_24h_high || currentPrice;
        const low24h = data.bitcoin.usd_24h_low || currentPrice;
        
        // Calculate price change in USD
        const priceChange = (currentPrice * priceChangePercent) / 100;
        
        setPriceData(prev => ({
          currentPrice,
          priceChange,
          priceChangePercent,
          high24h,
          low24h,
          lastUpdate: new Date(),
          isConnected: true,
          connectionStatus: 'connected'
        }));
      }
    } catch (error) {
      console.error('Failed to fetch price from API:', error);
      // Fall back to simulation
      setPriceData(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  };

  const connectWebSocket = () => {
    try {
      setPriceData(prev => ({ ...prev, connectionStatus: 'connecting' }));
      
      // Try a different WebSocket endpoint that's more reliable
      const ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@ticker');
      
      ws.onopen = () => {
        console.log('WebSocket connected to Binance');
        setPriceData(prev => ({ 
          ...prev, 
          isConnected: true, 
          connectionStatus: 'connected' 
        }));
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.s === 'BTCUSDT') {
            const currentPrice = parseFloat(data.c);
            const priceChange = parseFloat(data.P);
            const priceChangePercent = parseFloat(data.P);
            const high24h = parseFloat(data.h);
            const low24h = parseFloat(data.l);
            
            setPriceData(prev => ({
              currentPrice,
              priceChange,
              priceChangePercent,
              high24h,
              low24h,
              lastUpdate: new Date(),
              isConnected: true,
              connectionStatus: 'connected'
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setPriceData(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        }));
        
        // Try REST API instead of reconnecting WebSocket
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`WebSocket failed, trying REST API (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          fetchPriceFromAPI();
        } else {
          setPriceData(prev => ({ ...prev, connectionStatus: 'error' }));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setPriceData(prev => ({ ...prev, connectionStatus: 'error' }));
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Try REST API instead
      fetchPriceFromAPI();
    }
  };

  useEffect(() => {
    // Try WebSocket first, then fall back to REST API
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Set up polling for REST API if WebSocket fails
  useEffect(() => {
    if (priceData.connectionStatus === 'error' || priceData.connectionStatus === 'disconnected') {
      // Poll REST API every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchPriceFromAPI();
      }, 10000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [priceData.connectionStatus]);

  // Fallback to simulation if both WebSocket and REST API fail
  useEffect(() => {
    if (priceData.connectionStatus === 'error' && !priceData.isConnected) {
      const interval = setInterval(() => {
        setPriceData(prev => {
          // Only update if not connected to real data
          if (prev.isConnected) return prev;
          
          // Simulate small price movements
          const change = (Math.random() - 0.5) * 20;
          const newPrice = Math.max(prev.currentPrice + change, 40000);
          
          // Calculate 24h change
          const startPrice = initialPrice - 350;
          const totalChange = newPrice - startPrice;
          const percentChange = (totalChange / startPrice) * 100;
          
          // Update 24h high/low
          const newHigh = Math.max(prev.high24h, newPrice);
          const newLow = Math.min(prev.low24h, newPrice);
          
          return {
            ...prev,
            currentPrice: newPrice,
            priceChange: totalChange,
            priceChangePercent: percentChange,
            high24h: newHigh,
            low24h: newLow,
            lastUpdate: new Date(),
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [priceData.connectionStatus, priceData.isConnected, initialPrice]);

  return priceData;
}
