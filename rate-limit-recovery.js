// Rate limiting recovery mechanism for YouTube API
class RateLimitRecovery {
  constructor() {
    this.lastRateLimitTime = 0;
    this.consecutiveRateLimits = 0;
    this.isInCooldown = false;
  }

  // Record a rate limit event
  recordRateLimit() {
    this.lastRateLimitTime = Date.now();
    this.consecutiveRateLimits += 1;
    console.log(`⚠️ Rate limit recorded. Consecutive: ${this.consecutiveRateLimits}`);
  }

  // Check if we should be in cooldown mode
  shouldEnterCooldown() {
    const timeSinceLastRateLimit = Date.now() - this.lastRateLimitTime;
    const recentRateLimit = timeSinceLastRateLimit < 300000; // 5 minutes
    
    // Enter cooldown if we've had 3+ rate limits recently
    if (this.consecutiveRateLimits >= 3 && recentRateLimit) {
      this.isInCooldown = true;
      return true;
    }
    
    return false;
  }

  // Get recommended delay before next request
  getRecommendedDelay() {
    if (this.isInCooldown) {
      // Progressive backoff: 2, 4, 8, 16 minutes (max)
      const backoffMinutes = Math.min(Math.pow(2, this.consecutiveRateLimits - 2), 16);
      return backoffMinutes * 60 * 1000; // Convert to milliseconds
    }
    
    const timeSinceLastRateLimit = Date.now() - this.lastRateLimitTime;
    if (timeSinceLastRateLimit < 60000) { // Less than 1 minute
      return 60000 - timeSinceLastRateLimit; // Wait until 1 minute has passed
    }
    
    return 0; // No delay needed
  }

  // Reset rate limit counter (call on successful request)
  reset() {
    if (this.consecutiveRateLimits > 0) {
      console.log(`✅ Rate limit recovery: Resetting after ${this.consecutiveRateLimits} consecutive limits`);
    }
    this.consecutiveRateLimits = 0;
    this.isInCooldown = false;
  }

  // Check if we're currently in recovery mode
  isInRecoveryMode() {
    const timeSinceLastRateLimit = Date.now() - this.lastRateLimitTime;
    return timeSinceLastRateLimit < 300000 && this.consecutiveRateLimits > 0; // 5 minutes
  }

  // Get status for logging
  getStatus() {
    return {
      isInCooldown: this.isInCooldown,
      consecutiveRateLimits: this.consecutiveRateLimits,
      timeSinceLastRateLimit: this.lastRateLimitTime ? Date.now() - this.lastRateLimitTime : null,
      recommendedDelay: this.getRecommendedDelay()
    };
  }
}

// Global instance
const rateLimitRecovery = new RateLimitRecovery();

module.exports = rateLimitRecovery;