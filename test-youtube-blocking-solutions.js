const { expect } = require('chai');
const { HttpsProxyAgent } = require('https-proxy-agent');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// Import your existing bypass systems
const YouTubeHelper = require('./youtube-helper-new');
const UltraComplexYouTubeBypass = require('./ultra-complex-bypass');

const execPromise = promisify(exec);

class YouTubeBlockingTest {
  constructor() {
    this.testResults = {
      proxyTests: [],
      userAgentTests: [],
      rateLimitTests: [],
      fallbackTests: []
    };
    
    // Test video URLs - using popular, stable videos
    this.testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - stable test video
      'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo - first YouTube video
      'https://www.youtube.com/watch?v=9bZkp7q19f0'  // Gangnam Style - high view count
    ];

    // Residential proxy configurations for testing
    this.residentialProxies = [
      // Replace with your actual residential proxy endpoints
      'http://residential-proxy-1:8080',
      'http://residential-proxy-2:8080',
      'socks5://residential-proxy-3:1080'
    ];

    // User agent rotation pool
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    ];

    this.youtube = new YouTubeHelper();
    this.ultraBypass = new UltraComplexYouTubeBypass();
  }

  // Test 1: Residential Proxy Implementation
  async testResidentialProxies() {
    console.log('\n🔄 Testing Residential Proxy Implementation...');
    
    for (const proxyUrl of this.residentialProxies) {
      console.log(`\n  Testing proxy: ${proxyUrl}`);
      
      try {
        // Test with ytdl-core and proxy
        const agent = new HttpsProxyAgent(proxyUrl);
        const testUrl = this.testUrls[0];
        
        const startTime = Date.now();
        
        // Test basic info retrieval with proxy
        const info = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
          
          ytdl.getInfo(testUrl, { 
            requestOptions: { 
              agent,
              headers: {
                'User-Agent': this.getRandomUserAgent()
              }
            }
          })
          .then(info => {
            clearTimeout(timeout);
            resolve(info);
          })
          .catch(err => {
            clearTimeout(timeout);
            reject(err);
          });
        });

        const duration = Date.now() - startTime;
        
        this.testResults.proxyTests.push({
          proxy: proxyUrl,
          status: 'success',
          duration,
          videoTitle: info.videoDetails.title,
          error: null
        });
        
        console.log(`    ✅ Success - ${info.videoDetails.title} (${duration}ms)`);
        
      } catch (error) {
        this.testResults.proxyTests.push({
          proxy: proxyUrl,
          status: 'failed',
          duration: null,
          videoTitle: null,
          error: error.message
        });
        
        console.log(`    ❌ Failed - ${error.message}`);
      }
      
      // Delay between proxy tests
      await this.delay(5000);
    }
  }

  // Test 2: User-Agent Rotation System
  async testUserAgentRotation() {
    console.log('\n🔄 Testing User-Agent Rotation System...');
    
    for (let i = 0; i < this.userAgents.length; i++) {
      const userAgent = this.userAgents[i];
      console.log(`\n  Testing UA ${i + 1}/${this.userAgents.length}: ${userAgent.substring(0, 50)}...`);
      
      try {
        const testUrl = this.testUrls[i % this.testUrls.length];
        const startTime = Date.now();
        
        // Test with yt-dlp and user agent rotation
        const command = `/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp --dump-json --user-agent "${userAgent}" --no-warnings "${testUrl}"`;
        
        const { stdout } = await execPromise(command, { timeout: 30000 });
        const info = JSON.parse(stdout);
        const duration = Date.now() - startTime;
        
        this.testResults.userAgentTests.push({
          userAgent: userAgent.substring(0, 50) + '...',
          status: 'success',
          duration,
          videoTitle: info.title,
          error: null
        });
        
        console.log(`    ✅ Success - ${info.title} (${duration}ms)`);
        
      } catch (error) {
        this.testResults.userAgentTests.push({
          userAgent: userAgent.substring(0, 50) + '...',
          status: 'failed',
          duration: null,
          videoTitle: null,
          error: error.message
        });
        
        console.log(`    ❌ Failed - ${error.message}`);
      }
      
      // Progressive delay between tests to avoid rate limiting
      await this.delay(3000 + (i * 2000));
    }
  }

  // Test 3: Rate Limiting and Retry Mechanisms
  async testRateLimitingMechanisms() {
    console.log('\n🔄 Testing Rate Limiting and Retry Mechanisms...');
    
    // Test rapid requests to trigger rate limiting
    const rapidRequests = [];
    const testUrl = this.testUrls[0];
    
    console.log('  Sending rapid requests to trigger rate limiting...');
    
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(this.makeTestRequest(testUrl, i));
    }
    
    const results = await Promise.allSettled(rapidRequests);
    
    let successCount = 0;
    let rateLimitCount = 0;
    let errorCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        console.log(`    Request ${index + 1}: ✅ Success`);
      } else {
        const error = result.reason.message;
        if (error.includes('429') || error.includes('Too Many Requests') || error.includes('rate limit')) {
          rateLimitCount++;
          console.log(`    Request ${index + 1}: 🚨 Rate Limited`);
        } else {
          errorCount++;
          console.log(`    Request ${index + 1}: ❌ Error - ${error}`);
        }
      }
    });
    
    this.testResults.rateLimitTests.push({
      totalRequests: 10,
      successCount,
      rateLimitCount,
      errorCount,
      rateLimitTriggered: rateLimitCount > 0
    });
    
    console.log(`\n  📊 Results: ${successCount} success, ${rateLimitCount} rate limited, ${errorCount} errors`);
    
    if (rateLimitCount > 0) {
      console.log('  🔄 Testing recovery mechanism...');
      await this.testRateLimitRecovery();
    }
  }

  // Test 4: Recovery from rate limiting
  async testRateLimitRecovery() {
    console.log('\n  Testing rate limit recovery with exponential backoff...');
    
    const delays = [5000, 10000, 20000, 40000]; // Exponential backoff
    
    for (let i = 0; i < delays.length; i++) {
      const delay = delays[i];
      console.log(`    Waiting ${delay/1000} seconds before retry ${i + 1}...`);
      await this.delay(delay);
      
      try {
        const result = await this.youtube.getVideoInfo(this.testUrls[0]);
        console.log(`    ✅ Recovery successful after ${delay/1000}s delay`);
        break;
      } catch (error) {
        console.log(`    ❌ Retry ${i + 1} failed: ${error.message}`);
      }
    }
  }

  // Test 5: Fallback mechanisms between ytdl-core and yt-dlp
  async testFallbackMechanisms() {
    console.log('\n🔄 Testing Fallback Mechanisms...');
    
    for (const testUrl of this.testUrls) {
      console.log(`\n  Testing fallback for: ${testUrl}`);
      
      // Test primary method (yt-dlp)
      try {
        console.log('    Trying primary method (yt-dlp)...');
        const result = await this.youtube.getVideoInfo(testUrl);
        
        this.testResults.fallbackTests.push({
          url: testUrl,
          primaryMethod: 'success',
          fallbackMethod: 'not_needed',
          finalResult: 'success',
          title: result.title
        });
        
        console.log(`    ✅ Primary method succeeded: ${result.title}`);
        
      } catch (primaryError) {
        console.log(`    ❌ Primary method failed: ${primaryError.message}`);
        
        // Test fallback method (ultra-complex bypass)
        try {
          console.log('    Trying fallback method (ultra-complex bypass)...');
          const result = await this.ultraBypass.getVideoInfo(testUrl);
          
          this.testResults.fallbackTests.push({
            url: testUrl,
            primaryMethod: 'failed',
            fallbackMethod: 'success',
            finalResult: 'success',
            title: result.title
          });
          
          console.log(`    ✅ Fallback method succeeded: ${result.title}`);
          
        } catch (fallbackError) {
          this.testResults.fallbackTests.push({
            url: testUrl,
            primaryMethod: 'failed',
            fallbackMethod: 'failed',
            finalResult: 'failed',
            title: null
          });
          
          console.log(`    ❌ Fallback method also failed: ${fallbackError.message}`);
        }
      }
      
      await this.delay(5000);
    }
  }

  // Test 6: Batch Processing Stress Test
  async testBatchProcessingStress() {
    console.log('\n🔄 Testing Batch Processing Stress Test...');
    
    const batchUrls = this.testUrls.slice(0, 3); // Test with 3 videos
    console.log(`  Processing ${batchUrls.length} videos simultaneously...`);
    
    const startTime = Date.now();
    const batchPromises = batchUrls.map((url, index) => 
      this.processBatchVideo(url, index)
    );
    
    const results = await Promise.allSettled(batchPromises);
    const duration = Date.now() - startTime;
    
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        console.log(`    Video ${index + 1}: ✅ Success - ${result.value.title}`);
      } else {
        failureCount++;
        console.log(`    Video ${index + 1}: ❌ Failed - ${result.reason.message}`);
      }
    });
    
    console.log(`\n  📊 Batch Results: ${successCount}/${batchUrls.length} successful in ${duration/1000}s`);
    
    return {
      totalVideos: batchUrls.length,
      successCount,
      failureCount,
      duration,
      successRate: (successCount / batchUrls.length) * 100
    };
  }

  // Helper method for batch video processing
  async processBatchVideo(url, index) {
    // Add staggered delay to avoid simultaneous requests
    await this.delay(index * 2000);
    
    try {
      const result = await this.youtube.getVideoInfo(url);
      return { title: result.title, url };
    } catch (error) {
      // Try fallback
      const result = await this.ultraBypass.getVideoInfo(url);
      return { title: result.title, url };
    }
  }

  // Helper method to make test request
  async makeTestRequest(url, index) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 15000);
      
      ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        }
      })
      .then(info => {
        clearTimeout(timeout);
        resolve(info);
      })
      .catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  // Helper method to get random user agent
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Helper method for delays
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate comprehensive test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        proxyTests: {
          total: this.testResults.proxyTests.length,
          successful: this.testResults.proxyTests.filter(t => t.status === 'success').length,
          failed: this.testResults.proxyTests.filter(t => t.status === 'failed').length
        },
        userAgentTests: {
          total: this.testResults.userAgentTests.length,
          successful: this.testResults.userAgentTests.filter(t => t.status === 'success').length,
          failed: this.testResults.userAgentTests.filter(t => t.status === 'failed').length
        },
        rateLimitTests: this.testResults.rateLimitTests[0] || {},
        fallbackTests: {
          total: this.testResults.fallbackTests.length,
          primarySuccessful: this.testResults.fallbackTests.filter(t => t.primaryMethod === 'success').length,
          fallbackSuccessful: this.testResults.fallbackTests.filter(t => t.fallbackMethod === 'success').length,
          totalFailed: this.testResults.fallbackTests.filter(t => t.finalResult === 'failed').length
        }
      },
      detailedResults: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = path.join(__dirname, `blocking-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    return report;
  }

  // Generate recommendations based on test results
  generateRecommendations() {
    const recommendations = [];
    
    // Proxy analysis
    const successfulProxies = this.testResults.proxyTests.filter(t => t.status === 'success');
    if (successfulProxies.length > 0) {
      recommendations.push({
        type: 'proxy',
        message: `${successfulProxies.length} residential proxies working. Implement proxy rotation.`,
        priority: 'high'
      });
    } else {
      recommendations.push({
        type: 'proxy',
        message: 'No residential proxies working. Consider upgrading proxy service.',
        priority: 'critical'
      });
    }
    
    // User agent analysis
    const successfulUAs = this.testResults.userAgentTests.filter(t => t.status === 'success');
    if (successfulUAs.length > 0) {
      recommendations.push({
        type: 'user_agent',
        message: `${successfulUAs.length} user agents working. Continue rotation strategy.`,
        priority: 'medium'
      });
    }
    
    // Rate limiting analysis
    if (this.testResults.rateLimitTests.length > 0) {
      const rateLimitData = this.testResults.rateLimitTests[0];
      if (rateLimitData.rateLimitTriggered) {
        recommendations.push({
          type: 'rate_limit',
          message: 'Rate limiting detected. Implement longer delays between requests.',
          priority: 'high'
        });
      }
    }
    
    return recommendations;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive YouTube Blocking Solutions Test Suite');
    console.log('='.repeat(70));
    
    try {
      // Run tests sequentially to avoid overwhelming the system
      await this.testResidentialProxies();
      await this.delay(10000); // Cooldown between test suites
      
      await this.testUserAgentRotation();
      await this.delay(10000);
      
      await this.testRateLimitingMechanisms();
      await this.delay(15000); // Longer cooldown after rate limit test
      
      await this.testFallbackMechanisms();
      await this.delay(10000);
      
      const batchResults = await this.testBatchProcessingStress();
      
      console.log('\n' + '='.repeat(70));
      console.log('🎯 TEST SUITE COMPLETED');
      console.log('='.repeat(70));
      
      const report = this.generateReport();
      this.printSummary(report);
      
      return report;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }

  // Print test summary
  printSummary(report) {
    console.log('\n📊 TEST SUMMARY:');
    console.log(`  Proxy Tests: ${report.summary.proxyTests.successful}/${report.summary.proxyTests.total} successful`);
    console.log(`  User Agent Tests: ${report.summary.userAgentTests.successful}/${report.summary.userAgentTests.total} successful`);
    console.log(`  Fallback Tests: ${report.summary.fallbackTests.totalFailed}/${report.summary.fallbackTests.total} completely failed`);
    
    console.log('\n🎯 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      const priority = rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '⚠️' : 'ℹ️';
      console.log(`  ${priority} ${rec.message}`);
    });
  }
}

// Export for use in other test files
module.exports = YouTubeBlockingTest;

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new YouTubeBlockingTest();
  tester.runAllTests()
    .then(report => {
      console.log('\n✅ All tests completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}