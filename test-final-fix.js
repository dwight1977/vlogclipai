const axios = require('axios');

// Test the final fix with working YouTube videos
async function testFinalFix() {
  console.log('🚀 Testing Final Video Processing Fix\n');
  
  const serverUrl = 'http://localhost:3001';
  
  // Use videos we know work from our earlier test
  const workingVideos = [
    {
      name: 'Rick Astley (confirmed working)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      name: 'Me at the zoo (confirmed working)', 
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
    }
  ];
  
  for (const video of workingVideos) {
    console.log(`\n🎬 Testing: ${video.name}`);
    console.log(`URL: ${video.url}\n`);
    
    try {
      const startTime = Date.now();
      
      console.log('📤 Sending request to server...');
      const response = await axios.post(`${serverUrl}/api/generate`, {
        videoUrl: video.url,
        plan: 'pro'
      }, {
        timeout: 300000 // 5 minutes timeout
      });
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏱️ Total processing time: ${duration} seconds`);
      
      if (response.data.clips && response.data.clips.length > 0) {
        const clips = response.data.clips;
        console.log(`✅ SUCCESS: Generated ${clips.length} real clips!`);
        
        // Check if it's demo or real
        if (response.data.isDemo) {
          console.log('⚠️ UNEXPECTED: Still returning demo clips');
          console.log(`Message: ${response.data.message}`);
        } else {
          console.log('🎉 REAL CLIPS GENERATED (not demo)!');
          
          // Show clip details
          clips.forEach((clip, index) => {
            console.log(`\n  📹 Clip ${index + 1}:`);
            console.log(`    Headline: ${clip.headline}`);
            console.log(`    Timestamp: ${clip.timestamp}`);
            console.log(`    File: ${clip.file || clip.videoUrl}`);
            console.log(`    TikTok: ${clip.captions.tiktok}`);
            
            // Check if filename contains video ID
            const filename = clip.file || clip.videoUrl;
            if (filename && filename.includes('dQw4w9WgXcQ')) {
              console.log(`    ✅ Filename contains correct video ID`);
            } else if (filename && filename.includes('jNQXAC9IVRw')) {
              console.log(`    ✅ Filename contains correct video ID`);
            } else {
              console.log(`    ⚠️ Filename might not contain video ID: ${filename}`);
            }
          });
        }
        
      } else {
        console.log('❌ No clips returned');
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\n🎯 TEST SUMMARY:');
  console.log('✅ SUCCESS CRITERIA:');
  console.log('  - Should get real clips (not demo)');
  console.log('  - Clips should have different video IDs in filenames');
  console.log('  - Should NOT show "Video Unavailable"');
  console.log('  - Should NOT show "isDemo: true"');
  console.log('\n❌ FAILURE INDICATORS:');
  console.log('  - "Video Unavailable" message');
  console.log('  - Demo clips returned'); 
  console.log('  - Same filenames for different videos');
}

// Check server first
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3001', { timeout: 5000 });
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not responding');
    console.log('Please start the server: node index.js');
    return false;
  }
}

// Main function
async function main() {
  console.log('🧪 Final Fix Testing Script\n');
  
  const serverOk = await checkServer();
  if (!serverOk) {
    process.exit(1);
  }
  
  await testFinalFix();
  
  console.log('\n✅ Testing completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testFinalFix, checkServer };