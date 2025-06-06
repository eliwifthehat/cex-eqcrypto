interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      return false;
    }

    // Reset if window has passed
    if (now > entry.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }

    return entry.count >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      entry.count++;
    }
  }

  getRemainingTime(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) return 0;
    
    const remaining = Math.max(0, entry.resetTime - Date.now());
    return Math.ceil(remaining / 1000 / 60); // Return minutes
  }

  getAttemptCount(identifier: string): number {
    const entry = this.attempts.get(identifier);
    return entry?.count || 0;
  }
}

export const rateLimiter = new RateLimiter();