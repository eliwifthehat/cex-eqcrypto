import { Link, useLocation } from 'wouter';
import { Search, Smartphone, QrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/components/AuthProvider';
import UserDropdown from '@/components/UserDropdown';
import { useState } from 'react';

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Markets', href: '/markets' },
    { label: 'Trade', href: '/exchange' },
    { label: 'Derivatives', href: '/derivatives' },
  ];

  // Token categories for search dropdown
  const tokenCategories = {
    popular: [
      { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
      { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
      { symbol: 'SOL', name: 'Solana', icon: '◎' },
      { symbol: 'BNB', name: 'BNB', icon: '🔶' },
    ],
    memecoins: [
      { symbol: 'DOGE', name: 'Dogecoin', icon: '🐕' },
      { symbol: 'SHIB', name: 'Shiba Inu', icon: '🔥' },
      { symbol: 'PEPE', name: 'Pepe', icon: '🐸' },
      { symbol: 'FLOKI', name: 'Floki', icon: '🚀' },
    ],
    defi: [
      { symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
      { symbol: 'AAVE', name: 'Aave', icon: '👻' },
      { symbol: 'COMP', name: 'Compound', icon: '🏛️' },
      { symbol: 'MKR', name: 'Maker', icon: '🎯' },
    ]
  };

  const filteredTokens = Object.entries(tokenCategories).reduce((acc, [category, tokens]) => {
    const filtered = tokens.filter(token => 
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof tokenCategories.popular>);

  const handleWalletConnect = async () => {
    if (isWalletConnected) {
      // Disconnect wallet
      setIsWalletConnected(false);
    } else {
      // Connect to MetaMask or other wallet
      try {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          setIsWalletConnected(true);
        } else {
          // Show QR code for mobile wallet connection
          setShowQRDialog(true);
        }
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    }
  };

  return (
    <>
      <header className="relative h-14 bg-gradient-to-r from-slate-300 via-slate-400 to-black border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full gap-6">
            {/* Logo */}
            <Link href="/">
              <div className="text-2xl font-bold text-white">
                EQCRYPTO
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className={`text-sm font-medium transition-colors hover:text-white ${
                    location === item.href ? 'text-white' : 'text-gray-300'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Token Search Bar */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="BC"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowTokenDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowTokenDropdown(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowTokenDropdown(false), 200)}
                className="pl-10 h-8 bg-black/80 border-gray-600 text-white text-sm rounded-full placeholder-gray-400"
              />
              
              {/* Token Dropdown */}
              {showTokenDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {Object.entries(filteredTokens).map(([category, tokens]) => (
                    <div key={category} className="p-2">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2 px-2">
                        {category}
                      </div>
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded text-left"
                          onClick={() => {
                            setSearchTerm(token.symbol);
                            setShowTokenDropdown(false);
                          }}
                        >
                          <span className="text-lg">{token.icon}</span>
                          <div>
                            <div className="text-white font-medium">{token.symbol}</div>
                            <div className="text-gray-400 text-xs">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile/QR Icon */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-800 hover:text-black hover:bg-white/20"
                onClick={() => setShowQRDialog(true)}
              >
                <Smartphone className="h-4 w-4" />
              </Button>

              {/* Auth Section */}
              {user ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center gap-2">
                  {/* Web3 Connect Button - Circular with state changes */}
                  <Button
                    onClick={handleWalletConnect}
                    className={`w-10 h-10 rounded-full p-0 border-2 transition-all duration-300 ${
                      isWalletConnected 
                        ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 hover:from-red-600 hover:to-red-800 shadow-lg shadow-red-500/25' 
                        : 'bg-gradient-to-br from-gray-300 via-silver to-gray-400 border-gray-300 hover:from-gray-200 hover:to-gray-300 shadow-lg shadow-gray-400/25'
                    }`}
                    style={{
                      background: isWalletConnected 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
                        : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)',
                      boxShadow: isWalletConnected
                        ? '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 4px 15px rgba(156, 163, 175, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="text-sm font-bold text-black">
                      {isWalletConnected ? '●' : '○'}
                    </span>
                  </Button>

                  {/* Start Button - More circular shape */}
                  <Link href="/auth">
                    <Button
                      className="h-10 px-6 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 hover:from-purple-700 hover:via-purple-600 hover:to-purple-800 text-white shadow-lg border border-purple-400/30 relative overflow-hidden transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #7c3aed 100%)',
                        boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <span className="relative z-10">Start</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Connect Mobile Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6">
            <div className="bg-white p-4 rounded-lg">
              {/* QR Code placeholder - would typically generate actual QR code */}
              <div className="w-48 h-48 bg-black flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-2">Scan with your mobile wallet</p>
              <p className="text-gray-400 text-sm">
                MetaMask, Trust Wallet, or any WalletConnect compatible wallet
              </p>
            </div>
            <Button
              onClick={() => setShowQRDialog(false)}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}