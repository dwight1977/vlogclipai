// Ultra-Complex YouTube Bypass System with Advanced Anti-Detection
// This implements multiple layers of evasion techniques

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EnhancedProxySystem = require('./enhanced-proxy-system');

class UltraComplexYouTubeBypass {
  constructor() {
    this.ytDlpPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp';
    this.proxySystem = new EnhancedProxySystem();
    
    // Advanced user agent rotation with realistic patterns
    this.userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    ];
    
    // Innertube client configurations for maximum compatibility
    this.innertubeClients = [
      { name: 'web', args: ['--extractor-args', 'youtube:player_client=web'] },
      { name: 'android', args: ['--extractor-args', 'youtube:player_client=android'] },
      { name: 'ios', args: ['--extractor-args', 'youtube:player_client=ios'] },
      { name: 'mweb', args: ['--extractor-args', 'youtube:player_client=mweb'] },
      { name: 'tv_embed', args: ['--extractor-args', 'youtube:player_client=tv_embed'] },
      { name: 'web_creator', args: ['--extractor-args', 'youtube:player_client=web_creator'] },
      { name: 'web_embedded', args: ['--extractor-args', 'youtube:player_client=web_embedded'] }
    ];
    
    // Geographic proxy servers for IP rotation
    this.proxyServers = [
      'us-proxy-1.example.com:8080',
      'eu-proxy-1.example.com:8080', 
      'asia-proxy-1.example.com:8080',
      'ca-proxy-1.example.com:8080'
    ];
    
