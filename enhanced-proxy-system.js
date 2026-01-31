const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');
const crypto = require('crypto');

class EnhancedProxySystem {
  constructor() {
    // Configuration for different proxy types
    this.proxyConfigs = {
      residential: [
        // Replace these with your actual residential proxy endpoints
        {
          url: 'http://208.127.55.175:8080',
          location: 'US',
          type: 'http',
          priority: 1,
          active: true,
          lastUsed: 0,
          successRate: 100,
          failures: 0
        },
        {
          url: 'http://208.127.55.175:3128',
          location: 'EU',
          type: 'http',
          priority: 2,
          active: true,
          lastUsed: 0,
          successRate: 100,
          failures: 0
        },
        {
          url: 'socks5://208.127.55.175:1080',
          location: 'CA',
          type: 'socks5',
          priority: 3,
          active: true,
          lastUsed: 0,
          successRate: 100,
          failures: 0
        }
      ],
      datacenter: [
        // Backup datacenter proxies (less reliable but faster)
        {
          url: 'http://208.127.55.175:80',
          location: 'US',
          type: 'http',
          priority: 10,
          active: true,
          lastUsed: 0,
          successRate: 80,
          failures: 0
        }
      ]
    };

    // User agent rotation with realistic browser fingerprints
    this.userAgentProfiles = [
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1'
        },
        platform: 'Windows'
      },
      {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1'
        },
        platform: 'macOS'
      },
      {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Upgrade-Insecure-Requests': '1'
        },
        platform: 'iOS'
      }
    ];

    this.currentProxyIndex = 0;
    this.currentUserAgentIndex = 0;
    this.sessionStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitHits: 0,
      proxyRotations: 0
    };

    // Rate limiting configuration
    this.rateLimitConfig = {
      minDelay: 5000,    // 5 seconds minimum between requests
      maxDelay: 30000,   // 30 seconds maximum delay
      exponentialBase: 1.5,
      maxRetries: 3,
      cooldownPeriod: 300000 // 5 minutes cooldown after rate limit
    };

    this.lastRequestTime = 0;
    this.consecutiveFailures = 0;
    this.cooldownUntil = 0;
  }

  // Get the best available proxy
  getBestProxy() {
    const allProxies = [
      ...this.proxyConfigs.residential,
      ...this.proxyConfigs.datacenter
    ];

    // Filter active proxies and sort by success rate and priority
    const availableProxies = allProxies
      .filter(proxy => proxy.active && proxy.failures < 5)
      .sort((a, b) => {
        // Primary sort by success rate, secondary by priority
        if (b.successRate !== a.successRate) {
          return b.successRate - a.successRate;
        }
        return a.priority - b.priority;
      });

    if (availableProxies.length === 0) {
      throw new Error('No available proxies');
    }

    // Round-robin selection among top performing proxies
    const topPerformers = availableProxies.filter(
      proxy => proxy.successRate >= Math.max(80, availableProxies[0].successRate - 10)
    );

    const selectedProxy = topPerformers[this.currentProxyIndex % topPerformers.length];
    this.currentProxyIndex++;
    
    return selectedProxy;
  }

  // Create proxy agent based on proxy type
  createProxyAgent(proxyConfig) {
    if (proxyConfig.type === 'socks5') {
      return new SocksProxyAgent(proxyConfig.url);
    } else {
      return new HttpsProxyAgent(proxyConfig.url);
    }
  }

  // Get current user agent profile
  getCurrentUserAgentProfile() {
    const profile = this.userAgentProfiles[this.currentUserAgentIndex % this.userAgentProfiles.length];
    this.currentUserAgentIndex++;
    return profile;
  }

  // Calculate delay based on consecutive failures
  calculateDelay() {
    if (this.consecutiveFailures === 0) {
      return this.rateLimitConfig.minDelay;
    }

    const delay = Math.min(
      this.rateLimitConfig.minDelay * Math.pow(this.rateLimitConfig.exponentialBase, this.consecutiveFailures),
      this.rateLimitConfig.maxDelay
    );

    return delay + Math.random() * 5000; // Add jitter
  }

  // Test proxy connectivity
  async testProxy(proxyConfig, timeout = 10000) {
    try {
      const agent = this.createProxyAgent(proxyConfig);
      const userAgentProfile = this.getCurrentUserAgentProfile();

      const startTime = Date.now();
      
      const response = await axios.get('https://httpbin.org/ip', {
        httpsAgent: agent,
        timeout,
        headers: {
          'User-Agent': userAgentProfile.userAgent,
          ...userAgentProfile.headers
        }
      });

      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime,
        ip: response.data.origin,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: null,
        ip: null
      };
    }
  }

  // Validate all proxies
  async validateAllProxies() {
    console.log('🔍 Validating all proxy configurations...');
    
    const allProxies = [
      ...this.proxyConfigs.residential,
      ...this.proxyConfigs.datacenter
    ];

    const validationPromises = allProxies.map(async (proxy, index) => {
      console.log(`  Testing proxy ${index + 1}/${allProxies.length}: ${proxy.location}`);
      
      const result = await this.testProxy(proxy);
      
      if (result.success) {
        proxy.active = true;
        proxy.successRate = Math.min(100, proxy.successRate + 5);
        proxy.failures = Math.max(0, proxy.failures - 1);
        console.log(`    ✅ Success - IP: ${result.ip}, Response: ${result.responseTime}ms`);
      } else {
        proxy.failures++;
        proxy.successRate = Math.max(0, proxy.successRate - 10);
        
        if (proxy.failures >= 5) {
          proxy.active = false;
          console.log(`    ❌ Failed - Deactivated (${proxy.failures} failures)`);
        } else {
          console.log(`    ❌ Failed - ${result.error}`);
        }
      }
      
      return { proxy, result };
    });

    const results = await Promise.all(validationPromises);
    
    const activeProxies = results.filter(r => r.proxy.active).length;
    const totalProxies = results.length;
    
    console.log(`\n📊 Proxy validation complete: ${activeProxies}/${totalProxies} active`);
    
    return results;
  }

  // Enhanced request with proxy rotation and retry logic
  async makeEnhancedRequest(url, options = {}) {
    // Check cooldown period
    if (Date.now() < this.cooldownUntil) {
      const remainingCooldown = Math.round((this.cooldownUntil - Date.now()) / 1000);
      throw new Error(`Rate limit cooldown active. ${remainingCooldown} seconds remaining.`);
    }

    // Enforce minimum delay between requests
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const requiredDelay = this.calculateDelay();
    
    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
      console.log(`⏳ Waiting ${Math.round(waitTime/1000)}s before next request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.sessionStats.totalRequests++;

    let lastError;
    
    for (let attempt = 0; attempt < this.rateLimitConfig.maxRetries; attempt++) {
      try {
        const proxy = this.getBestProxy();
        const agent = this.createProxyAgent(proxy);
        const userAgentProfile = this.getCurrentUserAgentProfile();

        console.log(`🔄 Attempt ${attempt + 1}: Using ${proxy.location} proxy with ${userAgentProfile.platform} UA`);

        const config = {
          httpsAgent: agent,
          timeout: options.timeout || 30000,
          headers: {
            'User-Agent': userAgentProfile.userAgent,
            ...userAgentProfile.headers,
            ...options.headers
          },
          ...options
        };

        const response = await axios.get(url, config);
        
        // Success - update stats
        this.sessionStats.successfulRequests++;
        this.consecutiveFailures = 0;
        proxy.successRate = Math.min(100, proxy.successRate + 2);
        proxy.lastUsed = Date.now();
        
        console.log(`✅ Request successful via ${proxy.location} proxy`);
        
        return response;

      } catch (error) {
        lastError = error;
        this.sessionStats.failedRequests++;
        this.consecutiveFailures++;

        // Check for rate limiting
        if (error.response?.status === 429 || 
            error.message.includes('Too Many Requests') ||
            error.message.includes('rate limit')) {
          
          this.sessionStats.rateLimitHits++;
          this.cooldownUntil = Date.now() + this.rateLimitConfig.cooldownPeriod;
          
          console.log(`🚨 Rate limit detected. Cooldown for ${this.rateLimitConfig.cooldownPeriod/60000} minutes.`);
          throw new Error('Rate limit detected. Cooldown period activated.');
        }

        // Proxy-specific error handling
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          const currentProxy = this.getBestProxy();
          currentProxy.failures++;
          currentProxy.successRate = Math.max(0, currentProxy.successRate - 10);
          console.log(`❌ Proxy error: ${error.message}`);
        }

        console.log(`❌ Attempt ${attempt + 1} failed: ${error.message}`);
        
        // Wait before retry with exponential backoff
        if (attempt < this.rateLimitConfig.maxRetries - 1) {
          const retryDelay = Math.min(5000 * Math.pow(2, attempt), 30000);
          console.log(`⏳ Retrying in ${retryDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  // Integration method for ytdl-core
  getYtdlOptions() {
    try {
      const proxy = this.getBestProxy();
      const agent = this.createProxyAgent(proxy);
      const userAgentProfile = this.getCurrentUserAgentProfile();

      return {
        requestOptions: {
          agent,
          headers: {
            'User-Agent': userAgentProfile.userAgent,
            ...userAgentProfile.headers
          }
        }
      };
    } catch (error) {
      console.log('⚠️ No proxy available, using direct connection');
      const userAgentProfile = this.getCurrentUserAgentProfile();
      
      return {
        requestOptions: {
          headers: {
            'User-Agent': userAgentProfile.userAgent,
            ...userAgentProfile.headers
          }
        }
      };
    }
  }

  // Integration method for yt-dlp
  getYtDlpArgs() {
    try {
      const proxy = this.getBestProxy();
      const userAgentProfile = this.getCurrentUserAgentProfile();

      const args = [
        '--user-agent', userAgentProfile.userAgent,
        '--proxy', proxy.url,
        '--sleep-requests', '3',
        '--no-warnings'
      ];

      // Add additional headers if needed
      Object.entries(userAgentProfile.headers).forEach(([key, value]) => {
        args.push('--add-header', `${key}:${value}`);
      });

      return args;
    } catch (error) {
      console.log('⚠️ No proxy available for yt-dlp, using direct connection');
      const userAgentProfile = this.getCurrentUserAgentProfile();
      
      return [
        '--user-agent', userAgentProfile.userAgent,
        '--sleep-requests', '3',
        '--no-warnings'
      ];
    }
  }

  // Get session statistics
  getStats() {
    const activeProxies = [
      ...this.proxyConfigs.residential,
      ...this.proxyConfigs.datacenter
    ].filter(proxy => proxy.active).length;

    return {
      ...this.sessionStats,
      activeProxies,
      successRate: this.sessionStats.totalRequests > 0 
        ? (this.sessionStats.successfulRequests / this.sessionStats.totalRequests * 100).toFixed(2)
        : 0,
      consecutiveFailures: this.consecutiveFailures,
      inCooldown: Date.now() < this.cooldownUntil,
      cooldownRemaining: Math.max(0, Math.round((this.cooldownUntil - Date.now()) / 1000))
    };
  }

  // Reset statistics
  resetStats() {
    this.sessionStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitHits: 0,
      proxyRotations: 0
    };
    this.consecutiveFailures = 0;
    this.cooldownUntil = 0;
  }
}

module.exports = EnhancedProxySystem;