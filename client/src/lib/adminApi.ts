// Admin API service for CEX management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  phone?: string;
  status: "active" | "suspended" | "pending";
  kyc_status: "verified" | "pending" | "rejected" | "not_submitted";
  total_orders: number;
  total_volume: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  status: "pending" | "filled" | "cancelled" | "rejected";
  amount: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Market {
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

export interface Analytics {
  totalUsers: number;
  totalOrders: number;
  totalTrades: number;
  totalVolume: number;
  activeMarkets: number;
  systemHealth: {
    database: {
      status: string;
      connected: boolean;
      userCount: number;
    };
    cache: any;
    sessions: any;
    uptime: number;
    memory: any;
  };
}

export interface SystemStatus {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  database: "connected" | "disconnected";
  lastUpdate: string;
}

class AdminApiService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Users API
  async getUsers(): Promise<User[]> {
    return this.makeRequest<User[]>('/api/admin/cex/users');
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    return this.makeRequest<Order[]>('/api/admin/cex/orders');
  }

  // Markets API
  async getMarkets(): Promise<Market[]> {
    return this.makeRequest<Market[]>('/api/admin/cex/markets');
  }

  async getMarket(symbol: string): Promise<Market> {
    return this.makeRequest<Market>(`/api/admin/cex/markets/${symbol}`);
  }

  async updateMarket(symbol: string, data: Partial<Market>): Promise<Market> {
    const response = await fetch(`${API_BASE_URL}/api/admin/cex/markets/${symbol}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update market: ${response.status}`);
    }

    return response.json();
  }

  async disableMarket(symbol: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/cex/markets/${symbol}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to disable market: ${response.status}`);
    }
  }

  // Analytics API
  async getAnalytics(): Promise<Analytics> {
    return this.makeRequest<Analytics>('/api/admin/cex/analytics');
  }

  // System API
  async getSystemStatus(): Promise<SystemStatus> {
    const systemData = await this.makeRequest<any>('/api/admin/cex/system');
    
    // Transform the API response to match our interface
    return {
      status: systemData.database?.status === 'healthy' ? 'healthy' : 'warning',
      uptime: systemData.uptime || 99.9,
      cpu: 45, // Mock CPU usage
      memory: 62, // Mock memory usage
      disk: 78, // Mock disk usage
      database: systemData.database?.connected ? 'connected' : 'disconnected',
      lastUpdate: new Date().toLocaleTimeString(),
    };
  }

  // Dashboard metrics (combines multiple endpoints)
  async getDashboardMetrics() {
    try {
      const [analytics, users, orders] = await Promise.all([
        this.getAnalytics(),
        this.getUsers(),
        this.getOrders(),
      ]);

      return {
        totalUsers: analytics.totalUsers,
        totalOrders: analytics.totalOrders,
        totalVolume: analytics.totalVolume,
        activeUsers: users.filter(u => u.status === 'active').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        systemHealth: analytics.systemHealth.database.status,
        uptime: analytics.systemHealth.uptime,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminApiService();