    // Browser headers for maximum authenticity
    this.browserHeaders = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    };
    
    this.sessionState = {
      requestCount: 0,
      lastRequestTime: 0,
      currentUserAgent: 0,
      currentClient: 0,
      currentProxy: 0,
      sessionId: this.generateSessionId(),
      visitorData: null,
      cookies: null
    };
    
    // Rate limiting configuration
    this.rateLimiting = {
      minDelay: 15000,  // 15 seconds minimum
      maxDelay: 45000,  // 45 seconds maximum
      exponentialBackoff: true,
      consecutiveFailures: 0,
      maxConsecutiveFailures: 3
    };
  }
  
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }
  
  // Generate realistic visitor data for Innertube API
  generateVisitorData() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Rotate session parameters to avoid detection
  rotateSession() {
    this.sessionState.currentUserAgent = (this.sessionState.currentUserAgent + 1) % this.userAgents.length;
    this.sessionState.currentClient = (this.sessionState.currentClient + 1) % this.innertubeClients.length;
    this.sessionState.currentProxy = (this.sessionState.currentProxy + 1) % this.proxyServers.length;
    this.sessionState.visitorData = this.generateVisitorData();
    this.sessionState.sessionId = this.generateSessionId();
    
    console.log(`🔄 Session rotated - UA: ${this.sessionState.currentUserAgent}, Client: ${this.sessionState.currentClient}, Proxy: ${this.sessionState.currentProxy}`);
  }
  
  // Calculate dynamic delay based on failures and rate limiting
  calculateDelay() {
    let delay = this.rateLimiting.minDelay;
    
    if (this.rateLimiting.exponentialBackoff && this.rateLimiting.consecutiveFailures > 0) {
      delay = Math.min(
        this.rateLimiting.minDelay * Math.pow(2, this.rateLimiting.consecutiveFailures),
        this.rateLimiting.maxDelay
      );
    }
    
    // Add random jitter to avoid detection patterns
    const jitter = Math.random() * 5000; // 0-5 seconds
    return delay + jitter;
  }
  
  // Build ultra-complex yt-dlp command with all evasion techniques
  buildUltraComplexCommand(url, outputPath, options = {}) {
    const userAgent = this.userAgents[this.sessionState.currentUserAgent];
    const client = this.innertubeClients[this.sessionState.currentClient];
    
    let args = [
      // Basic download configuration
      ...(options.format ? ['-f', options.format] : ['--dump-json']),
      ...(outputPath ? ['-o', outputPath] : []),
      
      // Anti-detection headers
      '--user-agent', userAgent,
      '--add-header', 'Accept:' + this.browserHeaders.Accept,
      '--add-header', 'Accept-Language:' + this.browserHeaders['Accept-Language'],
      '--add-header', 'Accept-Encoding:' + this.browserHeaders['Accept-Encoding'],
      '--add-header', 'DNT:' + this.browserHeaders.DNT,
      '--add-header', 'Sec-Fetch-Dest:' + this.browserHeaders['Sec-Fetch-Dest'],
      '--add-header', 'Sec-Fetch-Mode:' + this.browserHeaders['Sec-Fetch-Mode'],
      '--add-header', 'Sec-Fetch-Site:' + this.browserHeaders['Sec-Fetch-Site'],
      
      // Innertube client configuration
      ...client.args,
      
      // Advanced evasion
      '--extractor-args', `youtube:innertube_host=www.youtube.com`,
      '--extractor-args', `youtube:visitor_data=${this.sessionState.visitorData}`,
      '--extractor-args', `youtube:po_token=`, // Disable po_token to avoid issues
      
      // Rate limiting and delays
      '--sleep-requests', Math.floor(Math.random() * 5) + 3, // 3-7 second delays
      '--sleep-interval', Math.floor(Math.random() * 10) + 10, // 10-19 second intervals
      '--max-sleep-interval', Math.floor(Math.random() * 20) + 30, // 30-49 second max
      
      // Network configuration
      '--retries', '10',
      '--fragment-retries', '10',
      '--retry-sleep', 'linear=5:10:20',
      '--socket-timeout', '30',
      '--source-address', '0.0.0.0', // Let system choose
      
      // Bypass geo-restrictions
      '--geo-bypass',
      
      // Additional anti-detection
      '--no-warnings',
      '--ignore-errors',
      '--abort-on-unavailable-fragment',
      '--hls-prefer-native',
      '--prefer-free-formats'
    ];

    // Integrate enhanced proxy system
    try {
      const enhancedProxyArgs = this.proxySystem.getYtDlpArgs();
      args.push(...enhancedProxyArgs);
      console.log(`🔧 Ultra-Complex: Enhanced proxy system integrated with ${enhancedProxyArgs.length} proxy args`);
    } catch (error) {
      console.log(`⚠️ Ultra-Complex: No enhanced proxy available, using original system`);
      // Fallback to original proxy system
      args.push('--geo-verification-proxy', this.proxyServers[this.sessionState.currentProxy]);
    }

    // URL last
    args.push(url);
    
    const command = `"${this.ytDlpPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
    return command;
  }
  
  // Execute command with ultra-complex retry logic
  async executeWithUltraRetry(command, maxAttempts = 7) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🚀 Ultra-Complex Attempt ${attempt}/${maxAttempts} with ${this.innertubeClients[this.sessionState.currentClient].name} client`);
      
      try {
        const result = await this.executeCommand(command);
        this.rateLimiting.consecutiveFailures = 0; // Reset on success
        return result;
        
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
        this.rateLimiting.consecutiveFailures++;
        
        // Check for specific YouTube blocking patterns
        if (this.isBlockingError(error)) {
          console.log(`🚨 Detected YouTube blocking - applying ultra-complex countermeasures`);
          
          // Rotate all parameters
          this.rotateSession();
          
          // Extended delay for blocking
          const blockingDelay = this.calculateDelay() * 2;
          console.log(`⏳ Extended blocking delay: ${blockingDelay/1000} seconds`);
          await this.delay(blockingDelay);
          
          // Rebuild command with new parameters
          const urlMatch = command.match(/"([^"]*youtube\.com[^"]*)"$/);
          if (urlMatch) {
            const url = urlMatch[1];
            const outputMatch = command.match(/"-o"\s+"([^"]+)"/);
            const outputPath = outputMatch ? outputMatch[1] : null;
            const isJson = command.includes('--dump-json');
            
            command = this.buildUltraComplexCommand(url, outputPath, { 
              format: isJson ? null : 'best[ext=mp4]' 
            });
          }
          
        } else {
          // Standard retry delay
          const delay = this.calculateDelay();
          console.log(`⏳ Standard retry delay: ${delay/1000} seconds`);
          await this.delay(delay);
        }
        
        // Give up if too many consecutive failures
        if (this.rateLimiting.consecutiveFailures >= this.rateLimiting.maxConsecutiveFailures) {
          console.log(`💀 Too many consecutive failures, rotating everything and extending delay`);
          this.rotateSession();
          await this.delay(60000); // 1 minute cooldown
          this.rateLimiting.consecutiveFailures = 0;
        }
      }
    }
    
    throw new Error('All ultra-complex retry attempts failed');
  }
  
  // Detect YouTube blocking patterns
  isBlockingError(error) {
    const blockingPatterns = [
      'HTTP Error 429',
      'Too Many Requests', 
      'Video unavailable',
      'This video is unavailable',
      'Sign in to confirm your age',
      'unable to extract yt initial data',
      'Video is not available',
      'Private video',
      'Premieres in',
      'This video is only available to Music Premium members'
    ];
    
    return blockingPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { 
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\n${stderr}`));
          return;
        }
        resolve(stdout);
      });
    });
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Main method to download video with ultra-complex evasion
  async downloadVideoUltraComplex(url, outputPath) {
    console.log(`🎯 Ultra-Complex YouTube Download Starting for: ${url}`);
    console.log(`📊 Session: ${this.sessionState.sessionId.substring(0, 8)}...`);
    
    const command = this.buildUltraComplexCommand(url, outputPath, { format: 'best[ext=mp4]' });
    
    try {
      await this.executeWithUltraRetry(command);
      console.log(`✅ Ultra-Complex Download Success: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.log(`💀 Ultra-Complex Download Failed: ${error.message}`);
      throw error;
    }
  }
  
  // Get video info with ultra-complex evasion
  async getVideoInfoUltraComplex(url) {
    console.log(`🔍 Ultra-Complex Video Info for: ${url}`);
    
    const command = this.buildUltraComplexCommand(url, null, {});
    
    try {
      const stdout = await this.executeWithUltraRetry(command);
      const info = JSON.parse(stdout);
      console.log(`✅ Ultra-Complex Info Success: ${info.title || 'Unknown'}`);
      return {
        id: info.id,
        title: info.title,
        author: info.uploader || info.channel || 'Unknown',
        duration: info.duration,
        available: true
      };
    } catch (error) {
      console.log(`💀 Ultra-Complex Info Failed: ${error.message}`);
      throw error;
    }
  }

  // Get enhanced proxy system statistics
  getProxyStats() {
    return this.proxySystem.getStats();
  }

  // Reset enhanced proxy system statistics
  resetProxyStats() {
    this.proxySystem.resetStats();
  }

  // Validate enhanced proxy system
  async validateProxies() {
    return await this.proxySystem.validateAllProxies();
  }
}

module.exports = UltraComplexYouTubeBypass;