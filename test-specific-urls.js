// Test the specific URLs that are failing in batch processing
const YouTubeHelper = require('./youtube-helper-new.js');

async function testSpecificUrls() {
  console.log('🧪 Testing specific URLs that failed in batch processing...');
  
  const youtube = new YouTubeHelper();
  
  const testUrls = [
    'https://www.youtube.com/watch?v=W36uRAqBqjA',
    'https://www.youtube.com/watch?v=Iv9m2KfTe2Q&t=56s'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🎯 Testing: ${url}`);
    
    try {
      // Test video ID extraction
      const videoId = youtube.getVideoID(url);
      console.log(`📋 Video ID: ${videoId}`);
      
      if (!videoId) {
        console.log('❌ Invalid video ID - URL parsing failed');
        continue;
      }
      
      // Test getting video info
      console.log('📋 Getting video info...');
      const info = await youtube.getVideoInfo(url);
      console.log(`✅ Video info:`, {
        id: info.id,
        title: info.title?.substring(0, 50) + '...',
        duration: info.duration,
        available: info.available
      });
      
      // Test download capability
      console.log('📥 Testing download...');
      const testPath = `/tmp/test-${videoId}.mp4`;
      
      await youtube.downloadVideo(url, testPath, 'worst');
      console.log(`✅ Download succeeded: ${testPath}`);
      
      // Check file
      const fs = require('fs');
      if (fs.existsSync(testPath)) {
        const stats = fs.statSync(testPath);
        console.log(`📊 File size: ${Math.round(stats.size / 1024)} KB`);
        fs.unlinkSync(testPath); // Clean up
      }
      
    } catch (error) {
      console.log(`❌ URL failed: ${error.message}`);
      
      // Analyze error type
      if (error.message.toLowerCase().includes('private')) {
        console.log('🔍 ANALYSIS: Video is private');
      } else if (error.message.toLowerCase().includes('unavailable')) {
        console.log('🔍 ANALYSIS: Video is unavailable');
      } else if (error.message.toLowerCase().includes('deleted')) {
        console.log('🔍 ANALYSIS: Video was deleted');
      } else if (error.message.toLowerCase().includes('age')) {
        console.log('🔍 ANALYSIS: Age-restricted video');
      } else {
        console.log('🔍 ANALYSIS: Unknown error - may be regional restriction or other issue');
      }
    }
    
    // Wait between tests
    console.log('⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Test completed');
}

testSpecificUrls().catch(console.error);