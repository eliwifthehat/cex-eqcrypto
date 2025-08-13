import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Platform } from "@/components/PlatformSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  AlertTriangle
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
import { adminApi, User } from "@/lib/adminApi";

export default function AdminUsers() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("cex");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchUsers = async () => {
    if (currentPlatform === "dex") {
      // Mock DEX data
      const mockUsers: User[] = [
        {
          id: "1",
          email: "dex.user1@example.com",
          created_at: "2024-01-15T10:30:00Z",
          last_sign_in_at: "2024-01-20T14:22:00Z",
          email_confirmed_at: "2024-01-15T11:00:00Z",
          phone: "+1234567890",
          status: "active",
          kyc_status: "verified",
          total_orders: 45,
          total_volume: 125000
        }
      ];
      setUsers(mockUsers);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPlatform]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "suspended": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "rejected": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "not_submitted": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              {currentPlatform.toUpperCase()} Users
            </h1>
            <p className="text-gray-400 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchUsers}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add User
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
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{users.length}</div>
                  <div className="text-sm text-gray-400">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === "active").length}
                  </div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => u.kyc_status === "verified").length}
                  </div>
                  <div className="text-sm text-gray-400">KYC Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-sm text-gray-400">New This Week</div>
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
                    placeholder="Search users by email..."
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
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">User Management</CardTitle>
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
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">KYC Status</TableHead>
                    <TableHead className="text-gray-300">Orders</TableHead>
                    <TableHead className="text-gray-300">Volume</TableHead>
                    <TableHead className="text-gray-300">Joined</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-500 text-white text-sm">
                              {user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{user.email}</div>
                            <div className="text-sm text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getKycStatusColor(user.kyc_status)}>
                          {user.kyc_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{user.total_orders}</TableCell>
                      <TableCell className="text-white">{formatCurrency(user.total_volume)}</TableCell>
                      <TableCell className="text-gray-400">{formatDate(user.created_at)}</TableCell>
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
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
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
