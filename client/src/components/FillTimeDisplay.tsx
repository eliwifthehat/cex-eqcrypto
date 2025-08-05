import { Clock, AlertCircle, CheckCircle, Info } from "lucide-react";
import { FillTimeEstimate } from "@/lib/fillTimeEstimator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FillTimeDisplayProps {
  estimate: FillTimeEstimate;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function FillTimeDisplay({ 
  estimate, 
  size = 'md', 
  showIcon = true,
  className = "" 
}: FillTimeDisplayProps) {
  
  const getConfidenceColor = (confidence: FillTimeEstimate['confidence']) => {
    switch (confidence) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceIcon = (confidence: FillTimeEstimate['confidence']) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-3 h-3" />;
      case 'medium': return <Info className="w-3 h-3" />;
      case 'low': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getIconSize = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      default: return 'w-4 h-4';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 cursor-help ${className}`}>
            {showIcon && (
              <div className={`${getConfidenceColor(estimate.confidence)}`}>
                {getConfidenceIcon(estimate.confidence)}
              </div>
            )}
            <span className={`${getSizeClasses(size)} text-gray-300`}>
              {estimate.estimatedTime}
            </span>
            {estimate.slippageEstimate && (
              <span className={`${getSizeClasses(size)} text-gray-500`}>
                ({estimate.slippageEstimate.toFixed(1)}% slippage)
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium text-white">
              Fill Time Estimate
            </div>
            <div className="text-sm text-gray-300">
              {estimate.reason}
            </div>
            {estimate.slippageEstimate && (
              <div className="text-sm text-gray-400">
                Expected slippage: {estimate.slippageEstimate.toFixed(2)}%
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Confidence: {estimate.confidence}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for small spaces
export function CompactFillTimeDisplay({ estimate }: { estimate: FillTimeEstimate }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-300">
              {estimate.estimatedTime}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-sm">
            <div className="font-medium">{estimate.estimatedTime}</div>
            <div className="text-gray-300">{estimate.reason}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge version for status displays
export function FillTimeBadge({ estimate }: { estimate: FillTimeEstimate }) {
  const getBadgeColor = (confidence: FillTimeEstimate['confidence']) => {
    switch (confidence) {
      case 'high': return 'bg-green-900/30 text-green-400 border-green-700/50';
      case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50';
      case 'low': return 'bg-red-900/30 text-red-400 border-red-700/50';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700/50';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${getBadgeColor(estimate.confidence)}`}>
            <Clock className="w-3 h-3" />
            {estimate.estimatedTime}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">{estimate.reason}</div>
            {estimate.slippageEstimate && (
              <div className="text-gray-300">
                Slippage: {estimate.slippageEstimate.toFixed(2)}%
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 