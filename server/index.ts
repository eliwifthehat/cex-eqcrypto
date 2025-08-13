import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import sslify from "express-sslify";
import logger, { logRequest, logError, logSystem, logSecurity } from "./logger";
import { httpsConfig, getHTTPSRedirectConfig, validateHTTPSRequest, getSecurityHeaders, logHTTPSViolation } from "./https-config";
import { xssProtection, sanitizeInput } from "./validation-middleware";
import { 
  getSessionConfig, 
  sessionSecurityMiddleware, 
  sessionCleanup, 
  sessionMonitoring,
  sessionSecurityHeaders 
} from "./session-config";
import { cacheManager } from "./cache-config";
import session from "express-session";

// Create server function for Netlify
export function createServer() {
  const app = express();

  // HTTPS Redirect Middleware (Production Only)
  if (httpsConfig.enabled) {
    // Force HTTPS redirects
    app.use(sslify.HTTPS(getHTTPSRedirectConfig()));

    // Enhanced HTTPS validation and logging
    app.use((req, res, next) => {
      // Log HTTP to HTTPS redirects
      if (req.headers['x-forwarded-proto'] === 'http') {
        logSecurity('http_to_https_redirect', {
          originalUrl: req.url,
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          referer: req.get('Referer'),
        });
      }

      // Validate HTTPS requests in production
      if (!validateHTTPSRequest(req)) {
        const violation = logHTTPSViolation(req, 'invalid_https_request');
        logSecurity('https_violation', violation);
        
        return res.status(403).json({
          error: 'HTTPS required',
          message: 'This application requires a secure connection.',
        });
      }

      // Add security headers
      Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      next();
    });
  }

  // Input validation and sanitization middleware
  app.use(xssProtection);
  app.use(sanitizeInput);

  // Security middleware - Completely disable CSP in development
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          connectSrc: [
            "'self'", 
            "wss:", 
            "ws:", 
            "https://api.coingecko.com", 
            "https://api.moralis.io",
            "https://*.supabase.co",
            "https://supabase.co",

            "https://heldzockilbftitlcbac.supabase.co",
            "https://fstream.binance.com",
            "https://api.binance.com"
          ],
          frameSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      // Enhanced security headers for HTTPS
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }));
  } else {
    // Development: minimal security headers
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
  }

  // Session middleware (must come before body parsing)
  app.use(session(getSessionConfig()));
  app.use(sessionSecurityMiddleware);
  app.use(sessionCleanup);
  app.use(sessionMonitoring);

  // Add session security headers
  app.use((req, res, next) => {
    Object.entries(sessionSecurityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  });

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Production logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    // Capture response data for logging
    let capturedJsonResponse: Record<string, any> | undefined = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      
      // Log all API requests in production
      if (req.path.startsWith("/api")) {
        logRequest(req, res, duration);
        
        // Log response data for debugging (development only)
        if (process.env.NODE_ENV === 'development' && capturedJsonResponse) {
          logger.debug('API Response', {
            path: req.path,
            response: capturedJsonResponse,
          });
        }
      }
    });

    next();
  });

  // Register API routes
  registerRoutes(app);

  // Global error handler with production logging
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error in production
    logError(err, {
      status,
      message,
      url: _req.url,
      method: _req.method,
      userAgent: _req.get('User-Agent'),
      ip: _req.ip || _req.connection.remoteAddress,
    });

    res.status(status).json({ message });
  });

  return app;
}

// Standalone server startup (for development and direct deployment)
const app = createServer();

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5002 (changed from 5001)
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5002;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    // Initialize cache manager
    await cacheManager.healthCheck();
    
    logSystem(`Server started on port ${port}`, {
      environment: process.env.NODE_ENV || 'development',
      port,
      timestamp: new Date().toISOString(),
    });
    logger.info(`🚀 Server running on port ${port}`);
    console.log(`⚡ Cache: ${cacheManager['redis'] ? 'Redis + Memory' : 'Memory Only'}`);
  });
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  await cacheManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await cacheManager.close();
  process.exit(0);
});
