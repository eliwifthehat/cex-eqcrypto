import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Platform } from "@/components/PlatformSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";

interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalVolume: number;
  activeUsers: number;
  pendingOrders: number;
  systemHealth: string;
  uptime: number;
  lastUpdated: string;
}

const mockDexMetrics: DashboardMetrics = {
  totalUsers: 1247,
  totalOrders: 8934,
  totalVolume: 2847500,
  activeUsers: 156,
  pendingOrders: 23,
  systemHealth: "Healthy",
  uptime: 99.8,
  lastUpdated: "2 minutes ago"
};

export default function AdminDashboard() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("cex");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (currentPlatform === "dex") {
      setMetrics(mockDexMetrics);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [currentPlatform]);

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "critical": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy": return <CheckCircle className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      case "critical": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    format = "number" 
  }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: "up" | "down";
    trendValue?: string;
    format?: "number" | "currency" | "percentage";
  }) => {
    const formatValue = (val: number | string) => {
      if (typeof val === "string") return val;
      
      switch (format) {
        case "currency":
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        case "percentage":
          return `${val}%`;
        default:
          return new Intl.NumberFormat('en-US').format(val);
      }
    };

    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatValue(value)}
          </div>
          {trend && trendValue && (
            <div className="flex items-center space-x-1 text-xs">
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={trend === "up" ? "text-green-400" : "text-red-400"}>
                {trendValue}
              </span>
              <span className="text-gray-400">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
              {currentPlatform.toUpperCase()} Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Real-time overview of {currentPlatform.toUpperCase()} operations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="text-green-400 border-green-500">
              Live
            </Badge>
            {metrics && (
              <span className="text-sm text-gray-400">
                Last updated: {metrics.lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Content */}
        {!isLoading && metrics && (

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={Users}
            trend="up"
            trendValue="+12%"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon={ShoppingCart}
            trend="up"
            trendValue="+8%"
          />
          <MetricCard
            title="Total Volume"
            value={metrics.totalVolume}
            icon={DollarSign}
            format="currency"
            trend="up"
            trendValue="+15%"
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            icon={Activity}
            trend="up"
            trendValue="+5%"
          />
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getHealthIcon(metrics.systemHealth)}
                  <span className={`font-medium ${getHealthColor(metrics.systemHealth)}`}>
                    {metrics.systemHealth}
                  </span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-500">
                  Operational
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white">{metrics.uptime}%</span>
                </div>
                <Progress value={metrics.uptime} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Pending Orders</span>
                  <div className="text-white font-medium">{metrics.pendingOrders}</div>
                </div>
                <div>
                  <span className="text-gray-400">Last Update</span>
                  <div className="text-white font-medium">{metrics.lastUpdated}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Orders
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                System Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New user registered", time: "2 minutes ago", type: "user" },
                { action: "Large order placed", time: "5 minutes ago", type: "order" },
                { action: "System maintenance completed", time: "1 hour ago", type: "system" },
                { action: "Market price updated", time: "2 hours ago", type: "market" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">{activity.action}</span>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </AdminLayout>
  );
}
