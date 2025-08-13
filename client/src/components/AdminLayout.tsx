import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { PlatformSelector, Platform } from "@/components/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Activity,
  Home,
  LogOut,
  Menu,
  X,
  Building2,
  Zap
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

const navigationItems = {
  dex: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "System", href: "/admin/system", icon: Settings },
  ],
  cex: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Markets", href: "/admin/markets", icon: Activity },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "System", href: "/admin/system", icon: Settings },
  ]
};

export function AdminLayout({ 
  children, 
  currentPlatform, 
  onPlatformChange 
}: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const navigation = navigationItems[currentPlatform];

  const Sidebar = () => (
    <div className="bg-gray-900 border-r border-gray-700 w-64 min-h-screen p-4">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="text-2xl font-bold text-white">EQCRYPTO</div>
        <Badge variant="outline" className="text-xs">
          Admin
        </Badge>
      </div>

      {/* Platform Selector */}
      <div className="mb-6">
        <PlatformSelector
          currentPlatform={currentPlatform}
          onPlatformChange={onPlatformChange}
        />
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-500 text-white text-sm">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.email || "Admin User"}
              </div>
              <div className="text-xs text-gray-400">
                {currentPlatform.toUpperCase()} Admin
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar />
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <div className={`${isMobile ? '' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-300 hover:text-white"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                {currentPlatform === "dex" ? (
                  <Zap className="w-5 h-5 text-blue-400" />
                ) : (
                  <Building2 className="w-5 h-5 text-green-400" />
                )}
                <h1 className="text-xl font-semibold text-white">
                  {currentPlatform.toUpperCase()} Administration
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-500">
                Live
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

