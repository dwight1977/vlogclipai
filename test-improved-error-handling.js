const axios = require('axios');

// Test the improved error handling with the specific video from screenshot
async function testImprovedErrorHandling() {
  console.log('🧪 Testing Improved Error Handling...\n');
  
  const serverUrl = 'http://localhost:3001';
  
  // Test cases
  const testCases = [
    {
      name: 'Unavailable Video (from screenshot)',
      url: 'https://www.youtube.com/watch?v=ceeyrlbourc&t=506s',
      expectedBehavior: 'Should return demo clips with clear unavailable message'
    },
    {
      name: 'Invalid Video ID',
      url: 'https://www.youtube.com/watch?v=invalidvideoid123',
      expectedBehavior: 'Should return demo clips with unavailable message'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🎬 Testing: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    console.log(`Expected: ${testCase.expectedBehavior}\n`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post(`${serverUrl}/api/generate`, {
        videoUrl: testCase.url,
        plan: 'pro'
      }, {
        timeout: 180000 // 3 minutes timeout
      });
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏱️ Processing took: ${duration} seconds`);
      
      if (response.data.clips && response.data.clips.length > 0) {
        console.log(`✅ Received ${response.data.clips.length} clips`);
        
        // Check if it's a demo
        if (response.data.isDemo) {
          console.log('🎭 Demo clips returned (as expected for unavailable video)');
          console.log(`📝 Message: ${response.data.message}`);
          console.log(`📊 Video Status: ${response.data.videoStatus || 'not specified'}`);
          
          // Show the first clip details
          const firstClip = response.data.clips[0];
          console.log(`🎯 First clip headline: ${firstClip.headline}`);
          console.log(`📅 Timestamp: ${firstClip.timestamp}`);
          console.log(`🎵 TikTok caption: ${firstClip.captions.tiktok}`);
        } else {
          console.log('🎥 Real clips returned (unexpected for unavailable video)');
        }
      } else {
        console.log('❌ No clips returned');
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      
      if (error.response) {
        console.log(`📊 Status Code: ${error.response.status}`);
        console.log(`📝 Error Response: ${JSON.stringify(error.response.data, null, 2)}`);
        
        // Check for rate limiting
        if (error.response.status === 429) {
          console.log('⚠️ Rate limiting detected (this is good - proper error handling!)');
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
  }
  
  console.log('\n✅ Error handling test completed!');
  console.log('\n📋 Summary:');
  console.log('- Unavailable videos should return demo clips with clear messaging');
  console.log('- Rate limited requests should return 429 status with retry guidance');
  console.log('- Demo clips should have "isDemo: true" and explanatory messages');
}

// Test server connectivity first
async function testServerConnectivity() {
  try {
    const response = await axios.get('http://localhost:3001');
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('Run: npm start or node index.js');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Improved Error Handling Tests...\n');
  
  // Check server connectivity
  const serverRunning = await testServerConnectivity();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Run the main tests
  await testImprovedErrorHandling();
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testImprovedErrorHandling,
  testServerConnectivity,
  runTests
};