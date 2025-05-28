import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Smartphone, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  // Mock live prices data
  const liveMarkets = [
    { symbol: "BTC/USDT", price: "42,350.00", change: "+0.83%", isPositive: true },
    { symbol: "ETH/USDT", price: "2,654.30", change: "+1.24%", isPositive: true },
    { symbol: "SOL/USDT", price: "98.45", change: "-0.45%", isPositive: false },
    { symbol: "BNB/USDT", price: "315.67", change: "+2.15%", isPositive: true },
    { symbol: "ADA/USDT", price: "0.4821", change: "+0.67%", isPositive: true },
    { symbol: "XRP/USDT", price: "0.5234", change: "-1.23%", isPositive: false },
  ];

  const features = [
    { icon: Shield, title: "Secure", description: "Military-grade security" },
    { icon: Zap, title: "Fast", description: "Lightning-fast execution" },
    { icon: Smartphone, title: "Mobile-Ready", description: "Trade anywhere, anytime" },
    { icon: DollarSign, title: "Low Fees", description: "Industry-leading rates" },
  ];

  const trendingCoins = [
    { symbol: "SHIB", emoji: "🔥", description: "Hot trend" },
    { symbol: "PEPE", emoji: "🚀", description: "Rising fast" },
    { symbol: "BASE", emoji: "🧠", description: "Smart choice" },
  ];

  const testimonials = [
    { quote: "Smooth UI", author: "Trader123" },
    { quote: "Great support!", author: "CryptoGal" },
    { quote: "Best platform ever", author: "BitcoinPro" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation - Same as Trade Page */}
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
                <Link href="/">
                  <a className="text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium bg-muted">
                    Home
                  </a>
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Markets
                </a>
                <Link href="/exchange">
                  <a className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Trade
                  </a>
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Derivatives
                </a>
              </nav>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="text-foreground border-border hover:border-muted-foreground">
                Log In
              </Button>
              <Button className="bg-crypto-blue hover:bg-blue-600 text-white">
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-card to-background py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Trade Crypto Instantly on EQCrypto
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join millions of traders worldwide on the most trusted cryptocurrency exchange platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/exchange">
              <Button size="lg" className="bg-crypto-blue hover:bg-blue-600 text-white px-8 py-4 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-border text-foreground px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
          
          {/* Background Animation Placeholder */}
          <div className="relative h-64 bg-muted rounded-lg border border-border overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="h-24 w-24 text-crypto-blue opacity-20" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-crypto-blue/10 to-crypto-green/10"></div>
          </div>
        </div>
      </section>

      {/* Live Prices Ticker */}
      <section className="bg-card border-y border-border py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {liveMarkets.map((market, index) => (
              <div key={index} className="flex items-center space-x-3 min-w-fit">
                <span className="font-semibold text-foreground">{market.symbol}</span>
                <span className="font-mono text-foreground">${market.price}</span>
                <span className={`text-sm font-medium ${market.isPositive ? 'crypto-green' : 'crypto-red'}`}>
                  {market.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose EQCrypto */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose EQCrypto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border text-center p-6">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-crypto-blue mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Steps */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Get Started in 3 Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-crypto-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Create Account</h3>
              <p className="text-muted-foreground">Sign up in minutes with secure verification</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-crypto-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Deposit</h3>
              <p className="text-muted-foreground">Fund your account with multiple payment methods</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-crypto-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Trade Instantly</h3>
              <p className="text-muted-foreground">Start trading with our advanced tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Coins */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Trending Coins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingCoins.map((coin, index) => (
              <Card key={index} className="bg-card border-border hover:border-crypto-blue transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{coin.emoji}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{coin.symbol}</h3>
                  <p className="text-muted-foreground">{coin.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            What Our Traders Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background border-border">
                <CardContent className="p-6">
                  <p className="text-foreground text-lg mb-4">"{testimonial.quote}"</p>
                  <p className="text-muted-foreground">– {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Join 100,000+ Traders Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your crypto journey with the most trusted exchange
          </p>
          <Button size="lg" className="bg-crypto-blue hover:bg-blue-600 text-white px-8 py-4 text-lg">
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-foreground mb-4 md:mb-0">
              EQCrypto
            </div>
            <div className="flex space-x-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}