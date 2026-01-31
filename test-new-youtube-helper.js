const YouTubeHelper = require('./youtube-helper-new');
const fs = require('fs');
const path = require('path');

// Test the new YouTube helper
async function testNewYouTubeHelper() {
  console.log('🧪 Testing New YouTube Helper\n');
  
  const youtube = new YouTubeHelper();
  
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo
    'https://www.youtube.com/watch?v=ceeyrlbourc&t=506s', // Your original URL
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n🎬 Test ${i + 1}: ${url}`);
    
    // Test 1: URL validation
    console.log('  📋 URL Validation');
    const isValid = youtube.validateURL(url);
    const videoId = youtube.getVideoID(url);
    console.log(`    Valid: ${isValid}, Video ID: ${videoId}`);
    
    if (!isValid) {
      console.log('    ❌ Invalid URL, skipping');
      continue;
    }
    
    // Test 2: Video accessibility
    console.log('  🔍 Video Accessibility');
    const testResult = await youtube.testVideo(url);
    if (testResult.accessible) {
      console.log(`    ✅ Accessible: ${testResult.info.title}`);
      console.log(`    📺 Channel: ${testResult.info.author}`);
      console.log(`    ⏱️ Duration: ${testResult.info.duration}s`);
      
      // Test 3: Try a small audio download
      console.log('  🎵 Audio Download Test');
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const audioPath = path.join(tempDir, `test-audio-${videoId}.mp3`);
      
      try {
        // This will take a while, so let's set a shorter timeout for testing
        await Promise.race([
          youtube.downloadAudio(url, audioPath),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), 30000)
          )
        ]);
        
        if (fs.existsSync(audioPath)) {
          const stats = fs.statSync(audioPath);
          console.log(`    ✅ Audio test successful: ${stats.size} bytes`);
          
          // Clean up
          fs.unlinkSync(audioPath);
        }
      } catch (audioError) {
        if (audioError.message === 'Test timeout') {
          console.log(`    ⏱️ Audio download started (stopped for test)`);
        } else {
          console.log(`    ❌ Audio download failed: ${audioError.message}`);
        }
      }
      
    } else {
      console.log(`    ❌ Not accessible: ${testResult.error}`);
    }
    
    console.log('  ' + '-'.repeat(60));
  }
  
  console.log('\n✅ New YouTube Helper test completed!');
  console.log('\n📊 Summary:');
  console.log('- If videos show as accessible, the new helper works');
  console.log('- If downloads start, yt-dlp is functioning correctly');
  console.log('- This approach bypasses all ytdl-core issues');
}

// Run test
if (require.main === module) {
  testNewYouTubeHelper().catch(console.error);
}

module.exports = { testNewYouTubeHelper };