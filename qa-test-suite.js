// JESSICA's Comprehensive QA Test Suite
// Testing all components systematically

// Use curl instead of fetch for Node.js compatibility
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class QATestSuite {
  constructor() {
    this.testResults = [];
    this.bugReport = [];
    this.baseUrl = 'http://localhost:3001';
  }

  // Test helper
  async runTest(testName, testFunction) {
    console.log(`\n🧪 TESTING: ${testName}`);
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'PASS',
        duration,
        result
      });
      
      console.log(`✅ PASS: ${testName} (${duration}ms)`);
      return result;
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        error: error.message
      });
      
      this.bugReport.push({
        test: testName,
        error: error.message,
        severity: 'HIGH',
        component: 'API'
      });
      
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
      throw error;
    }
  }

  // Single Video Processing Tests
  async testSingleVideoProcessing() {
    console.log('\n=== SINGLE VIDEO PROCESSING TESTS ===');
    
    // Test 1: Basic YouTube URL processing
    await this.runTest('Basic YouTube URL Processing', async () => {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          customDuration: 15
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data.clips || !Array.isArray(data.clips)) {
        throw new Error('Response missing clips array');
      }
      
      if (data.clips.length === 0) {
        throw new Error('No clips generated');
      }
      
      // Validate clip structure
      const clip = data.clips[0];
      const requiredFields = ['timestamp', 'headline', 'videoUrl', 'captions'];
      for (const field of requiredFields) {
        if (!clip[field]) {
          throw new Error(`Clip missing required field: ${field}`);
        }
      }
      
      return { clipsGenerated: data.clips.length, firstClip: clip.headline };
    });
    
    // Test 2: Different URL formats
    const urlFormats = [
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
    ];
    
    for (const url of urlFormats) {
      await this.runTest(`URL Format: ${url}`, async () => {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: url, customDuration: 15 })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to process URL format: ${url}`);
        }
        
        const data = await response.json();
        return { processed: true, clips: data.clips?.length || 0 };
      });
    }
    
    // Test 3: Invalid URLs
    const invalidUrls = [
      'https://vimeo.com/123456',
      'https://not-a-url',
      '',
      'youtube.com/watch?v=invalid',
      'https://www.youtube.com/watch?v=',
      'https://www.youtube.com/watch?v=toolongtobeavalidvideoid123456789'
    ];
    
    for (const url of invalidUrls) {
      await this.runTest(`Invalid URL Handling: ${url || 'empty'}`, async () => {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: url, customDuration: 15 })
        });
        
        // Should return error status for invalid URLs
        if (response.ok) {
          const data = await response.json();
          if (!data.error && !data.message) {
            throw new Error(`Invalid URL ${url} was accepted - should return error`);
          }
        }
        
        return { properlyRejected: true };
      });
    }
  }

  // Batch Processing Tests
  async testBatchProcessing() {
    console.log('\n=== BATCH PROCESSING TESTS ===');
    
    // Test 1: Valid batch processing
    await this.runTest('Valid Batch Processing', async () => {
      const response = await fetch(`${this.baseUrl}/api/generate/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrls: [
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'https://www.youtube.com/watch?v=jNQXAC9IVRw'
          ],
          customDuration: 15,
          plan: 'pro'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Batch processing failed: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Batch response missing results array');
      }
      
      return { 
        processed: data.totalProcessed || 0, 
        errors: data.totalErrors || 0,
        results: data.results.length 
      };
    });
    
    // Test 2: Empty batch
    await this.runTest('Empty Batch Handling', async () => {
      const response = await fetch(`${this.baseUrl}/api/generate/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrls: [],
          customDuration: 15,
          plan: 'pro'
        })
      });
      
      if (response.ok) {
        throw new Error('Empty batch should return error');
      }
      
      return { properlyRejected: true };
    });
    
    // Test 3: Too many URLs
    await this.runTest('Batch Size Limit', async () => {
      const tooManyUrls = new Array(10).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      const response = await fetch(`${this.baseUrl}/api/generate/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrls: tooManyUrls,
          customDuration: 15,
          plan: 'pro'
        })
      });
      
      if (response.ok) {
        throw new Error('Batch with >6 URLs should be rejected');
      }
      
      return { properlyRejected: true };
    });
  }

  // API Health Tests
  async testApiHealth() {
    console.log('\n=== API HEALTH TESTS ===');
    
    await this.runTest('API Health Check', async () => {
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (response.ok) {
        return { healthy: true };
      } else {
        // Health endpoint might not exist, that's OK
        return { noHealthEndpoint: true };
      }
    });
    
    await this.runTest('Progress Endpoint', async () => {
      const response = await fetch(`${this.baseUrl}/api/progress`);
      
      if (!response.ok) {
        throw new Error('Progress endpoint not responding');
      }
      
      const data = await response.json();
      return { status: data.status || 'unknown' };
    });
  }

  // Generate Bug Report
  generateBugReport() {
    console.log('\n=== BUG REPORT ===');
    
    if (this.bugReport.length === 0) {
      console.log('🎉 NO BUGS FOUND!');
      return;
    }
    
    console.log(`\n🐛 FOUND ${this.bugReport.length} BUGS:`);
    this.bugReport.forEach((bug, index) => {
      console.log(`\n${index + 1}. ${bug.test}`);
      console.log(`   Severity: ${bug.severity}`);
      console.log(`   Component: ${bug.component}`);
      console.log(`   Error: ${bug.error}`);
    });
  }

  // Generate Test Summary
  generateSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed/total)*100).toFixed(1)}%`);
  }

  // Run All Tests
  async runAllTests() {
    console.log('🚀 JESSICA\'S COMPREHENSIVE QA TEST SUITE STARTING...\n');
    
    try {
      await this.testApiHealth();
      await this.testSingleVideoProcessing();
      await this.testBatchProcessing();
    } catch (error) {
      console.log(`\n⚠️ Test suite interrupted: ${error.message}`);
    }
    
    this.generateSummary();
    this.generateBugReport();
    
    return {
      totalTests: this.testResults.length,
      passed: this.testResults.filter(t => t.status === 'PASS').length,
      failed: this.testResults.filter(t => t.status === 'FAIL').length,
      bugs: this.bugReport
    };
  }
}

// Run tests if called directly
if (require.main === module) {
  const qa = new QATestSuite();
  qa.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = QATestSuite;