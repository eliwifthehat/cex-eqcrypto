#!/usr/bin/env node

/**
 * API Key Management Scripts
 * Manages API key rotation, cleanup, and monitoring
 */

import { apiKeyManager } from '../server/api-key-manager';
import { db } from '../server/db';
import { userApiKeys, userSecurityLogs } from '../shared/schema';
import { eq, lt, and } from 'drizzle-orm';
import { logSecurity, logSystem } from '../server/logger';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function rotateExpiredKeys() {
  console.log('🔄 Rotating expired API keys...\n');

  try {
    const expiredKeys = await apiKeyManager.getExpiredKeys();
    
    if (expiredKeys.length === 0) {
      console.log('✅ No expired keys found');
      return;
    }

    console.log(`Found ${expiredKeys.length} expired keys:`);
    
    for (const key of expiredKeys) {
      try {
        console.log(`   Rotating key: ${key.name} (ID: ${key.id})`);
        const result = await apiKeyManager.rotateApiKey(key.id, key.userId);
        
        console.log(`   ✅ New API key: ${result.newApiKey}`);
        console.log(`   ✅ New secret key: ${result.newSecretKey}`);
        
        // Log security event
        await logSecurity('api_key_auto_rotated', {
          keyId: key.id,
          keyName: key.name,
          userId: key.userId,
          reason: 'expired',
        });
      } catch (error) {
        console.log(`   ❌ Failed to rotate key ${key.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error rotating expired keys:', error);
  }
}

async function rotateOldKeys() {
  console.log('🔄 Rotating old API keys (90+ days)...\n');

  try {
    const oldKeys = await apiKeyManager.getKeysNeedingRotation();
    
    if (oldKeys.length === 0) {
      console.log('✅ No old keys found that need rotation');
      return;
    }

    console.log(`Found ${oldKeys.length} keys that need rotation:`);
    
    for (const key of oldKeys) {
      try {
        const daysSinceLastUse = Math.floor((Date.now() - new Date(key.lastUsed || key.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`   Rotating key: ${key.name} (ID: ${key.id}, Last used: ${daysSinceLastUse} days ago)`);
        const result = await apiKeyManager.rotateApiKey(key.id, key.userId);
        
        console.log(`   ✅ New API key: ${result.newApiKey}`);
        console.log(`   ✅ New secret key: ${result.newSecretKey}`);
        
        // Log security event
        await logSecurity('api_key_auto_rotated', {
          keyId: key.id,
          keyName: key.name,
          userId: key.userId,
          reason: 'old_key',
          daysSinceLastUse,
        });
      } catch (error) {
        console.log(`   ❌ Failed to rotate key ${key.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error rotating old keys:', error);
  }
}

async function cleanupInactiveKeys() {
  console.log('🧹 Cleaning up inactive API keys...\n');

  try {
    // Find keys that haven't been used in 180 days
    const cutoffDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    
    const inactiveKeys = await db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.isActive, true),
          lt(userApiKeys.lastUsed || userApiKeys.createdAt, cutoffDate)
        )
      );

    if (inactiveKeys.length === 0) {
      console.log('✅ No inactive keys found');
      return;
    }

    console.log(`Found ${inactiveKeys.length} inactive keys:`);
    
    for (const key of inactiveKeys) {
      try {
        const daysSinceLastUse = Math.floor((Date.now() - new Date(key.lastUsed || key.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`   Revoking key: ${key.name} (ID: ${key.id}, Last used: ${daysSinceLastUse} days ago)`);
        await apiKeyManager.revokeApiKey(key.id, key.userId);
        
        console.log(`   ✅ Key revoked successfully`);
        
        // Log security event
        await logSecurity('api_key_auto_revoked', {
          keyId: key.id,
          keyName: key.name,
          userId: key.userId,
          reason: 'inactive',
          daysSinceLastUse,
        });
      } catch (error) {
        console.log(`   ❌ Failed to revoke key ${key.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error cleaning up inactive keys:', error);
  }
}

async function showApiKeyStats() {
  console.log('📊 API Key Statistics\n');

  try {
    const stats = await apiKeyManager.getApiKeyStats();
    
    console.log('Key Statistics:');
    console.log(`   Total keys: ${stats.totalKeys}`);
    console.log(`   Active keys: ${stats.activeKeys}`);
    console.log(`   Expired keys: ${stats.expiredKeys}`);
    console.log(`   Keys needing rotation: ${stats.keysNeedingRotation}`);
    
    // Get recent security events
    const recentEvents = await db
      .select()
      .from(userSecurityLogs)
      .where(eq(userSecurityLogs.action, 'api_key_validation_failed'))
      .orderBy(userSecurityLogs.createdAt)
      .limit(10);

    if (recentEvents.length > 0) {
      console.log('\nRecent API Key Security Events:');
      recentEvents.forEach(event => {
        const details = JSON.parse(event.details || '{}');
        console.log(`   ${formatDate(event.createdAt)} - ${event.action}: ${details.error || 'Unknown error'}`);
      });
    }

    // Get most used keys
    const mostUsedKeys = await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.isActive, true))
      .orderBy(userApiKeys.lastUsed)
      .limit(5);

    if (mostUsedKeys.length > 0) {
      console.log('\nMost Recently Used Keys:');
      mostUsedKeys.forEach(key => {
        const lastUsed = key.lastUsed ? formatDate(key.lastUsed) : 'Never';
        console.log(`   ${key.name} (ID: ${key.id}) - Last used: ${lastUsed}`);
      });
    }

  } catch (error) {
    console.error('❌ Error getting API key stats:', error);
  }
}

async function generateTestKey(userId, name = 'Test API Key') {
  console.log(`🔑 Generating test API key for user ${userId}...\n`);

  try {
    const result = await apiKeyManager.generateApiKey(
      userId,
      name,
      ['read', 'trade'],
      undefined,
      30 // 30 days
    );

    console.log('✅ Test API key generated:');
    console.log(`   API Key: ${result.apiKey}`);
    console.log(`   Secret Key: ${result.secretKey}`);
    console.log(`   Key ID: ${result.keyId}`);
    console.log(`   Expires: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}`);
    
    console.log('\n📝 Usage example:');
    console.log(`   curl -H "X-API-Key: ${result.apiKey}" https://your-domain.com/api/v1/account`);

  } catch (error) {
    console.error('❌ Error generating test key:', error);
  }
}

async function main() {
  const command = process.argv[2] || 'stats';

  switch (command) {
    case 'rotate-expired':
      await rotateExpiredKeys();
      break;
    case 'rotate-old':
      await rotateOldKeys();
      break;
    case 'cleanup':
      await cleanupInactiveKeys();
      break;
    case 'stats':
      await showApiKeyStats();
      break;
    case 'generate-test':
      const userId = process.argv[3];
      const name = process.argv[4];
      if (!userId) {
        console.log('❌ Please provide a user ID: npm run api-keys:generate-test <userId> [name]');
        process.exit(1);
      }
      await generateTestKey(userId, name);
      break;
    default:
      console.log('🔑 API Key Management Commands:');
      console.log('   npm run api-keys:stats           - Show API key statistics');
      console.log('   npm run api-keys:rotate-expired  - Rotate expired keys');
      console.log('   npm run api-keys:rotate-old      - Rotate old keys (90+ days)');
      console.log('   npm run api-keys:cleanup         - Clean up inactive keys');
      console.log('   npm run api-keys:generate-test   - Generate test API key');
  }
}

main().catch(console.error); 