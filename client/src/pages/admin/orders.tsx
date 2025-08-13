import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Platform } from "@/components/PlatformSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Search, 
  Filter,
  MoreHorizontal,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, Order } from "@/lib/adminApi";

export default function AdminOrders() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("cex");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSide, setFilterSide] = useState<string>("all");

  const fetchOrders = async () => {
    if (currentPlatform === "dex") {
      // Mock DEX data
      const mockOrders: Order[] = [
        {
          id: "1",
          user_id: "user1",
          user_email: "dex.user@example.com",
          symbol: "BTC/USDT",
          side: "buy",
          type: "market",
          status: "filled",
          amount: 0.5,
          price: 45000,
          total: 22500,
          created_at: "2024-01-20T10:30:00Z",
          updated_at: "2024-01-20T10:31:00Z"
        }
      ];
      setOrders(mockOrders);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPlatform]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSide = filterSide === "all" || order.side === filterSide;
    return matchesSearch && matchesStatus && matchesSide;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "cancelled": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      case "rejected": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "filled": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "rejected": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSideColor = (side: string) => {
    return side === "buy" 
      ? "text-green-400 bg-green-500/10 border-green-500/20"
      : "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalVolume = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const filledOrders = orders.filter(order => order.status === "filled").length;

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
              {currentPlatform.toUpperCase()} Orders
            </h1>
            <p className="text-gray-400 mt-1">
              Monitor and manage trading orders
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{orders.length}</div>
                  <div className="text-sm text-gray-400">Total Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalVolume)}</div>
                  <div className="text-sm text-gray-400">Total Volume</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{pendingOrders}</div>
                  <div className="text-sm text-gray-400">Pending Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{filledOrders}</div>
                  <div className="text-sm text-gray-400">Filled Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders by ID, user, or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="filled">Filled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterSide}
                  onChange={(e) => setFilterSide(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Sides</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Order ID</TableHead>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Symbol</TableHead>
                    <TableHead className="text-gray-300">Side</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Total</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-gray-700">
                      <TableCell className="font-mono text-sm text-white">
                        #{order.id}
                      </TableCell>
                      <TableCell className="text-white">{order.user_email}</TableCell>
                      <TableCell className="font-medium text-white">{order.symbol}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getSideColor(order.side)}>
                          {order.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white capitalize">{order.type}</TableCell>
                      <TableCell className="text-white">{order.amount}</TableCell>
                      <TableCell className="text-white">{formatCurrency(order.price)}</TableCell>
                      <TableCell className="text-white font-medium">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {order.status === "pending" && (
                              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Order
                              </DropdownMenuItem>
                            )}
                            {order.status === "pending" && (
                              <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
