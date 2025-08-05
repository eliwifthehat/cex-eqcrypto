import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Bell, User, Lock, BarChart3, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserProfile {
  id: number;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: string;
  kycStatus: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  slippageTolerance: string;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [useCustomSlippage, setUseCustomSlippage] = useState(false);

  // Fetch user profile
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/user-profile/${user.id}`);
        if (response.ok) {
          const userProfile = await response.json();
          setProfile(userProfile);
          setSlippageTolerance(parseFloat(userProfile.slippageTolerance || "0.5"));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSlippageChange = (value: string) => {
    if (value === 'custom') {
      setUseCustomSlippage(true);
      setSlippageTolerance(parseFloat(customSlippage) || 0.5);
    } else {
      setUseCustomSlippage(false);
      setSlippageTolerance(parseFloat(value));
    }
  };

  const handleSaveSlippage = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const slippageValue = useCustomSlippage ? parseFloat(customSlippage) : slippageTolerance;
      
      if (isNaN(slippageValue) || slippageValue < 0.01 || slippageValue > 10) {
        toast({
          title: "Invalid Slippage",
          description: "Slippage must be between 0.01% and 10%",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/user-profile/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slippageTolerance: slippageValue.toString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: `Slippage tolerance updated to ${slippageValue}%`,
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving slippage:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save slippage settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Trading Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Trading Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Slippage Tolerance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="slippage" className="text-sm font-medium">
                    Slippage Tolerance
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Maximum price deviation you're willing to accept when your order is filled. 
                          Lower values reduce risk but may cause more orders to fail.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Select 
                  value={useCustomSlippage ? 'custom' : slippageTolerance.toString()} 
                  onValueChange={handleSlippageChange}
                >
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="0.1">0.1%</SelectItem>
                    <SelectItem value="0.3">0.3%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1">1%</SelectItem>
                    <SelectItem value="2">2%</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {useCustomSlippage && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="0.5"
                      value={customSlippage}
                      onChange={(e) => setCustomSlippage(e.target.value)}
                      className="w-20 bg-gray-800 border-gray-700 text-sm"
                      min="0.01"
                      max="10"
                      step="0.01"
                    />
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                )}

                <Button 
                  onClick={handleSaveSlippage}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                Current setting: {slippageTolerance}% • Orders exceeding this slippage will be rejected
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">
                  {profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <Switch 
                checked={profile?.twoFactorEnabled} 
                disabled 
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Verification</div>
                <div className="text-sm text-gray-400">
                  {profile?.emailVerified ? 'Verified' : 'Not verified'}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${profile?.emailVerified ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Phone Verification</div>
                <div className="text-sm text-gray-400">
                  {profile?.phoneVerified ? 'Verified' : 'Not verified'}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${profile?.phoneVerified ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">KYC Status</Label>
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-1 ${
                profile?.kycStatus === 'verified' ? 'bg-green-900/30 text-green-400' :
                profile?.kycStatus === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {profile?.kycStatus?.toUpperCase() || 'NOT STARTED'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">First Name</Label>
                <div className="text-sm text-gray-400 mt-1">
                  {profile?.firstName || 'Not set'}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Name</Label>
                <div className="text-sm text-gray-400 mt-1">
                  {profile?.lastName || 'Not set'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 