import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Shield, 
  Key, 
  User, 
  Gift, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from "lucide-react";

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const userProfile = {
    uid: "EQ" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    email: user?.email || "user@example.com",
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Avatar 
        className="cursor-pointer"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <AvatarImage src="" />
        <AvatarFallback className="bg-yellow-500 text-black">
          {userProfile.email.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Card className="bg-gray-800 border-gray-700 w-64 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-700">
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

              <div className="space-y-2">
                <Link href="/account-dash">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Self-service</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/account-dash?tab=security">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Security</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/account-dash?tab=membership">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>EQCRYPTO Membership</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/account-dash?tab=referral">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Referral</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                
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
                
                <Link href="/account-dash?tab=api">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>My API</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/account-dash?tab=messages">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Messages</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>

                <hr className="border-gray-700 my-2" />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}