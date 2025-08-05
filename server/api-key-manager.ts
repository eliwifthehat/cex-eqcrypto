/**
 * API Key Management System
 * Handles API key generation, validation, rotation, and security
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { userApiKeys, userSecurityLogs } from '../shared/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { logSecurity, logError } from './logger';
import { sql } from 'drizzle-orm';

export interface ApiKeyConfig {
  prefix: string;
  length: number;
  expiresIn: number; // days
  maxKeysPerUser: number;
  rotationDays: number;
  permissions: {
    read: string[];
    trade: string[];
    withdraw: string[];
    admin: string[];
  };
}

export interface ApiKeyValidationResult {
  valid: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
  keyId?: number;
}

export interface ApiKeyUsage {
  keyId: number;
  endpoint: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  responseTime: number;
}

const API_KEY_CONFIG: ApiKeyConfig = {
  prefix: 'cex',
  length: 32,
  expiresIn: 365, // 1 year
  maxKeysPerUser: 5,
  rotationDays: 90, // Rotate every 90 days
  permissions: {
    read: ['GET'],
    trade: ['GET', 'POST'],
    withdraw: ['GET', 'POST', 'DELETE'],
    admin: ['GET', 'POST', 'PUT', 'DELETE'],
  },
};

export class ApiKeyManager {
  private static instance: ApiKeyManager;

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * Generate a new API key
   */
  async generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = ['read'],
    ipWhitelist?: string[],
    expiresInDays?: number
  ): Promise<{ apiKey: string; secretKey: string; keyId: number }> {
    try {
      // Check if user has reached the maximum number of keys
      const existingKeys = await db
        .select()
        .from(userApiKeys)
        .where(eq(userApiKeys.userId, userId));

      if (existingKeys.length >= API_KEY_CONFIG.maxKeysPerUser) {
        throw new Error(`Maximum number of API keys (${API_KEY_CONFIG.maxKeysPerUser}) reached`);
      }

      // Generate API key
      const apiKey = this.generateSecureKey();
      const secretKey = this.generateSecureKey(64);
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + API_KEY_CONFIG.expiresIn * 24 * 60 * 60 * 1000);

      // Store in database
      const [newKey] = await db
        .insert(userApiKeys)
        .values({
          userId,
          name,
          apiKey,
          secretKey: this.hashSecretKey(secretKey),
          permissions,
          ipWhitelist,
          isActive: true,
          expiresAt,
        })
        .returning();

      // Log security event
      await this.logSecurityEvent(userId, 'api_key_created', {
        keyId: newKey.id,
        keyName: name,
        permissions,
        expiresAt,
      });

      return {
        apiKey: `${API_KEY_CONFIG.prefix}_${apiKey}`,
        secretKey,
        keyId: newKey.id,
      };
    } catch (error) {
      logError(error as Error, { userId, operation: 'generateApiKey' });
      throw error;
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(
    apiKey: string,
    requiredPermissions: string[] = ['read'],
    ipAddress?: string
  ): Promise<ApiKeyValidationResult> {
    try {
      // Remove prefix if present
      const cleanKey = apiKey.replace(`${API_KEY_CONFIG.prefix}_`, '');

      // Find API key in database
      const [keyData] = await db
        .select()
        .from(userApiKeys)
        .where(eq(userApiKeys.apiKey, cleanKey));

      if (!keyData) {
        return { valid: false, error: 'Invalid API key' };
      }

      // Check if key is active
      if (!keyData.isActive) {
        await this.logSecurityEvent(keyData.userId, 'api_key_inactive_attempt', {
          keyId: keyData.id,
          ipAddress,
        });
        return { valid: false, error: 'API key is inactive' };
      }

      // Check if key has expired
      if (keyData.expiresAt && new Date() > keyData.expiresAt) {
        await this.logSecurityEvent(keyData.userId, 'api_key_expired_attempt', {
          keyId: keyData.id,
          ipAddress,
        });
        return { valid: false, error: 'API key has expired' };
      }

      // Check IP whitelist
      if (keyData.ipWhitelist && keyData.ipWhitelist.length > 0 && ipAddress) {
        if (!keyData.ipWhitelist.includes(ipAddress)) {
          await this.logSecurityEvent(keyData.userId, 'api_key_ip_violation', {
            keyId: keyData.id,
            ipAddress,
            allowedIps: keyData.ipWhitelist,
          });
          return { valid: false, error: 'IP address not whitelisted' };
        }
      }

      // Check permissions
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        keyData.permissions?.includes(permission)
      );

      if (!hasRequiredPermissions) {
        await this.logSecurityEvent(keyData.userId, 'api_key_permission_violation', {
          keyId: keyData.id,
          requiredPermissions,
          actualPermissions: keyData.permissions,
          ipAddress,
        });
        return { valid: false, error: 'Insufficient permissions' };
      }

      // Update last used timestamp
      await db
        .update(userApiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(userApiKeys.id, keyData.id));

      return {
        valid: true,
        userId: keyData.userId,
        permissions: keyData.permissions || [],
        keyId: keyData.id,
      };
    } catch (error) {
      logError(error as Error, { operation: 'validateApiKey', apiKey: apiKey.substring(0, 10) + '...' });
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Rotate API key
   */
  async rotateApiKey(keyId: number, userId: string): Promise<{ newApiKey: string; newSecretKey: string }> {
    try {
      // Get current key
      const [currentKey] = await db
        .select()
        .from(userApiKeys)
        .where(and(eq(userApiKeys.id, keyId), eq(userApiKeys.userId, userId)));

      if (!currentKey) {
        throw new Error('API key not found');
      }

      // Generate new keys
      const newApiKey = this.generateSecureKey();
      const newSecretKey = this.generateSecureKey(64);

      // Update database
      await db
        .update(userApiKeys)
        .set({
          apiKey: newApiKey,
          secretKey: this.hashSecretKey(newSecretKey),
          lastUsed: new Date(),
        })
        .where(eq(userApiKeys.id, keyId));

      // Log security event
      await this.logSecurityEvent(userId, 'api_key_rotated', {
        keyId,
        keyName: currentKey.name,
      });

      return {
        newApiKey: `${API_KEY_CONFIG.prefix}_${newApiKey}`,
        newSecretKey,
      };
    } catch (error) {
      logError(error as Error, { userId, keyId, operation: 'rotateApiKey' });
      throw error;
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: number, userId: string): Promise<void> {
    try {
      const [keyData] = await db
        .select()
        .from(userApiKeys)
        .where(and(eq(userApiKeys.id, keyId), eq(userApiKeys.userId, userId)));

      if (!keyData) {
        throw new Error('API key not found');
      }

      await db
        .update(userApiKeys)
        .set({ isActive: false })
        .where(eq(userApiKeys.id, keyId));

      // Log security event
      await this.logSecurityEvent(userId, 'api_key_revoked', {
        keyId,
        keyName: keyData.name,
      });
    } catch (error) {
      logError(error as Error, { userId, keyId, operation: 'revokeApiKey' });
      throw error;
    }
  }

  /**
   * Get keys that need rotation
   */
  async getKeysNeedingRotation(): Promise<any[]> {
    const rotationDate = new Date(Date.now() - API_KEY_CONFIG.rotationDays * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.isActive, true),
          lt(userApiKeys.lastUsed || userApiKeys.createdAt, rotationDate)
        )
      );
  }

  /**
   * Get expired keys
   */
  async getExpiredKeys(): Promise<any[]> {
    return await db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.isActive, true),
          lt(userApiKeys.expiresAt, new Date())
        )
      );
  }

  /**
   * Log API key usage
   */
  async logApiKeyUsage(usage: ApiKeyUsage): Promise<void> {
    try {
      // Update last used timestamp
      await db
        .update(userApiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(userApiKeys.id, usage.keyId));

      // Log security event for failed attempts
      if (!usage.success) {
        const [keyData] = await db
          .select()
          .from(userApiKeys)
          .where(eq(userApiKeys.id, usage.keyId));

        if (keyData) {
          await this.logSecurityEvent(keyData.userId, 'api_key_failed_usage', {
            keyId: usage.keyId,
            endpoint: usage.endpoint,
            ipAddress: usage.ipAddress,
            userAgent: usage.userAgent,
            responseTime: usage.responseTime,
          });
        }
      }
    } catch (error) {
      logError(error as Error, { operation: 'logApiKeyUsage', keyId: usage.keyId });
    }
  }

  /**
   * Generate secure random key
   */
  private generateSecureKey(length: number = API_KEY_CONFIG.length): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash secret key for storage
   */
  private hashSecretKey(secretKey: string): string {
    return crypto.createHash('sha256').update(secretKey).digest('hex');
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      await db.insert(userSecurityLogs).values({
        userId,
        action,
        details: JSON.stringify(details),
        success: true,
        createdAt: new Date(),
      });
    } catch (error) {
      logError(error as Error, { userId, action, operation: 'logSecurityEvent' });
    }
  }

  /**
   * Get API key statistics
   */
  async getApiKeyStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    keysNeedingRotation: number;
  }> {
    const [totalKeys] = await db
      .select({ count: sql`count(*)` })
      .from(userApiKeys);

    const [activeKeys] = await db
      .select({ count: sql`count(*)` })
      .from(userApiKeys)
      .where(eq(userApiKeys.isActive, true));

    const expiredKeys = await this.getExpiredKeys();
    const keysNeedingRotation = await this.getKeysNeedingRotation();

    return {
      totalKeys: Number(totalKeys.count),
      activeKeys: Number(activeKeys.count),
      expiredKeys: expiredKeys.length,
      keysNeedingRotation: keysNeedingRotation.length,
    };
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance(); 