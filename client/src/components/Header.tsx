import { Link, useLocation } from 'wouter';
import { Search, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import UserDropdown from '@/components/UserDropdown';

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Markets', href: '/markets' },
    { label: 'Trade', href: '/exchange' },
    { label: 'Derivatives', href: '/derivatives' },
  ];

  return (
    <header className="relative h-14 bg-gradient-to-r from-slate-300 via-slate-400 to-black border-b border-slate-600">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full gap-6">
          {/* Logo */}
          <Link href="/">
            <div className="text-xl font-bold text-black hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap">
              EQCRYPTO
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map(({ label, href }) => (
              <Link key={href} href={href}>
                <a className={`text-sm font-medium transition-colors whitespace-nowrap px-2 py-1 rounded ${
                  location === href 
                    ? 'text-white bg-black/20' 
                    : 'text-gray-800 hover:text-black'
                }`}>
                  {label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search markets..."
              className="pl-10 h-8 bg-white/80 border-gray-300 text-sm"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Phone Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-800 hover:text-black hover:bg-white/20"
            >
              <Phone className="h-4 w-4" />
            </Button>

            {/* Auth Section */}
            {user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-2">
                {/* Connect Button */}
                <Link href="/auth">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-sm bg-white/80 border-gray-300 text-gray-800 hover:bg-white hover:text-black"
                  >
                    Connect
                  </Button>
                </Link>

                {/* Start Button - Shiny Purple matching reference */}
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="h-8 px-4 text-sm bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 hover:from-purple-700 hover:via-purple-600 hover:to-purple-800 text-white font-medium shadow-lg border border-purple-400/30 relative overflow-hidden"
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
  );
}