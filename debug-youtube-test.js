// DR. ALEX's Localhost Debug Test
// Test the exact YouTube processing that's failing with "video unavailable"

const YouTubeHelper = require('./youtube-helper-new.js');

async function testYouTubeProcessing() {
  console.log('🧪 DR. ALEX: Starting localhost YouTube debug test...');
  
  const youtube = new YouTubeHelper();
  
  // Test with a simple, known working YouTube video
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - should always work
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo - first YouTube video
    'https://www.youtube.com/watch?v=9bZkp7q19f0'  // PSY - Gangnam Style
  ];
  
  for (const url of testUrls) {
    console.log(`\n🎯 Testing URL: ${url}`);
    
    try {
      // Test getting video info first
      console.log('📋 Step 1: Getting video info...');
      const info = await youtube.getVideoInfo(url);
      console.log(`✅ Video info retrieved:`, {
        id: info.id,
        title: info.title?.substring(0, 50) + '...',
        duration: info.duration,
        available: info.available
      });
      
      // Test actual download capability
      console.log('📥 Step 2: Testing download capability...');
      const videoId = youtube.getVideoID(url);
      const testPath = `/tmp/debug-test-${videoId}.mp4`;
      
      await youtube.downloadVideo(url, testPath, 'worst'); // Use worst quality for speed
      console.log(`✅ Download test succeeded: ${testPath}`);
      
      // Check file size
      const fs = require('fs');
      if (fs.existsSync(testPath)) {
        const stats = fs.statSync(testPath);
        console.log(`📊 File size: ${Math.round(stats.size / 1024)} KB`);
        
        if (stats.size < 10000) {
          console.log(`⚠️ WARNING: File size very small - might be an error file`);
        }
        
        // Clean up
        fs.unlinkSync(testPath);
      }
      
      console.log(`✅ URL ${url} - PASSED ALL TESTS`);
      
    } catch (error) {
      console.log(`❌ URL ${url} - FAILED:`, error.message);
      
      // Show detailed error analysis
      if (error.message.toLowerCase().includes('unavailable')) {
        console.log('🔍 ANALYSIS: Video appears unavailable - this is the issue we need to solve');
      } else if (error.message.toLowerCase().includes('rate limit')) {
        console.log('🔍 ANALYSIS: Rate limiting detected');
      } else if (error.message.toLowerCase().includes('timeout')) {
        console.log('🔍 ANALYSIS: Timeout issue - network or processing delay');
      }
    }
    
    // Wait between tests to avoid rate limiting
    console.log('⏳ Waiting 3 seconds between tests...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🏁 DR. ALEX: Debug test completed');
}

// Run the test
testYouTubeProcessing().catch(console.error);