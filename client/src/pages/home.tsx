import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Smartphone, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { AuthButton } from "@/components/AuthButton";
import UserDropdown from "@/components/UserDropdown";
import Header from "@/components/Header";

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
      <Header />

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
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <AuthButton />
          </div>
        </div>
      </section>

      {/* Live Markets Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Live Markets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMarkets.map((market) => (
              <Card key={market.symbol} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{market.symbol}</h3>
                    <Badge variant={market.isPositive ? "default" : "destructive"}>
                      {market.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-foreground">${market.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EQCrypto?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingCoins.map((coin, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{coin.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{coin.symbol}</h3>
                  <p className="text-muted-foreground">{coin.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Traders Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="p-6">
                  <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                  <p className="text-muted-foreground">- {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join EQCrypto today and experience the future of cryptocurrency trading
          </p>
          <Link href="/auth">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">EQCRYPTO</div>
          <p className="text-muted-foreground mb-6">
            The world's most trusted cryptocurrency exchange
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}