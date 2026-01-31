const YouTubeHelper = require('./youtube-helper-new');
const fs = require('fs');
const path = require('path');

// Test the enhanced YouTube helper with multiple strategies
async function testEnhancedYouTubeHelper() {
  console.log('🧪 TESTING ENHANCED YOUTUBE HELPER WITH ANTI-DETECTION STRATEGIES\n');
  console.log('=' .repeat(70));
  
  const youtube = new YouTubeHelper();
  const testDir = path.join(__dirname, 'temp', 'test-enhanced');
  
  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Test videos (from our successful comprehensive analysis)
  const testVideos = [
    { 
      name: 'Rick Astley - Never Gonna Give You Up',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      reason: 'Classic video, confirmed working in analysis'
    },
    {
      name: 'Me at the zoo (First YouTube video)',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 
      reason: 'Historic video, very short (19s), good for testing'
    },
    {
      name: 'Gangnam Style',
      url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      reason: 'Popular video, confirmed working in analysis'
    }
  ];
  
  console.log(`\n🎯 PHASE 3A: Testing Video Info Extraction with Anti-Detection\n`);
  
  let infoSuccessCount = 0;
  for (const video of testVideos) {
    console.log(`\n📋 Testing: ${video.name}`);
    console.log(`🔗 URL: ${video.url}`);
    console.log(`💡 Reason: ${video.reason}`);
    
    try {
      const startTime = Date.now();
      const info = await youtube.getVideoInfo(video.url);
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      console.log(`✅ SUCCESS (${duration}s)`);
      console.log(`   Title: ${info.title}`);
      console.log(`   Author: ${info.author}`); 
      console.log(`   Duration: ${info.duration}s`);
      console.log(`   Available: ${info.available}`);
      
      infoSuccessCount++;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
    }
    
    // Wait between tests to avoid rate limiting
    console.log('⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n📊 Info Extraction Results: ${infoSuccessCount}/${testVideos.length} successful`);
  
  if (infoSuccessCount === 0) {
    console.log('\n❌ CRITICAL: All info extraction failed - stopping tests');
    return;
  }
  
  console.log(`\n\n🎯 PHASE 3B: Testing Audio Download with Anti-Detection\n`);
  
  // Test audio download with shortest video
  const shortVideo = testVideos[1]; // "Me at the zoo" - 19 seconds
  console.log(`🎵 Testing audio download: ${shortVideo.name}`);
  
  try {
    const audioPath = path.join(testDir, 'test-audio.mp3');
    
    // Clean up any existing file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    
    const startTime = Date.now();
    await youtube.downloadAudio(shortVideo.url, audioPath);
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    if (fs.existsSync(audioPath)) {
      const stats = fs.statSync(audioPath);
      console.log(`✅ AUDIO DOWNLOAD SUCCESS (${duration}s)`);
      console.log(`   File: ${audioPath}`);
      console.log(`   Size: ${Math.round(stats.size / 1024)} KB`);
      
      // Clean up
      fs.unlinkSync(audioPath);
    } else {
      console.log(`❌ Audio file not created`);
    }
  } catch (error) {
    console.log(`❌ AUDIO DOWNLOAD FAILED: ${error.message}`);
  }
  
  console.log(`\n\n🎯 PHASE 3C: Testing Video Download with Anti-Detection\n`);
  
  // Test video download with shortest video  
  console.log(`🎥 Testing video download: ${shortVideo.name}`);
  
  try {
    const videoPath = path.join(testDir, 'test-video.mp4');
    
    // Clean up any existing file
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    const startTime = Date.now();
    await youtube.downloadVideo(shortVideo.url, videoPath, 'best');
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`✅ VIDEO DOWNLOAD SUCCESS (${duration}s)`);
      console.log(`   File: ${videoPath}`);
      console.log(`   Size: ${Math.round(stats.size / 1024)} KB`);
      
      // Clean up
      fs.unlinkSync(videoPath);
    } else {
      console.log(`❌ Video file not created`);
    }
  } catch (error) {
    console.log(`❌ VIDEO DOWNLOAD FAILED: ${error.message}`);
  }
  
  console.log(`\n\n🎯 PHASE 3D: Strategy Performance Analysis\n`);
  
  // Check which strategy is currently preferred
  console.log(`🎯 Current preferred strategy index: ${youtube.lastWorkingStrategy}`);
  console.log(`📋 Strategy details:`);
  youtube.strategies.forEach((strategy, index) => {
    const marker = index === youtube.lastWorkingStrategy ? '👑' : '  ';
    console.log(`${marker} ${index}: ${strategy.name}`);
    console.log(`     Args: ${strategy.args.join(' ')}`);
  });
  
  console.log(`\n\n🎯 COMPREHENSIVE TEST RESULTS\n`);
  console.log('=' .repeat(50));
  
  if (infoSuccessCount === testVideos.length) {
    console.log('✅ ALL INFO EXTRACTIONS SUCCESSFUL');
  } else {
    console.log(`⚠️ Info extraction: ${infoSuccessCount}/${testVideos.length} successful`);
  }
  
  console.log('\n💡 KEY IMPROVEMENTS IMPLEMENTED:');
  console.log('✅ Multiple anti-detection strategies (4 total)');
  console.log('✅ Automatic fallback between strategies');  
  console.log('✅ Rate limiting delays (3-5s between attempts)');
  console.log('✅ Strategy preference learning');
  console.log('✅ Proper error handling and cleanup');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test with main application server');
  console.log('2. Validate full video processing pipeline');
  console.log('3. Test with more diverse video types');
  
  console.log('\n✅ Enhanced YouTube Helper testing completed!');
}

// Main function
async function main() {
  try {
    await testEnhancedYouTubeHelper();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEnhancedYouTubeHelper };