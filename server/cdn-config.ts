/**
 * CDN and Static Asset Configuration
 * Provides CDN integration, asset optimization, and caching strategies
 */

import { logPerformance, logError } from "./logger";

// CDN configuration interface
export interface CDNConfig {
  // CDN settings
  enabled: boolean;
  provider: 'cloudflare' | 'cloudfront' | 'vercel' | 'custom';
  baseUrl: string;
  fallbackUrl: string;
  
  // Asset optimization
  enableCompression: boolean;
  enableMinification: boolean;
  enableCacheBusting: boolean;
  
  // Cache settings
  cacheControl: {
    html: string;
    css: string;
    js: string;
    images: string;
    fonts: string;
    other: string;
  };
  
  // Security
  enableIntegrity: boolean;
  enableCSP: boolean;
  
  // Performance
  preloadCritical: boolean;
  lazyLoadImages: boolean;
  optimizeImages: boolean;
}

// Production CDN configuration
export const productionCDNConfig: CDNConfig = {
  enabled: true,
  provider: 'cloudflare',
  baseUrl: process.env.CDN_BASE_URL || 'https://cdn.eqadvertise.com',
  fallbackUrl: process.env.CDN_FALLBACK_URL || 'https://cex.eqadvertise.com',
  
  enableCompression: true,
  enableMinification: true,
  enableCacheBusting: true,
  
  cacheControl: {
    html: 'public, max-age=300, s-maxage=600', // 5min browser, 10min CDN
    css: 'public, max-age=31536000, immutable', // 1 year
    js: 'public, max-age=31536000, immutable', // 1 year
    images: 'public, max-age=31536000, immutable', // 1 year
    fonts: 'public, max-age=31536000, immutable', // 1 year
    other: 'public, max-age=86400', // 1 day
  },
  
  enableIntegrity: true,
  enableCSP: true,
  
  preloadCritical: true,
  lazyLoadImages: true,
  optimizeImages: true,
};

// Development CDN configuration
export const developmentCDNConfig: CDNConfig = {
  enabled: false,
  provider: 'custom',
  baseUrl: 'http://localhost:5002',
  fallbackUrl: 'http://localhost:5002',
  
  enableCompression: false,
  enableMinification: false,
  enableCacheBusting: false,
  
  cacheControl: {
    html: 'no-cache, no-store, must-revalidate',
    css: 'no-cache, no-store, must-revalidate',
    js: 'no-cache, no-store, must-revalidate',
    images: 'no-cache, no-store, must-revalidate',
    fonts: 'no-cache, no-store, must-revalidate',
    other: 'no-cache, no-store, must-revalidate',
  },
  
  enableIntegrity: false,
  enableCSP: false,
  
  preloadCritical: false,
  lazyLoadImages: false,
  optimizeImages: false,
};

// Get CDN configuration based on environment
export const getCDNConfig = (): CDNConfig => {
  return process.env.NODE_ENV === 'production' ? productionCDNConfig : developmentCDNConfig;
};

// Asset types and their configurations
export enum AssetType {
  HTML = 'html',
  CSS = 'css',
  JS = 'js',
  IMAGE = 'image',
  FONT = 'font',
  OTHER = 'other',
}

// Asset optimization interface
export interface AssetOptimization {
  type: AssetType;
  path: string;
  url: string;
  integrity?: string;
  preload?: boolean;
  lazy?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

// CDN manager class
export class CDNManager {
  private config: CDNConfig;
  private assetMap: Map<string, AssetOptimization> = new Map();

  constructor() {
    this.config = getCDNConfig();
  }

  // Generate CDN URL for asset
  generateCDNUrl(assetPath: string, type: AssetType = AssetType.OTHER): string {
    if (!this.config.enabled) {
      return assetPath;
    }

    // Add cache busting if enabled
    if (this.config.enableCacheBusting) {
      const timestamp = Date.now();
      const separator = assetPath.includes('?') ? '&' : '?';
      assetPath = `${assetPath}${separator}v=${timestamp}`;
    }

    // Generate CDN URL
    const cdnUrl = `${this.config.baseUrl}${assetPath}`;
    
    // Store asset information
    this.assetMap.set(assetPath, {
      type,
      path: assetPath,
      url: cdnUrl,
    });

    return cdnUrl;
  }

  // Generate integrity hash for asset
  async generateIntegrity(content: string): Promise<string> {
    if (!this.config.enableIntegrity) {
      return '';
    }

    try {
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha384').update(content).digest('base64');
      return `sha384-${hash}`;
    } catch (error) {
      logError(error as Error, { operation: 'generate_integrity' });
      return '';
    }
  }

