// JESSICA's QA Test Suite - Simplified with curl
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class JessicaQA {
  constructor() {
    this.bugs = [];
    this.tests = [];
  }

  async curlPost(endpoint, data) {
    const cmd = `curl -X POST http://localhost:3001${endpoint} \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(data)}' \
      --max-time 60 -s`;
    
    const { stdout, stderr } = await execPromise(cmd);
    if (stderr) throw new Error(stderr);
    return JSON.parse(stdout);
  }

  async curlGet(endpoint) {
    const cmd = `curl http://localhost:3001${endpoint} -s --max-time 10`;
    const { stdout, stderr } = await execPromise(cmd);
    if (stderr) throw new Error(stderr);
    return JSON.parse(stdout);
  }

  logBug(test, error, severity = 'HIGH') {
    this.bugs.push({ test, error, severity });
    console.log(`🐛 BUG FOUND in ${test}: ${error}`);
  }

  async testSingleVideo() {
    console.log('\n🧪 TESTING: Single Video Processing');
    
    try {
      const result = await this.curlPost('/api/generate', {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        customDuration: 15
      });
      
      // Check if clips were generated
      if (!result.clips || result.clips.length === 0) {
        this.logBug('Single Video Processing', 'No clips generated');
        return false;
      }
      
      // Check clip structure
      const clip = result.clips[0];
      const required = ['timestamp', 'headline', 'videoUrl', 'captions'];
      for (const field of required) {
        if (!clip[field]) {
          this.logBug('Single Video Processing', `Missing field: ${field}`);
          return false;
        }
      }
      
      console.log(`✅ Single video processing works - ${result.clips.length} clips generated`);
      return true;
      
    } catch (error) {
      this.logBug('Single Video Processing', error.message);
      return false;
    }
  }

  async testBatchProcessing() {
    console.log('\n🧪 TESTING: Batch Processing');
    
    try {
      const result = await this.curlPost('/api/generate/batch', {
        videoUrls: [
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          'https://www.youtube.com/watch?v=jNQXAC9IVRw'
        ],
        customDuration: 15,
        plan: 'pro'
      });
      
      // Check batch results
      if (!result.results || !Array.isArray(result.results)) {
        this.logBug('Batch Processing', 'Missing results array');
        return false;
      }
      
      console.log(`✅ Batch processing works - ${result.totalProcessed || 0} videos processed`);
      return true;
      
    } catch (error) {
      this.logBug('Batch Processing', error.message);
      return false;
    }
  }

  async testInvalidUrls() {
    console.log('\n🧪 TESTING: Invalid URL Handling');
    
    const invalidUrls = [
      'https://vimeo.com/123456',
      'not-a-url',
      '',
      'https://www.youtube.com/watch?v='
    ];
    
    let bugsFound = 0;
    
    for (const url of invalidUrls) {
      try {
        const result = await this.curlPost('/api/generate', {
          videoUrl: url,
          customDuration: 15
        });
        
        // If no error occurred, this might be a bug
        if (!result.error && !result.message && result.clips) {
          this.logBug('Invalid URL Handling', `Invalid URL "${url}" was accepted`);
          bugsFound++;
        }
        
      } catch (error) {
        // Expected behavior - invalid URLs should fail
        console.log(`✅ Invalid URL "${url}" properly rejected`);
      }
    }
    
    return bugsFound === 0;
  }

  async testApiEndpoints() {
    console.log('\n🧪 TESTING: API Endpoints');
    
    try {
      // Test progress endpoint
      await this.curlGet('/api/progress');
      console.log('✅ Progress endpoint responding');
      
      return true;
    } catch (error) {
      this.logBug('API Endpoints', `Progress endpoint failed: ${error.message}`);
      return false;
    }
  }

  async testBatchErrors() {
    console.log('\n🧪 TESTING: Batch Error Handling');
    
    try {
      // Test empty batch
      const result = await this.curlPost('/api/generate/batch', {
        videoUrls: [],
        customDuration: 15,
        plan: 'pro'
      });
      
      // This should return an error
      if (result.success !== false && !result.error) {
        this.logBug('Batch Error Handling', 'Empty batch should return error');
        return false;
      }
      
      console.log('✅ Empty batch properly handled');
      return true;
      
    } catch (error) {
      // This is expected for invalid requests
      console.log('✅ Empty batch properly rejected');
      return true;
    }
  }

  async runAllTests() {
    console.log('🚀 JESSICA\'S QA TESTING STARTING...');
    console.log('Testing all critical functionality systematically\n');
    
    const tests = [
      this.testApiEndpoints(),
      this.testSingleVideo(),
      this.testBatchProcessing(),
      this.testInvalidUrls(),
      this.testBatchErrors()
    ];
    
    const results = await Promise.allSettled(tests);
    
    let passed = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        passed++;
      }
    });
    
    console.log('\n=== JESSICA\'S QA REPORT ===');
    console.log(`Tests Run: ${tests.length}`);
    console.log(`Tests Passed: ${passed}`);
    console.log(`Tests Failed: ${tests.length - passed}`);
    console.log(`Bugs Found: ${this.bugs.length}`);
    
    if (this.bugs.length > 0) {
      console.log('\n🐛 BUGS THAT NEED FIXING:');
      this.bugs.forEach((bug, index) => {
        console.log(`${index + 1}. ${bug.test}: ${bug.error} (${bug.severity})`);
      });
    } else {
      console.log('\n🎉 NO CRITICAL BUGS FOUND!');
    }
    
    return {
      totalTests: tests.length,
      passed,
      failed: tests.length - passed,
      bugs: this.bugs
    };
  }
}

// Run tests
const jessica = new JessicaQA();
jessica.runAllTests().then(results => {
  process.exit(results.bugs.length > 0 ? 1 : 0);
}).catch(error => {
  console.error('QA Suite crashed:', error);
  process.exit(1);
});

module.exports = JessicaQA;