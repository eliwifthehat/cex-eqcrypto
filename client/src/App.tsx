import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const Markets = lazy(() => import("@/pages/markets"));
const Exchange = lazy(() => import("@/pages/exchange"));
const Derivatives = lazy(() => import("@/pages/derivatives"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const Auth = lazy(() => import("@/pages/auth"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminMarkets = lazy(() => import("@/pages/admin/markets"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminSystem = lazy(() => import("@/pages/admin/system"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/markets" component={Markets} />
        <Route path="/exchange">
          <ProtectedRoute>
            <Exchange />
          </ProtectedRoute>
        </Route>
        <Route path="/derivatives">
          <ProtectedRoute>
            <Derivatives />
          </ProtectedRoute>
        </Route>
        <Route path="/account-dash">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/auth" component={Auth} />
        
        {/* Admin Routes */}
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/orders">
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/markets">
          <ProtectedRoute>
            <AdminMarkets />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/analytics">
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/system">
          <ProtectedRoute>
            <AdminSystem />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
