import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Zap,
  ChevronDown,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Platform = "dex" | "cex";

interface PlatformSelectorProps {
  currentPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  className?: string;
}

const platformConfig = {
  dex: {
    name: "DEX",
    fullName: "Decentralized Exchange",
    icon: Zap,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Manage decentralized trading"
  },
  cex: {
    name: "CEX",
    fullName: "Centralized Exchange", 
    icon: Building2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    description: "Manage centralized trading"
  }
};

export function PlatformSelector({ 
  currentPlatform, 
  onPlatformChange, 
  className = "" 
}: PlatformSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = platformConfig[currentPlatform];
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${config.bgColor} ${config.borderColor} ${config.color} px-3 py-1`}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        {config.name}
      </Badge>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>Switch Platform</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(platformConfig).map(([key, platform]) => {
            const PlatformIcon = platform.icon;
            const isActive = key === currentPlatform;
            
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => {
                  onPlatformChange(key as Platform);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 p-3 cursor-pointer ${
                  isActive ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <div className={`flex items-center space-x-2 flex-1`}>
                  <PlatformIcon className={`w-4 h-4 ${platform.color}`} />
                  <div className="flex-1">
                    <div className="font-medium">{platform.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {platform.description}
                    </div>
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

