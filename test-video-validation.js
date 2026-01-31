const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Test script to validate that different YouTube URLs produce different videos
async function testVideoValidation() {
  console.log('🧪 Testing video validation...');
  
  // Sample YouTube URLs (replace with actual test URLs)
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example URL 1
    'https://www.youtube.com/watch?v=oHg5SJYRHA0', // Example URL 2
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n📹 Testing URL ${i + 1}: ${url}`);
    
    try {
      // Extract video ID
      const videoId = ytdl.getVideoID(url);
      console.log(`🔑 Video ID: ${videoId}`);
      
      // Get video info to verify title
      const info = await ytdl.getInfo(url);
      console.log(`📝 Title: ${info.videoDetails.title}`);
      console.log(`👤 Channel: ${info.videoDetails.author.name}`);
      console.log(`⏱️ Duration: ${info.videoDetails.lengthSeconds} seconds`);
      
      // Test download path (don't actually download, just show what would happen)
      const outputPath = path.join(__dirname, 'temp', `test-${videoId}-${Date.now()}.mp4`);
      console.log(`📁 Would download to: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }
}

// Test cache key generation
function testCacheKeys() {
  console.log('\n🗃️ Testing cache key generation...');
  
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    'https://youtu.be/dQw4w9WgXcQ', // Same video, different URL format
  ];
  
  testUrls.forEach((url, index) => {
    try {
      const videoId = ytdl.getVideoID(url);
      const audioCacheKey = `audio-${videoId}`;
      const videoCacheKey = `video-${videoId}`;
      const timestamp = Date.now();
      const uniqueKey = `${videoId}-${timestamp}`;
      
      console.log(`\nURL ${index + 1}: ${url}`);
      console.log(`  Video ID: ${videoId}`);
      console.log(`  Audio Cache Key: ${audioCacheKey}`);
      console.log(`  Video Cache Key: ${videoCacheKey}`);
      console.log(`  Unique Key: ${uniqueKey}`);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  });
}

// Test FFprobe to extract video metadata
async function testVideoMetadata(videoPath) {
  if (!fs.existsSync(videoPath)) {
    console.log('❌ Test video not found, skipping metadata test');
    return;
  }
  
  console.log('\n🔍 Testing video metadata extraction...');
  
  return new Promise((resolve) => {
    const ffprobeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    
    exec(ffprobeCmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ FFprobe error:', error.message);
        resolve();
        return;
      }
      
      try {
        const metadata = JSON.parse(stdout);
        console.log('📊 Video Metadata:');
        console.log(`  Duration: ${metadata.format.duration} seconds`);
        console.log(`  Size: ${metadata.format.size} bytes`);
        console.log(`  Bitrate: ${metadata.format.bit_rate}`);
        
        if (metadata.streams && metadata.streams[0]) {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          if (videoStream) {
            console.log(`  Resolution: ${videoStream.width}x${videoStream.height}`);
            console.log(`  FPS: ${videoStream.r_frame_rate}`);
          }
        }
      } catch (parseError) {
        console.error('❌ Error parsing metadata:', parseError.message);
      }
      
      resolve();
    });
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting video validation tests...\n');
  
  // Test 1: Video ID and info extraction
  await testVideoValidation();
  
  // Test 2: Cache key generation
  testCacheKeys();
  
  // Test 3: Look for existing video files to test metadata
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const videoFiles = files.filter(f => f.endsWith('.mp4'));
    
    if (videoFiles.length > 0) {
      const testVideoPath = path.join(uploadsDir, videoFiles[0]);
      await testVideoMetadata(testVideoPath);
    }
  }
  
  console.log('\n✅ Tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testVideoValidation,
  testCacheKeys,
  testVideoMetadata,
  runTests
};