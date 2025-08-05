const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://api.coingecko.com",
        "https://api.moralis.io",
        "https://api.pyth.network",
        "https://api.switchboard.xyz",
        "https://quote-api.jup.ag",
        "https://public-api.birdeye.so",
        "https://api.solscan.io",
        "https://api.solanafm.com",
        "https://api.supabase.co",
        "wss://*.supabase.co"
      ],
      frameSrc: ["'self'", "https://www.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));

// CORS configuration for cex.eqcrypto.org
app.use(cors({
  origin: [
    'https://cex.eqcrypto.org',
    'https://www.cex.eqcrypto.org',
    'https://eqcrypto.org',
    'https://www.eqcrypto.org',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CEX API',
    domain: 'cex.eqcrypto.org',
    timestamp: new Date().toISOString()
  });
});

// Basic API endpoints for CEX
app.get('/api/markets', (req, res) => {
  res.json({
    markets: [
      { id: 'BTC-USDT', base: 'BTC', quote: 'USDT', price: 118275.31, change24h: 2.5 },
      { id: 'ETH-USDT', base: 'ETH', quote: 'USDT', price: 3245.67, change24h: -1.2 },
      { id: 'SOL-USDT', base: 'SOL', quote: 'USDT', price: 145.89, change24h: 5.8 }
    ]
  });
});

app.get('/api/ticker/:symbol', (req, res) => {
  const { symbol } = req.params;
  res.json({
    symbol,
    price: Math.random() * 100000,
    volume24h: Math.random() * 1000000,
    change24h: (Math.random() - 0.5) * 10
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'API endpoint not found'
  });
});

// Export for Netlify
module.exports.handler = serverless(app); 