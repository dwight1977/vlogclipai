const axios = require('axios');

// Test the timestamp parsing fix
async function testTimestampFix() {
  console.log('🔧 Testing Timestamp Parsing Fix\n');
  
  const serverUrl = 'http://localhost:3001';
  
  // Use the shortest video we know works
  const testVideo = {
    name: 'Me at the zoo (19 seconds)',
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    reason: 'Short video, less likely to hit rate limits'
  };
  
  console.log(`🎬 Testing: ${testVideo.name}`);
  console.log(`📍 URL: ${testVideo.url}`);
  console.log(`💡 Reason: ${testVideo.reason}\n`);
  
  try {
    console.log('📤 Sending request...');
    const startTime = Date.now();
    
    const response = await axios.post(`${serverUrl}/api/generate`, {
      videoUrl: testVideo.url,
      plan: 'pro'
    }, {
      timeout: 180000 // 3 minutes
    });
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`⏱️ Processing time: ${duration} seconds`);
    
    if (response.data.clips && response.data.clips.length > 0) {
      const clips = response.data.clips;
      console.log(`📊 Received ${clips.length} clips`);
      
      if (response.data.isDemo) {
        console.log('❌ STILL FAILING: Demo clips returned');
        console.log(`📝 Message: ${response.data.message}`);
        console.log('\n🔍 This means one of these issues persists:');
        console.log('  - Timestamp parsing still broken');
        console.log('  - FFmpeg still failing');
        console.log('  - Video download failing');
        console.log('  - Other processing error');
      } else {
        console.log('🎉 SUCCESS: Real clips generated!');
        console.log('\n📹 Clip Details:');
        
        clips.forEach((clip, index) => {
          console.log(`\n  Clip ${index + 1}:`);
          console.log(`    Headline: ${clip.headline}`);
          console.log(`    Timestamp: ${clip.timestamp}`);
          console.log(`    File: ${clip.file || clip.videoUrl}`);
          
          // Check if filename contains video ID
          const filename = clip.file || clip.videoUrl;
          if (filename && filename.includes('jNQXAC9IVRw')) {
            console.log(`    ✅ Correct video ID in filename`);
          } else {
            console.log(`    ⚠️ Video ID missing from filename: ${filename}`);
          }
        });
        
        console.log('\n🎯 CONCLUSION: Timestamp fix worked! Video processing is now functional.');
      }
    } else {
      console.log('❌ No clips returned');
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      if (error.response.data) {
        console.log('Details:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT STEPS:');
  console.log('✅ If SUCCESS: The fix worked - try with other videos');
  console.log('❌ If STILL FAILING: Check server logs for specific error');
  console.log('⚠️ If REQUEST FAILED: Server or network issue');
}

// Main function
async function main() {
  console.log('🧪 Testing Timestamp Parsing Fix\n');
  
  // Quick server check
  try {
    await axios.get('http://localhost:3001', { timeout: 3000 });
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server not running - start with: node index.js\n');
    process.exit(1);
  }
  
  await testTimestampFix();
  
  console.log('\n✅ Test completed!');
}

if (require.main === module) {
  main().catch(console.error);
}