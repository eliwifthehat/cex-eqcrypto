import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Platform } from "@/components/PlatformSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Shield,
  Zap
} from "lucide-react";

interface SystemStatus {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  database: "connected" | "disconnected";
  lastUpdate: string;
}

export default function AdminSystem() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("cex");
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: "healthy",
    uptime: 99.8,
    cpu: 45,
    memory: 62,
    disk: 78,
    database: "connected",
    lastUpdate: "2 minutes ago"
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSystemStatus = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "warning": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      case "critical": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-red-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-green-500";
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
              {currentPlatform.toUpperCase()} System
            </h1>
            <p className="text-gray-400 mt-1">
              System health monitoring and configuration
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshSystemStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline" className={getStatusColor(systemStatus.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(systemStatus.status)}
                <span>{systemStatus.status}</span>
              </div>
            </Badge>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Server className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{systemStatus.uptime}%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{systemStatus.cpu}%</div>
                  <div className="text-sm text-gray-400">CPU Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{systemStatus.memory}%</div>
                  <div className="text-sm text-gray-400">Memory Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{systemStatus.disk}%</div>
                  <div className="text-sm text-gray-400">Disk Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className="text-white">{systemStatus.cpu}%</span>
                </div>
                <Progress value={systemStatus.cpu} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Memory Usage</span>
                  <span className="text-white">{systemStatus.memory}%</span>
                </div>
                <Progress value={systemStatus.memory} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Disk Usage</span>
                  <span className="text-white">{systemStatus.disk}%</span>
                </div>
                <Progress value={systemStatus.disk} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Database Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Connection Status</span>
                </div>
                <Badge variant="outline" className={
                  systemStatus.database === "connected"
                    ? "text-green-400 bg-green-500/10 border-green-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }>
                  {systemStatus.database}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Last Update</span>
                <span className="text-white">{systemStatus.lastUpdate}</span>
              </div>
              
              <div className="pt-4">
                <Button className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Trading Engine</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Badge variant="outline" className="text-green-400 bg-green-500/10 border-green-500/20">
                      Running
                    </Badge>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Trading
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Order Matching</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Badge variant="outline" className="text-green-400 bg-green-500/10 border-green-500/20">
                      Active
                    </Badge>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart Engine
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Security</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">DDoS Protection</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rate Limiting</span>
                  <Switch defaultChecked />
                </div>
                <Button className="w-full" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { level: "info", message: "System health check completed", time: "2 minutes ago" },
                { level: "warning", message: "High CPU usage detected", time: "5 minutes ago" },
                { level: "info", message: "Database backup completed", time: "1 hour ago" },
                { level: "error", message: "Failed to connect to external API", time: "2 hours ago" },
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.level === "error" ? "bg-red-400" :
                      log.level === "warning" ? "bg-yellow-400" : "bg-green-400"
                    }`}></div>
                    <span className="text-white">{log.message}</span>
                  </div>
                  <span className="text-sm text-gray-400">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

