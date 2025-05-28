import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TradingForms() {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [orderType, setOrderType] = useState("Market");
  const { toast } = useToast();

  const handleBuyOrder = () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Buy Order Placed",
      description: `Market buy order for ${buyAmount} BTC has been placed`,
    });
    setBuyAmount("");
  };

  const handleSellOrder = () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a valid amount to sell",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Sell Order Placed",
      description: `Market sell order for ${sellAmount} BTC has been placed`,
    });
    setSellAmount("");
  };

  const percentageButtons = ["25%", "50%", "75%", "100%"];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-start">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={orderType === "Market" ? "default" : "ghost"}
              size="sm"
              onClick={() => setOrderType("Market")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                orderType === "Market"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              Market
            </Button>
            <Button
              variant={orderType === "Limit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setOrderType("Limit")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                orderType === "Limit"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              Limit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buy Section */}
          <div className="space-y-4">
            <h4 className="font-semibold crypto-green">Buy BTC</h4>
            
            <div>
              <Label htmlFor="buy-amount" className="text-sm text-muted-foreground">
                Amount
              </Label>
              <div className="relative mt-1">
                <Input
                  id="buy-amount"
                  type="number"
                  placeholder="0"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="bg-background border-border text-foreground placeholder-muted-foreground focus:border-crypto-green pr-12"
                />
                <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                  USDT
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleBuyOrder}
              className="w-full bg-crypto-blue hover:bg-blue-600 text-white font-semibold py-3"
            >
              Buy BTC
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Available: <span className="text-foreground">0.00 USDT</span>
            </div>
          </div>
          
          {/* Sell Section */}
          <div className="space-y-4">
            <h4 className="font-semibold crypto-red">Sell BTC</h4>
            
            <div>
              <Label htmlFor="sell-amount" className="text-sm text-muted-foreground">
                Amount
              </Label>
              <div className="relative mt-1">
                <Input
                  id="sell-amount"
                  type="number"
                  placeholder="0"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="bg-background border-border text-foreground placeholder-muted-foreground focus:border-crypto-red pr-12"
                />
                <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                  BTC
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleSellOrder}
              className="w-full bg-crypto-red hover:bg-red-600 text-white font-semibold py-3"
            >
              Sell BTC
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Available: <span className="text-foreground">0.00 BTC</span>
            </div>
          </div>
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {percentageButtons.map((percentage) => (
            <Button
              key={percentage}
              variant="outline"
              size="sm"
              className="py-2 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-foreground border-border"
            >
              {percentage}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
