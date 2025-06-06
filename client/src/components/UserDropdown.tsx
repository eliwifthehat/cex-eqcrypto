import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Key, 
  Crown, 
  Users, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from "lucide-react";

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const userProfile = {
    uid: "EQ" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    email: user?.email || "user@example.com",
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleSecurityClick = () => {
    setLocation('/account-dash?tab=security');
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // Handle click based on auth state
  const handleAvatarClick = () => {
    if (!user) {
      // Store the current page to redirect back after login
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      setLocation('/auth');
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative user-dropdown">
      {user ? (
        <Avatar 
          className="cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
          onClick={handleAvatarClick}
        >
          <AvatarImage src="" />
          <AvatarFallback className="bg-yellow-500 text-black text-sm font-medium">
            {userProfile.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <button
          onClick={handleAvatarClick}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
        >
          Start
        </button>
      )}

      {isOpen && user && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="bg-gray-800 border-gray-700 w-64 shadow-xl">
            <CardContent className="p-4">
              <div 
                onClick={handleSecurityClick}
                className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-700 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors cursor-pointer border border-gray-600 hover:border-gray-500"
              >
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
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => {
                    setLocation('/account-dash');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Self-service</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => {
                    setLocation('/account-dash?tab=security');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Security</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => {
                    setLocation('/account-dash?tab=membership');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>EQCRYPTO Membership</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => {
                    setLocation('/account-dash?tab=api');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>My API</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => {
                    setLocation('/account-dash?tab=referral');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Referral</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => {
                    setLocation('/account-dash?tab=messages');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>Messages</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>

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