/**
 * HTTPS Security Configuration
 * Production-only HTTPS and security settings
 */

export interface HTTPSConfig {
  enabled: boolean;
  redirectHttp: boolean;
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  trustedProxies: string[];
  allowedHosts: string[];
  securityHeaders: {
    [key: string]: string | boolean;
  };
}

export const httpsConfig: HTTPSConfig = {
  enabled: process.env.NODE_ENV === 'production',
  redirectHttp: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  trustedProxies: [
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    // Cloud providers
    '169.254.0.0/16', // AWS metadata
    '100.64.0.0/10',  // Cloud NAT
  ],
  allowedHosts: [
    'cex.eqadvertise.com',
    'www.cex.eqadvertise.com',
    'eqadvertise.com',
    'www.eqadvertise.com',
    // Add your production domains here
  ],
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  },
};

export const getHTTPSRedirectConfig = () => ({
  trustProtoHeader: true,
  trustAzureHeader: true,
  trustXForwardedHostHeader: true,
  // Custom redirect logic for specific paths
  redirectUrl: (req: any) => {
    const host = req.get('host');
    const url = req.url;
    
    // Ensure we're using HTTPS
    if (process.env.NODE_ENV === 'production') {
      return `https://${host}${url}`;
    }
    return null;
  },
});

export const validateHTTPSRequest = (req: any): boolean => {
  // Check if request is coming through HTTPS
  const isSecure = 
    req.secure || 
    req.headers['x-forwarded-proto'] === 'https' ||
    req.headers['x-forwarded-ssl'] === 'on';

  // Check if host is allowed
  const host = req.get('host');
  const isAllowedHost = httpsConfig.allowedHosts.some(allowedHost => 
    host === allowedHost || host.endsWith(`.${allowedHost}`)
  );

  return isSecure && isAllowedHost;
};

export const getSecurityHeaders = () => {
  const headers = { ...httpsConfig.securityHeaders };
  
  if (process.env.NODE_ENV === 'production') {
    // Add HSTS header in production
    headers['Strict-Transport-Security'] = 
      `max-age=${httpsConfig.hsts.maxAge}; includeSubDomains${httpsConfig.hsts.preload ? '; preload' : ''}`;
  }

  return headers;
};

export const logHTTPSViolation = (req: any, reason: string) => {
  return {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    host: req.get('host'),
    url: req.url,
    method: req.method,
    reason,
    headers: {
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'x-forwarded-ssl': req.headers['x-forwarded-ssl'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
    },
  };
}; 