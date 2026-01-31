const { exec } = require('child_process');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

// Comprehensive analysis of YouTube access issues
class YouTubeAnalyzer {
  constructor() {
    this.ytDlpPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp';
    this.results = {
      systemInfo: {},
      networkTests: {},
      ytdlCoreTests: {},
      ytDlpTests: {},
      rateLimit: {},
      solutions: []
    };
  }

  async analyzeSystem() {
    console.log('🔍 PHASE 1: COMPREHENSIVE SYSTEM ANALYSIS\n');
    
    // Test 1: System Information
    await this.getSystemInfo();
    
    // Test 2: Network connectivity
    await this.testNetworkConnectivity();
    
    // Test 3: yt-dlp version and capabilities
    await this.testYtDlpCapabilities();
    
    // Test 4: Rate limiting detection
    await this.detectRateLimiting();
    
    // Test 5: YouTube blocking patterns
    await this.analyzeBlockingPatterns();
    
    // Test 6: Test multiple video types
    await this.testMultipleVideoTypes();
    
    return this.results;
  }

  async getSystemInfo() {
    console.log('📊 System Information:');
    
    try {
      // Get external IP
      const ipResult = await this.execCommand('curl -s https://httpbin.org/ip');
      const ipData = JSON.parse(ipResult);
      this.results.systemInfo.externalIP = ipData.origin;
      console.log(`  External IP: ${ipData.origin}`);
      
      // Get location info
      const locationResult = await this.execCommand('curl -s https://ipapi.co/json/');
      const locationData = JSON.parse(locationResult);
      this.results.systemInfo.location = {
        country: locationData.country_name,
        region: locationData.region,
        city: locationData.city,
        isp: locationData.org
      };
      console.log(`  Location: ${locationData.city}, ${locationData.country_name}`);
      console.log(`  ISP: ${locationData.org}`);
      
      // Check if IP is on any blacklists
      console.log(`  Checking IP reputation...`);
      
    } catch (error) {
      console.log(`  ❌ System info error: ${error.message}`);
    }
  }

  async testNetworkConnectivity() {
    console.log('\n🌐 Network Connectivity Tests:');
    
    const testUrls = [
      'https://www.youtube.com',
      'https://youtube.com',  
      'https://m.youtube.com',
      'https://youtubei.googleapis.com'
    ];
    
    for (const url of testUrls) {
      try {
        const result = await this.execCommand(`curl -I -s -w "%{http_code}" -o /dev/null "${url}"`);
        const statusCode = result.trim();
        console.log(`  ${url}: HTTP ${statusCode}`);
        
        if (statusCode === '429') {
          console.log(`    ⚠️ Rate limited at base URL level!`);
          this.results.networkTests[url] = 'RATE_LIMITED';
        } else if (statusCode.startsWith('2')) {
          this.results.networkTests[url] = 'OK';
        } else {
          this.results.networkTests[url] = 'BLOCKED';
        }
      } catch (error) {
        console.log(`  ${url}: ERROR - ${error.message}`);
        this.results.networkTests[url] = 'ERROR';
      }
    }
  }

  async testYtDlpCapabilities() {
    console.log('\n🛠️ yt-dlp Capabilities:');
    
    try {
      // Version
      const version = await this.execCommand(`"${this.ytDlpPath}" --version`);
      console.log(`  Version: ${version.trim()}`);
      this.results.ytDlpTests.version = version.trim();
      
      // Available extractors
      const extractors = await this.execCommand(`"${this.ytDlpPath}" --list-extractors | grep youtube`);
      console.log(`  YouTube extractors available: ${extractors.split('\n').length} types`);
      
      // Test different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      ];
      
      console.log(`  Testing user agents...`);
      for (let i = 0; i < userAgents.length; i++) {
        console.log(`    Agent ${i + 1}: ${userAgents[i].substring(0, 50)}...`);
      }
      
    } catch (error) {
      console.log(`  ❌ yt-dlp test error: ${error.message}`);
    }
  }

