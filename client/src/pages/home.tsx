import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Shield, Zap, Users, TrendingUp, BarChart3, Smartphone } from "lucide-react";
import { Link } from "wouter";
import UserDropdown from "@/components/UserDropdown";

export default function Home() {
  // Statistics data
  const stats = [
    { label: "300+", sublabel: "Cryptocurrencies" },
    { label: "190+", sublabel: "Countries" },
    { label: "500K+", sublabel: "Active Users" },
    { label: "$230M+", sublabel: "Daily Volume" },
  ];

  // Crypto rewards data with placeholder paths for future images
  const cryptoRewards = [
    { name: "Bitcoin", symbol: "BTC", apy: "5.2%", imagePath: "/crypto-icons/bitcoin.svg" },
    { name: "Ethereum", symbol: "ETH", apy: "4.8%", imagePath: "/crypto-icons/ethereum.svg" },
    { name: "Solana", symbol: "SOL", apy: "6.1%", imagePath: "/crypto-icons/solana.svg" },
    { name: "Cardano", symbol: "ADA", apy: "5.5%", imagePath: "/crypto-icons/cardano.svg" },
    { name: "Polygon", symbol: "MATIC", apy: "7.2%", imagePath: "/crypto-icons/polygon.svg" },
    { name: "Chainlink", symbol: "LINK", apy: "4.9%", imagePath: "/crypto-icons/chainlink.svg" },
    { name: "Polkadot", symbol: "DOT", apy: "8.1%", imagePath: "/crypto-icons/polkadot.svg" },
    { name: "Avalanche", symbol: "AVAX", apy: "6.8%", imagePath: "/crypto-icons/avalanche.svg" },
    { name: "Cosmos", symbol: "ATOM", apy: "9.2%", imagePath: "/crypto-icons/cosmos.svg" },
    { name: "Near", symbol: "NEAR", apy: "7.5%", imagePath: "/crypto-icons/near.svg" },
  ];

  // Why choose us features
  const features = [
    { 
      title: "Lightning-Fast Execution", 
      description: "Execute trades in milliseconds with our advanced matching engine",
      imagePath: "/features/speed.svg" 
    },
    { 
      title: "Bank-Grade Security", 
      description: "Multi-layer security with cold storage and insurance protection",
      imagePath: "/features/security.svg" 
    },
    { 
      title: "24/7 Global Support", 
      description: "Round-the-clock customer support in multiple languages",
      imagePath: "/features/support.svg" 
    },
  ];

  // Portfolio crypto assets
  const portfolioAssets = [
    { name: "Bitcoin", symbol: "BTC", imagePath: "/portfolio/bitcoin.svg" },
    { name: "Ethereum", symbol: "ETH", imagePath: "/portfolio/ethereum.svg" },
    { name: "Binance Coin", symbol: "BNB", imagePath: "/portfolio/binance.svg" },
    { name: "Solana", symbol: "SOL", imagePath: "/portfolio/solana.svg" },
    { name: "XRP", symbol: "XRP", imagePath: "/portfolio/xrp.svg" },
    { name: "Cardano", symbol: "ADA", imagePath: "/portfolio/cardano.svg" },
    { name: "Dogecoin", symbol: "DOGE", imagePath: "/portfolio/dogecoin.svg" },
    { name: "Polygon", symbol: "MATIC", imagePath: "/portfolio/polygon.svg" },
    { name: "Chainlink", symbol: "LINK", imagePath: "/portfolio/chainlink.svg" },
    { name: "Avalanche", symbol: "AVAX", imagePath: "/portfolio/avalanche.svg" },
    { name: "Litecoin", symbol: "LTC", imagePath: "/portfolio/litecoin.svg" },
    { name: "Uniswap", symbol: "UNI", imagePath: "/portfolio/uniswap.svg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-900 text-white">
      {/* Header Navigation - Keep existing EQCRYPTO branding */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="text-2xl font-bold text-white cursor-pointer">
                  EQCRYPTO
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/">
                  <a className="text-white hover:text-purple-300 transition-colors px-3 py-2 rounded-md text-sm font-medium bg-purple-600/30">
                    Home
                  </a>
                </Link>
                <Link href="/markets">
                  <a className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Markets
                  </a>
                </Link>
                <Link href="/exchange">
                  <a className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Trade
                  </a>
                </Link>
                <Link href="/derivatives">
                  <a className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Derivatives
                  </a>
                </Link>
              </nav>
            </div>
            
            {/* Auth Area with Start button */}
            <div className="flex items-center">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Millions Trust EQCRYPTO,
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {" "}Your Leading Crypto Platform
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Trade, earn, and secure your digital assets on the world's most trusted cryptocurrency platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/auth">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-xl">
                    Start
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">{stat.label}</div>
                    <div className="text-sm text-gray-400">{stat.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Phone mockup placeholder */}
            <div className="relative">
              <div className="w-80 h-96 mx-auto bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border border-gray-600 p-4">
                <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                  <Smartphone className="h-24 w-24 text-purple-400 opacity-50" />
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute top-10 -left-10 w-16 h-16 bg-purple-500 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute bottom-20 -right-10 w-12 h-12 bg-blue-500 rounded-full opacity-40 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Buy Crypto Easily Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* Trading interface placeholder */}
              <div className="w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-6">
                <div className="flex items-center justify-center h-full">
                  <BarChart3 className="h-32 w-32 text-purple-400 opacity-50" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Buy Crypto Easily and Securely in Minutes
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-300">Fast and secure verification process</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-300">Multiple payment methods accepted</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-300">Industry-leading security standards</p>
                </div>
              </div>
              <Link href="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Earn Rewards Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Earn Rewards on Your Crypto
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Start earning up to 12% APY on your favorite cryptocurrencies
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {cryptoRewards.map((crypto, index) => (
              <Card key={index} className="bg-black/40 border-gray-600 hover:border-purple-500 transition-colors">
                <CardContent className="p-6 text-center">
                  {/* Crypto icon placeholder */}
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full"></div>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{crypto.symbol}</h3>
                  <p className="text-gray-400 text-sm mb-2">{crypto.name}</p>
                  <p className="text-green-400 font-bold">{crypto.apy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/auth">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl">
                Start Earning
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Choose EQCRYPTO for Crypto Trading?
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Experience the best-in-class trading platform trusted by millions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/40 border-gray-600 text-center">
                <CardContent className="p-8">
                  {/* Feature image placeholder */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-2xl flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/auth">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trade Spot and Margin Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Trade Spot And Margin, All in One Powerful Interface
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Advanced trading tools for professionals and beginners alike
          </p>
          
          {/* Trading interface placeholder */}
          <div className="relative mb-12">
            <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-600 p-8">
              <div className="flex items-center justify-center h-full">
                <TrendingUp className="h-32 w-32 text-purple-400 opacity-50" />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/exchange">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl">
                Trade Crypto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Build Your Crypto Portfolio Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Build Your Crypto Portfolio
          </h2>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
            {portfolioAssets.map((asset, index) => (
              <div key={index} className="text-center group cursor-pointer">
                {/* Crypto icon placeholder */}
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full"></div>
                </div>
                <p className="text-white font-semibold text-sm">{asset.symbol}</p>
                <p className="text-gray-400 text-xs">{asset.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start Your Crypto Journey Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Start Your Crypto Journey
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join millions of users worldwide and start trading today
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-lg rounded-xl">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">EQCRYPTO</div>
              <p className="text-gray-400">Your trusted cryptocurrency exchange platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Spot Trading</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Margin Trading</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Derivatives</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Staking</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Careers</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Blog</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Press</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Help Center</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Contact</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Privacy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2024 EQCRYPTO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}