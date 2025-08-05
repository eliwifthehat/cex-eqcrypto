import { lazy } from "react";

// Lazy load heavy components that aren't immediately needed
export const TradingChart = lazy(() => import("./TradingChart"));
export const OrderBook = lazy(() => import("./OrderBook"));
export const TradeHistory = lazy(() => import("./TradeHistory"));
export const Portfolio = lazy(() => import("./Portfolio"));
export const OrdersManagement = lazy(() => import("./OrdersManagement"));

// Lazy load UI components that are used conditionally
export const SentimentBar = lazy(() => import("./SentimentBar"));
export const SimpleCaptcha = lazy(() => import("./SimpleCaptcha").then(module => ({ default: module.default || module })));

// Loading component for component-level Suspense
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Error boundary component for lazy-loaded components
export const LazyErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <div className="lazy-error-boundary">
    {children}
  </div>
); 