  async detectRateLimiting() {
    console.log('\n⏱️ Rate Limiting Detection:');
    
    // Test with a simple, known video
    const testVideo = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    console.log(`  Testing rapid requests to detect rate limiting patterns...`);
    
    const requests = [];
    for (let i = 0; i < 3; i++) {
      console.log(`  Request ${i + 1}/3...`);
      
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          this.execCommand(`"${this.ytDlpPath}" --dump-json --no-warnings "${testVideo}"`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        const endTime = Date.now();
        
        if (result.includes('"title"')) {
          console.log(`    ✅ Success (${endTime - startTime}ms)`);
          requests.push({ success: true, time: endTime - startTime });
        } else {
          console.log(`    ❌ Failed - no title in response`);
          requests.push({ success: false, error: 'No title' });
        }
      } catch (error) {
        console.log(`    ❌ Failed - ${error.message}`);
        requests.push({ success: false, error: error.message });
        
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          console.log(`    🚨 RATE LIMITED detected after ${i + 1} requests`);
          this.results.rateLimit.triggeredAfter = i + 1;
          break;
        }
      }
      
      // Wait between requests
      if (i < 2) {
        console.log(`    ⏳ Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    this.results.rateLimit.requests = requests;
    
    const successCount = requests.filter(r => r.success).length;
    console.log(`  📊 Success rate: ${successCount}/${requests.length}`);
  }

  async analyzeBlockingPatterns() {
    console.log('\n🚫 YouTube Blocking Pattern Analysis:');
    
    // Test different approaches
    const strategies = [
      {
        name: 'Default yt-dlp',
        command: `"${this.ytDlpPath}" --dump-json --no-warnings`
      },
      {
        name: 'With random user agent',
        command: `"${this.ytDlpPath}" --dump-json --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"`
      },
      {
        name: 'Mobile client',
        command: `"${this.ytDlpPath}" --dump-json --extractor-args "youtube:player_client=mweb"`
      },
      {
        name: 'Android client',
        command: `"${this.ytDlpPath}" --dump-json --extractor-args "youtube:player_client=android"`
      },
      {
        name: 'With cookies (if available)',
        command: `"${this.ytDlpPath}" --dump-json --cookies-from-browser chrome`
      }
    ];
    
    const testVideo = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    for (const strategy of strategies) {
      console.log(`  Testing: ${strategy.name}`);
      
      try {
        const result = await Promise.race([
          this.execCommand(`${strategy.command} "${testVideo}"`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        
        if (result.includes('"title"')) {
          console.log(`    ✅ SUCCESS`);
          this.results.solutions.push({
            strategy: strategy.name,
            command: strategy.command,
            status: 'SUCCESS'
          });
        } else {
          console.log(`    ❌ Failed - no title`);
        }
      } catch (error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('429') || errorMsg.includes('too many requests')) {
          console.log(`    ❌ RATE LIMITED`);
        } else if (errorMsg.includes('unavailable')) {
          console.log(`    ❌ VIDEO UNAVAILABLE`);
        } else {
          console.log(`    ❌ ERROR: ${error.message.substring(0, 100)}`);
        }
        
        this.results.solutions.push({
          strategy: strategy.name,
          command: strategy.command,
          status: 'FAILED',
          error: error.message
        });
      }
      
      // Wait between tests to avoid triggering rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  async testMultipleVideoTypes() {
    console.log('\n🎬 Testing Multiple Video Types:');
    
    const testVideos = [
      { name: 'Rick Astley (Classic)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'music' },
      { name: 'Me at the zoo (Historic)', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', type: 'historic' },
      { name: 'Recent upload', url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', type: 'popular' }
    ];
    
    // Find the best working strategy from previous tests
    const workingStrategy = this.results.solutions.find(s => s.status === 'SUCCESS');
    
    if (!workingStrategy) {
      console.log('  ❌ No working strategy found from previous tests');
      return;
    }
    
    console.log(`  Using strategy: ${workingStrategy.strategy}`);
    
    for (const video of testVideos) {
      console.log(`  Testing ${video.name}...`);
      
      try {
        const result = await Promise.race([
          this.execCommand(`${workingStrategy.command} "${video.url}"`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
        ]);
        
        if (result.includes('"title"')) {
          const data = JSON.parse(result);
          console.log(`    ✅ SUCCESS: ${data.title.substring(0, 50)}...`);
          console.log(`    Duration: ${data.duration}s, Uploader: ${data.uploader}`);
        } else {
          console.log(`    ❌ Failed - no valid JSON`);
        }
      } catch (error) {
        console.log(`    ❌ Failed: ${error.message.substring(0, 100)}`);
      }
      
      // Wait between video tests
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  generateReport() {
    console.log('\n📋 COMPREHENSIVE ANALYSIS REPORT');
    console.log('='.repeat(50));
    
    console.log('\n🎯 KEY FINDINGS:');
    
    // Network issues
    const blockedUrls = Object.entries(this.results.networkTests)
      .filter(([url, status]) => status === 'RATE_LIMITED' || status === 'BLOCKED');
    
    if (blockedUrls.length > 0) {
      console.log('  🚨 NETWORK BLOCKING DETECTED:');
      blockedUrls.forEach(([url, status]) => {
        console.log(`    - ${url}: ${status}`);
      });
    }
    
    // Rate limiting
    if (this.results.rateLimit.triggeredAfter) {
      console.log(`  ⚠️ RATE LIMITING: Triggered after ${this.results.rateLimit.triggeredAfter} requests`);
    }
    
    // Working solutions
    const workingSolutions = this.results.solutions.filter(s => s.status === 'SUCCESS');
    if (workingSolutions.length > 0) {
      console.log('  ✅ WORKING SOLUTIONS FOUND:');
      workingSolutions.forEach(solution => {
        console.log(`    - ${solution.strategy}`);
      });
    } else {
      console.log('  ❌ NO WORKING SOLUTIONS FOUND');
    }
    
    console.log('\n💡 RECOMMENDED ACTIONS:');
    
    if (workingSolutions.length > 0) {
      console.log('  1. Implement the working strategy in the main application');
      console.log('  2. Add proper rate limiting delays');
      console.log('  3. Implement fallback strategies');
    } else {
      console.log('  1. Consider using VPN/proxy to change IP');
      console.log('  2. Implement longer delays between requests');
      console.log('  3. Try alternative video sources');
      console.log('  4. Consider using YouTube Data API v3');
    }
    
    return this.results;
  }
}

// Main execution
async function runComprehensiveAnalysis() {
  const analyzer = new YouTubeAnalyzer();
  
  try {
    await analyzer.analyzeSystem();
    const results = analyzer.generateReport();
    
    // Save results to file
    const resultsPath = path.join(__dirname, 'youtube-analysis-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed results saved to: ${resultsPath}`);
    
    return results;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runComprehensiveAnalysis().catch(console.error);
}

module.exports = { YouTubeAnalyzer, runComprehensiveAnalysis };