const axios = require('axios');

// Test the application with videos we KNOW work
async function testWorkingVideos() {
  console.log('🧪 Testing Application with CONFIRMED Working Videos\n');
  
  const serverUrl = 'http://localhost:3001';
  
  // Use videos that our test confirmed are working
  const workingVideos = [
    {
      name: 'Rick Astley (213s)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      expected: 'Should generate real clips from Rick Astley video'
    },
    {
      name: 'Me at the zoo (19s)', 
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      expected: 'Should generate real clips from first YouTube video'
    }
  ];
  
  for (const video of workingVideos) {
    console.log(`\n🎬 Testing: ${video.name}`);
    console.log(`📍 URL: ${video.url}`);
    console.log(`🎯 Expected: ${video.expected}\n`);
    
    try {
      console.log('📤 Sending request to server...');
      const startTime = Date.now();
      
      const response = await axios.post(`${serverUrl}/api/generate`, {
        videoUrl: video.url,
        plan: 'pro'
      }, {
        timeout: 300000 // 5 minutes
      });
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏱️ Processing time: ${duration} seconds`);
      
      // Analyze the response
      if (response.data.clips && response.data.clips.length > 0) {
        const clips = response.data.clips;
        console.log(`📊 Received ${clips.length} clips`);
        
        // Check if it's demo or real
        if (response.data.isDemo) {
          console.log('❌ PROBLEM: Still returning demo clips');
          console.log(`📝 Message: ${response.data.message}`);
          console.log('🚨 This indicates the yt-dlp integration is not working in the app');
        } else {
          console.log('🎉 SUCCESS: Real clips generated!');
          
          // Show details of first clip
          const firstClip = clips[0];
          console.log(`\n📹 First Clip Details:`);
          console.log(`  Headline: ${firstClip.headline}`);
          console.log(`  Timestamp: ${firstClip.timestamp}`);
          console.log(`  File: ${firstClip.file || firstClip.videoUrl}`);
          console.log(`  TikTok Caption: ${firstClip.captions.tiktok}`);
          
          // Check if video ID is in filename
          const videoId = video.url.includes('dQw4w9WgXcQ') ? 'dQw4w9WgXcQ' : 'jNQXAC9IVRw';
          const filename = firstClip.file || firstClip.videoUrl;
          
          if (filename && filename.includes(videoId)) {
            console.log(`  ✅ Filename contains correct video ID: ${videoId}`);
          } else {
            console.log(`  ⚠️ Filename may not contain video ID: ${filename}`);
          }
        }
        
      } else {
        console.log('❌ No clips returned at all');
        console.log('Response data:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        if (error.response.data) {
          console.log('Error details:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('✅ If you see "SUCCESS: Real clips generated" → App is working!');
  console.log('❌ If you see "PROBLEM: Still returning demo clips" → App needs yt-dlp integration fix');
  console.log('⚠️ If you see request failures → Server or network issues');
}

// Check server status first
async function checkServerStatus() {
  try {
    const response = await axios.get('http://localhost:3001', { timeout: 5000 });
    console.log('✅ Server is running and responding');
    return true;
  } catch (error) {
    console.log('❌ Server is not accessible');
    console.log('Please ensure server is running: node index.js');
    return false;
  }
}

// Main function
async function main() {
  console.log('🧪 Application Testing with Working YouTube Videos\n');
  
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    console.log('\n🔧 To start server: node index.js');
    process.exit(1);
  }
  
  await testWorkingVideos();
  
  console.log('\n✅ Testing completed!');
  console.log('\n📋 Summary:');
  console.log('- We confirmed yt-dlp works for these videos');
  console.log('- Now we tested if the app processes them correctly');
  console.log('- Results above show if the yt-dlp integration is working');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWorkingVideos, checkServerStatus };