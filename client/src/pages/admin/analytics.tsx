import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Platform } from "@/components/PlatformSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Calendar,
  Download
} from "lucide-react";

export default function AdminAnalytics() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("cex");
  const [timeRange, setTimeRange] = useState("7d");

  // Mock analytics data
  const analyticsData = {
    totalVolume: 2847500,
    totalTrades: 5678,
    activeUsers: 892,
    revenue: 28475,
    volumeChange: 15.2,
    tradesChange: 8.5,
    usersChange: 12.3,
    revenueChange: 18.7
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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
              {currentPlatform.toUpperCase()} Analytics
            </h1>
            <p className="text-gray-400 mt-1">
              Trading performance and platform metrics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Volume
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(analyticsData.totalVolume)}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                {analyticsData.volumeChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={analyticsData.volumeChange > 0 ? "text-green-400" : "text-red-400"}>
                  {analyticsData.volumeChange > 0 ? '+' : ''}{analyticsData.volumeChange}%
                </span>
                <span className="text-gray-400">from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Trades
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(analyticsData.totalTrades)}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                {analyticsData.tradesChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={analyticsData.tradesChange > 0 ? "text-green-400" : "text-red-400"}>
                  {analyticsData.tradesChange > 0 ? '+' : ''}{analyticsData.tradesChange}%
                </span>
                <span className="text-gray-400">from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(analyticsData.activeUsers)}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                {analyticsData.usersChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={analyticsData.usersChange > 0 ? "text-green-400" : "text-red-400"}>
                  {analyticsData.usersChange > 0 ? '+' : ''}{analyticsData.usersChange}%
                </span>
                <span className="text-gray-400">from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(analyticsData.revenue)}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                {analyticsData.revenueChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={analyticsData.revenueChange > 0 ? "text-green-400" : "text-red-400"}>
                  {analyticsData.revenueChange > 0 ? '+' : ''}{analyticsData.revenueChange}%
                </span>
                <span className="text-gray-400">from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Trading Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Volume chart will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4" />
                  <p>User activity chart will be implemented here</p>
                </div>
              </div>
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
                { action: "Large trade executed", amount: "$125,000", time: "2 minutes ago", type: "trade" },
                { action: "New user registered", amount: "User #892", time: "5 minutes ago", type: "user" },
                { action: "Market price updated", amount: "BTC +2.5%", time: "10 minutes ago", type: "market" },
                { action: "System maintenance", amount: "Completed", time: "1 hour ago", type: "system" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">{activity.action}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{activity.amount}</span>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

