import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Phone, 
  Mail, 
  Key, 
  AlertTriangle, 
  Check, 
  Settings,
  User,
  Gift,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Trash2
} from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Mock user data - in real app this would come from API
  const userProfile = {
    uid: "EQ" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    email: user?.email || "user@example.com",
    phone: "+1 ***-***-1234",
    ipAddress: "51.158.203.8",
    securityLevel: "Low",
    withdrawalLimit: "300000/300000 USDT",
    identityVerified: false,
    phoneVerified: false,
    googleAuthEnabled: false,
    antiPhishingEnabled: false,
    withdrawalWhitelist: []
  };

  const securityItems = [
    {
      id: "identity",
      title: "Identity Verification",
      description: "Complete KYC to unlock all features",
      completed: userProfile.identityVerified,
      action: "Verification",
      level: "Required"
    },
    {
      id: "phone",
      title: "Phone",
      description: "Receive verification code via SMS for login and other actions",
      completed: userProfile.phoneVerified,
      action: "Setting",
      level: "Recommended",
      comingSoon: true
    },
    {
      id: "google",
      title: "Google Auth",
      description: "Receive verification code via Google Authenticator for login and other actions",
      completed: userProfile.googleAuthEnabled,
      action: "Setting",
      level: "Recommended"
    },
    {
      id: "phishing",
      title: "Anti-phishing Code",
      description: "Emails sent to you by EQCRYPTO will contain the anti-phishing code you set to prevent counterfeit emails",
      completed: userProfile.antiPhishingEnabled,
      action: "Setting",
      level: "Optional"
    },
    {
      id: "whitelist",
      title: "Withdrawal Whitelist",
      description: "Once enabled, you will only be able to withdraw coins to the address where the whitelist is enabled",
      completed: userProfile.withdrawalWhitelist.length > 0,
      action: "Add",
      level: "Optional"
    }
  ];

  const getSecurityScore = () => {
    const completed = securityItems.filter(item => item.completed).length;
    return Math.round((completed / securityItems.length) * 100);
  };

  const getSecurityLevel = () => {
    const score = getSecurityScore();
    if (score >= 80) return { level: "High", color: "text-green-400" };
    if (score >= 50) return { level: "Medium", color: "text-yellow-400" };
    return { level: "Low", color: "text-red-400" };
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Navigation */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="text-2xl font-bold text-foreground cursor-pointer">
                  EQCRYPTO
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/markets" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Markets
                </Link>
                <Link href="/exchange" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Trade
                </Link>
                <Link href="/derivatives" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Derivatives
                </Link>
              </nav>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <AuthButton />
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Navigation Tabs */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700 mb-8">
            <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">Security</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
            <TabsTrigger value="messages">My Message</TabsTrigger>
            <TabsTrigger value="api">My API</TabsTrigger>
            <TabsTrigger value="membership">LBK Membership</TabsTrigger>
            <TabsTrigger value="devices">My Devices</TabsTrigger>
          </TabsList>

          {/* User Profile Header */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-yellow-500 text-black text-xl">
                      {userProfile.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl text-white">{userProfile.email.replace(/(.{2}).*(@.*)/, '$1****$2')}</h2>
                      <Badge variant="outline" className="border-red-500 text-red-400">
                        Identity not verified
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-400">Email</span>
                        <div className="text-white">{userProfile.email.replace(/(.{2}).*(@.*)/, '$1****$2')}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">UID</span>
                        <div className="text-white flex items-center">
                          {userProfile.uid}
                          <Button variant="ghost" size="sm" className="p-1 ml-1">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">IP Address</span>
                        <div className="text-white">{userProfile.ipAddress}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Security level</span>
                        <div className={getSecurityLevel().color}>{getSecurityLevel().level}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">24h withdrawal limit</div>
                  <div className="text-white font-medium">{userProfile.withdrawalLimit}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Security Settings */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Security Alert */}
                    <Alert className="bg-orange-900/20 border-orange-800">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <AlertDescription className="text-orange-400">
                        <strong>Security settings incomplete</strong>
                        <br />
                        Complete the recommended security settings to protect your account
                      </AlertDescription>
                    </Alert>

                    {/* Security Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Security Score</span>
                        <span className="text-white">{getSecurityScore()}%</span>
                      </div>
                      <Progress value={getSecurityScore()} className="h-2" />
                    </div>

                    {/* Security Items */}
                    <div className="space-y-4">
                      {securityItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-green-600' : 'bg-gray-600'
                            }`}>
                              {item.completed ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-white font-medium">{item.title}</h3>
                                {item.level === "Required" && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                {item.comingSoon && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-600">Coming Soon</Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">{item.description}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                            disabled={item.comingSoon}
                          >
                            {item.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Account Menu */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-yellow-500 text-black">
                          {userProfile.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{userProfile.email.replace(/(.{2}).*(@.*)/, '$1****$2')}</div>
                        <div className="text-gray-400 text-sm">UID: {userProfile.uid}</div>
                        <div className="text-red-400 text-xs">Identity not verified</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <HelpCircle className="w-4 h-4" />
                        <span>Self-service</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Security</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>EQCRYPTO Membership</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Referral</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4" />
                        <span>My Red Packets</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4" />
                        <span>My Coupons</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>My API</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <hr className="border-gray-700 my-4" />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-700"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">API Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-blue-900/20 border-blue-800">
                    <Key className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-400">
                      API keys allow third-party applications to access your account. Keep them secure!
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">API Key</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-gray-300 text-sm">
                          {showApiKey ? 'ek_live_51H...' : '•••••••••••••••••••••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-1"
                        >
                          {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500">
                      Generate New
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-white text-lg mb-2">Invite Friends & Earn Rewards</h3>
                  <p className="text-gray-400 mb-4">Get commission for every friend you refer to EQCRYPTO</p>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    Get Referral Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Message Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-white text-lg mb-2">No Messages</h3>
                  <p className="text-gray-400">System notifications and updates will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">EQCRYPTO Membership</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-white text-lg mb-2">VIP Membership</h3>
                  <p className="text-gray-400 mb-4">Unlock exclusive benefits and lower trading fees</p>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    Upgrade to VIP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Device Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Current Device</h3>
                      <p className="text-gray-400 text-sm">Chrome on Mac • IP: {userProfile.ipAddress}</p>
                      <p className="text-gray-400 text-xs">Last active: Now</p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Security Features Section */}
        <div className="mt-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Email & Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Section */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Email</h3>
                    <p className="text-gray-400 text-sm">Receive verification code via email for login and other actions</p>
                    <p className="text-gray-300 text-sm mt-1">{userProfile.email.replace(/(.{2}).*(@.*)/, '$1****$2')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                  Setting
                </Button>
              </div>

              {/* Login Password */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-white font-medium">Login Password</h3>
                    <p className="text-gray-400 text-sm">This password is used for your login check</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                  Setting
                </Button>
              </div>

              {/* Fund Password */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-white font-medium">Fund Password</h3>
                    <p className="text-gray-400 text-sm">This password is used for your transaction verification</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                  Setting
                </Button>
              </div>

              {/* IP Whitelist */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-orange-400" />
                  <div>
                    <h3 className="text-white font-medium">IP Whitelist</h3>
                    <p className="text-gray-400 text-sm">After opening, only the IPs in the whitelist can access your account, please open it carefully.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                  Setting
                </Button>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Payment Method</h3>
                    <p className="text-gray-400 text-sm">The payment term is not bound yet</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                  Add
                </Button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-red-600">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-white font-medium">Delete your account</h3>
                    <p className="text-gray-400 text-sm">Once you choose to cancel your account, it will be permanently deactivated and cannot be recovered</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}