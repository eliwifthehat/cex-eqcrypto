import { Link, useLocation } from 'wouter';
import { Search, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/components/AuthProvider';
import UserDropdown from '@/components/UserDropdown';
import { useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Removed MetaMask/Ethereum wallet connection
  // This is a Solana-based exchange, not Ethereum

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full gap-6">
            {/* Logo - Far Left */}
            <Link href="/">
              <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                EQCRYPTO
              </div>
            </Link>

            {/* Mobile Right Side - Account + Hamburger */}
            <div className="lg:hidden flex items-center gap-3">
              {/* User Account/Avatar */}
              {user ? (
                <UserDropdown />
              ) : (
                <Link href="/auth">
                  <Button
                    className="h-10 px-4 text-sm font-medium rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-white hover:bg-purple-500/30"
                  >
                    Start
                  </Button>
                </Link>
              )}
              
              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 w-10 h-10 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className={`text-sm font-medium transition-all duration-300 hover:text-white hover:drop-shadow-lg ${
                    location === item.href 
                      ? 'text-white drop-shadow-lg bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm' 
                      : 'text-white/80 hover:bg-white/5 px-3 py-2 rounded-full'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Desktop Token Search Bar */}
            <div className="relative flex-1 max-w-xs hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="BC"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowTokenDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowTokenDropdown(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowTokenDropdown(false), 200)}
                className="pl-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full placeholder-white/50 focus:bg-white/15 focus:border-white/30 transition-all duration-300"
              />
              
              {/* Token Dropdown */}
              {showTokenDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  {Object.entries(filteredTokens).map(([category, tokens]) => (
                    <div key={category} className="p-3">
                      <div className="text-xs text-white/50 uppercase tracking-wide mb-2 px-2 font-medium">
                        {category}
                      </div>
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg text-left transition-all duration-200 backdrop-blur-sm"
                          onClick={() => {
                            setSearchTerm(token.symbol);
                            setShowTokenDropdown(false);
                          }}
                        >
                          <span className="text-lg">{token.icon}</span>
                          <div>
                            <div className="text-white font-medium">{token.symbol}</div>
                            <div className="text-white/60 text-xs">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Auth Section */}
              {user ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center gap-3">
                  {/* Wallet connection removed - Solana exchange uses different auth */}

                  {/* Start Button - Glassmorphism style */}
                  <Link href="/auth">
                    <Button
                      className="h-12 px-8 text-sm font-medium rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-white hover:bg-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden"
                    >
                      <span className="relative z-10 font-semibold">Start</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </Button>
                  </Link>
                </div>
              )}
            </div>


          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/20 shadow-xl">
            <div className="p-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <Input
                  placeholder="Search tokens"
                  className="pl-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full placeholder-white/50"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span 
                      className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        location === item.href 
                          ? 'text-white bg-white/10 backdrop-blur-sm' 
                          : 'text-white/80 hover:bg-white/5'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
                
                {/* Settings Link */}
                <Link href="/settings">
                  <span 
                    className="flex items-center px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </span>
                </Link>
              </nav>
              
              {/* User Section */}
              {user ? (
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {user.email}
                      </div>
                      <div className="text-xs text-white/60">
                        {user.id}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20">
                  <Link href="/auth">
                    <Button
                      className="w-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-white hover:bg-purple-500/30"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>




    </>
  );
}