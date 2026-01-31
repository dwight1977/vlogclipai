#!/usr/bin/env node

const YouTubeBlockingTest = require('./test-youtube-blocking-solutions');
const EnhancedProxySystem = require('./enhanced-proxy-system');

class TestRunner {
  constructor() {
    this.proxySystem = new EnhancedProxySystem();
  }

  async runQuickTest() {
    console.log('🚀 Running Quick YouTube Blocking Test...');
    console.log('='.repeat(50));

    try {
      // First validate proxy configurations
      console.log('\n1. Validating proxy configurations...');
      await this.proxySystem.validateAllProxies();
      
      // Test with a single video URL
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      console.log(`\n2. Testing enhanced request system with: ${testUrl}`);
      
      try {
        const response = await this.proxySystem.makeEnhancedRequest(
          `https://www.youtube.com/oembed?url=${testUrl}&format=json`
        );
        
        console.log('✅ Enhanced request successful!');
        console.log(`   Title: ${response.data.title}`);
        console.log(`   Author: ${response.data.author_name}`);
        
      } catch (error) {
        console.log(`❌ Enhanced request failed: ${error.message}`);
      }

      // Show current stats
      console.log('\n3. Current session statistics:');
      const stats = this.proxySystem.getStats();
      console.log(`   Total Requests: ${stats.totalRequests}`);
      console.log(`   Success Rate: ${stats.successRate}%`);
      console.log(`   Active Proxies: ${stats.activeProxies}`);
      console.log(`   Rate Limit Hits: ${stats.rateLimitHits}`);
      console.log(`   In Cooldown: ${stats.inCooldown ? 'Yes' : 'No'}`);

      console.log('\n✅ Quick test completed!');
      
    } catch (error) {
      console.error('\n❌ Quick test failed:', error.message);
    }
  }

  async runFullTestSuite() {
    console.log('🚀 Running Full YouTube Blocking Test Suite...');
    console.log('='.repeat(60));
    
    const tester = new YouTubeBlockingTest();
    
    try {
      const report = await tester.runAllTests();
      
      console.log('\n📄 Test suite completed successfully!');
      console.log(`📊 Report saved with ${report.detailedResults.proxyTests.length} proxy tests`);
      
      return report;
      
    } catch (error) {
      console.error('\n❌ Full test suite failed:', error.message);
      throw error;
    }
  }

  async testBatchProcessing() {
    console.log('🔄 Testing Batch Processing with Enhanced Proxy System...');
    console.log('='.repeat(55));

    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      'https://www.youtube.com/watch?v=9bZkp7q19f0'
    ];

    console.log(`\nTesting batch processing with ${testUrls.length} videos...`);

    const results = [];
    
    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      console.log(`\n📹 Processing video ${i + 1}/${testUrls.length}: ${url}`);
      
      try {
        // Simulate your batch processing logic with enhanced proxy system
        const ytdlOptions = this.proxySystem.getYtdlOptions();
        console.log(`   Using proxy with UA: ${ytdlOptions.requestOptions.headers['User-Agent'].substring(0, 50)}...`);
        
        // Test with YouTube oEmbed API as a proxy for actual video processing
        const response = await this.proxySystem.makeEnhancedRequest(
          `https://www.youtube.com/oembed?url=${url}&format=json`
        );
        
        results.push({
          url,
          success: true,
          title: response.data.title,
          duration: response.data.duration || 'N/A'
        });
        
        console.log(`   ✅ Success: ${response.data.title}`);
        
        // Add delay between batch items to avoid rate limiting
        if (i < testUrls.length - 1) {
          console.log('   ⏳ Waiting before next video...');
          await new Promise(resolve => setTimeout(resolve, 8000));
        }
        
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message
        });
        
        console.log(`   ❌ Failed: ${error.message}`);
        
        // Check if we hit rate limit
        if (error.message.includes('Rate limit')) {
          console.log('   🚨 Rate limit detected - stopping batch processing');
          break;
        }
      }
    }

    console.log('\n📊 Batch Processing Results:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`   ${index + 1}. ✅ ${result.title}`);
      } else {
        console.log(`   ${index + 1}. ❌ Failed - ${result.error}`);
      }
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎯 Success Rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(1)}%)`);

    // Show final stats
    const stats = this.proxySystem.getStats();
    console.log('\n📈 Final Session Stats:');
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Success Rate: ${stats.successRate}%`);
    console.log(`   Rate Limit Hits: ${stats.rateLimitHits}`);

    return results;
  }

  showUsage() {
    console.log('\n📋 YouTube Blocking Test Runner');
    console.log('Usage: node run-blocking-tests.js [command]');
    console.log('\nCommands:');
    console.log('  quick     - Run quick proxy validation and single request test');
    console.log('  full      - Run comprehensive test suite (all tests)');
    console.log('  batch     - Test batch processing with proxy rotation');
    console.log('  help      - Show this help message');
    console.log('\nExamples:');
    console.log('  node run-blocking-tests.js quick');
    console.log('  node run-blocking-tests.js full');
    console.log('  node run-blocking-tests.js batch');
    console.log('\n⚠️  Important: Update proxy configurations in enhanced-proxy-system.js before testing!');
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  const command = process.argv[2] || 'help';

  switch (command.toLowerCase()) {
    case 'quick':
      await runner.runQuickTest();
      break;
    
    case 'full':
      await runner.runFullTestSuite();
      break;
    
    case 'batch':
      await runner.testBatchProcessing();
      break;
    
    case 'help':
    default:
      runner.showUsage();
      break;
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🏁 Test runner completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = TestRunner;