import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import { getCDNConfig, AssetType } from "./server/cdn-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Only include development plugins in development
    ...(process.env.NODE_ENV !== "production" ? [
      // Removed Replit plugins to prevent MetaMask connection errors
    ] : []),
    // Bundle analyzer for production builds
    ...(process.env.ANALYZE === 'true' ? [
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    ] : []),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Production optimizations
    minify: 'terser',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          vendor: ['react', 'react-dom'],
          radix: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['lightweight-charts', 'recharts'],
          utils: ['clsx', 'tailwind-merge'],
          // Lazy-loaded page chunks
          home: ['@/pages/home'],
          markets: ['@/pages/markets'],
          exchange: ['@/pages/exchange'],
          derivatives: ['@/pages/derivatives'],
          dashboard: ['@/pages/dashboard'],
          settings: ['@/pages/settings'],
          auth: ['@/pages/auth'],
          // Lazy-loaded component chunks
          trading: ['@/components/TradingChart', '@/components/OrderBook', '@/components/TradeHistory'],
          portfolio: ['@/components/Portfolio', '@/components/OrdersManagement'],
          components: ['@/components/SentimentBar', '@/components/SimpleCaptcha'],
        },
        // CDN asset naming
        assetFileNames: (assetInfo) => {
          const config = getCDNConfig();
          if (!config.enabled) {
            return 'assets/[name]-[hash][extname]';
          }
          
          const assetType = getAssetTypeFromFilename(assetInfo.name || '');
          return `assets/${assetType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable tree shaking
    target: 'esnext',
    // Asset optimization
    assetsInlineLimit: 4096, // 4KB
    cssCodeSplit: true,
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'wouter',
      'lucide-react',
    ],
  },
});

// Helper function to determine asset type from filename
function getAssetTypeFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'css':
      return 'css';
    case 'js':
    case 'mjs':
      return 'js';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'avif':
    case 'svg':
      return 'images';
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'otf':
    case 'eot':
      return 'fonts';
    default:
      return 'other';
  }
}