  // Get cache control header for asset type
  getCacheControl(type: AssetType): string {
    return this.config.cacheControl[type] || this.config.cacheControl.other;
  }

  // Check if asset should be preloaded
  shouldPreload(assetPath: string): boolean {
    if (!this.config.preloadCritical) {
      return false;
    }

    // Preload critical assets
    const criticalAssets = [
      '/assets/index.css',
      '/assets/index.js',
      '/assets/vendor.js',
    ];

    return criticalAssets.some(critical => assetPath.includes(critical));
  }

  // Check if image should be lazy loaded
  shouldLazyLoad(assetPath: string): boolean {
    if (!this.config.lazyLoadImages) {
      return false;
    }

    // Lazy load non-critical images
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
    return imageExtensions.some(ext => assetPath.toLowerCase().includes(ext));
  }

  // Optimize image URL
  optimizeImageUrl(imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}): string {
    if (!this.config.optimizeImages) {
      return imageUrl;
    }

    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);

    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }

  // Get asset optimization info
  getAssetOptimization(assetPath: string): AssetOptimization | undefined {
    return this.assetMap.get(assetPath);
  }

  // Get all assets
  getAllAssets(): AssetOptimization[] {
    return Array.from(this.assetMap.values());
  }

  // Clear asset map
  clearAssetMap(): void {
    this.assetMap.clear();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      logError(error as Error, { operation: 'cdn_health_check' });
      return false;
    }
  }
}

// CDN utilities
export const cdnUtils = {
  // Generate preload links
  generatePreloadLinks(assets: AssetOptimization[]): string[] {
    return assets
      .filter(asset => asset.preload)
      .map(asset => {
        const as = this.getAssetType(asset.type);
        const crossorigin = asset.integrity ? ' crossorigin' : '';
        const integrity = asset.integrity ? ` integrity="${asset.integrity}"` : '';
        return `<link rel="preload" href="${asset.url}" as="${as}"${crossorigin}${integrity}>`;
      });
  },

  // Generate lazy load attributes
  generateLazyLoadAttributes(asset: AssetOptimization): string {
    if (!asset.lazy) {
      return '';
    }

    return 'loading="lazy" decoding="async"';
  },

  // Get asset type for preload
  getAssetType(type: AssetType): string {
    const typeMap = {
      [AssetType.CSS]: 'style',
      [AssetType.JS]: 'script',
      [AssetType.IMAGE]: 'image',
      [AssetType.FONT]: 'font',
      [AssetType.HTML]: 'document',
      [AssetType.OTHER]: 'fetch',
    };

    return typeMap[type] || 'fetch';
  },

  // Generate CSP nonce
  generateCSPNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  },

  // Validate CDN URL
  validateCDNUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  // Extract asset path from CDN URL
  extractAssetPath(cdnUrl: string): string {
    try {
      const url = new URL(cdnUrl);
      return url.pathname;
    } catch {
      return cdnUrl;
    }
  },
};

// Static asset middleware
export const staticAssetMiddleware = (cdnManager: CDNManager) => {
  return (req: any, res: any, next: any) => {
    const assetPath = req.path;
    
    // Set cache control headers
    const assetType = getAssetTypeFromPath(assetPath);
    const cacheControl = cdnManager.getCacheControl(assetType);
    res.setHeader('Cache-Control', cacheControl);

    // Set security headers
    if (cdnManager['config'].enableCSP) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
    }

    // Log asset requests
    logPerformance('asset_requested', {
      path: assetPath,
      type: assetType,
      userAgent: req.get('User-Agent'),
    });

    next();
  };
};

// Helper function to determine asset type from path
function getAssetTypeFromPath(path: string): AssetType {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'html':
      return AssetType.HTML;
    case 'css':
      return AssetType.CSS;
    case 'js':
    case 'mjs':
      return AssetType.JS;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'avif':
    case 'svg':
      return AssetType.IMAGE;
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'otf':
    case 'eot':
      return AssetType.FONT;
    default:
      return AssetType.OTHER;
  }
}

// Global CDN manager instance
export const cdnManager = new CDNManager();

export default {
  CDNManager,
  cdnManager,
  cdnUtils,
  staticAssetMiddleware,
  getCDNConfig,
  productionCDNConfig,
  developmentCDNConfig,
  AssetType,
}; 