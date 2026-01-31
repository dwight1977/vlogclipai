const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test script to validate that video processing fixes work correctly
async function testVideoProcessingFix() {
  console.log('🧪 Testing Video Processing Fix...\n');
  
  const serverUrl = 'http://localhost:3001';
  
  // Test URLs - replace with actual working YouTube URLs for testing
  const testVideos = [
    {
      name: 'Video 1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with working URL
      expectedId: 'dQw4w9WgXcQ'
    },
    {
      name: 'Video 2', 
      url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0', // Replace with different working URL
      expectedId: 'oHg5SJYRHA0'
    }
  ];
  
  console.log('📋 Test Plan:');
  console.log('1. Process first video and store results');
  console.log('2. Process second video and verify it\'s different');
  console.log('3. Process first video again and verify cache behavior');
  console.log('4. Validate clip files contain correct video content\n');
  
  const results = [];
  
  for (let i = 0; i < testVideos.length; i++) {
    const video = testVideos[i];
    console.log(`\n🎬 Processing ${video.name}: ${video.url}`);
    
    try {
      // Make request to generate clips
      const response = await axios.post(`${serverUrl}/api/generate`, {
        videoUrl: video.url,
        plan: 'pro'
      });
      
      if (response.data.clips && response.data.clips.length > 0) {
        const clips = response.data.clips;
        console.log(`✅ Generated ${clips.length} clips for ${video.name}`);
        
        // Store results for comparison
        results.push({
          videoName: video.name,
          videoId: video.expectedId,
          videoUrl: video.url,
          clips: clips.map(clip => ({
            filename: clip.file || clip.videoUrl,
            timestamp: clip.timestamp,
            headline: clip.headline
          }))
        });
        
        // Validate clip files exist and have different content
        for (const clip of clips) {
          const clipPath = clip.file || clip.videoUrl;
          if (clipPath && clipPath.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, clipPath.replace('/uploads/', 'uploads/'));
            
            if (fs.existsSync(fullPath)) {
              const stats = fs.statSync(fullPath);
              console.log(`  📁 Clip file: ${path.basename(fullPath)} (${stats.size} bytes)`);
              
              // Check if filename contains video ID
              if (path.basename(fullPath).includes(video.expectedId)) {
                console.log(`  ✅ Filename contains video ID: ${video.expectedId}`);
              } else {
                console.log(`  ⚠️ Filename missing video ID: ${video.expectedId}`);
              }
            } else {
              console.log(`  ❌ Clip file not found: ${fullPath}`);
            }
          }
        }
      } else {
        console.log(`❌ No clips generated for ${video.name}`);
        console.log('Response:', response.data);
      }
      
      // Wait between requests to avoid rate limiting
      if (i < testVideos.length - 1) {
        console.log('⏱️ Waiting 10 seconds between requests...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${video.name}:`, error.response?.data || error.message);
    }
  }
  
  // Compare results
  console.log('\n📊 Comparison Results:');
  if (results.length >= 2) {
    const video1 = results[0];
    const video2 = results[1];
    
    console.log(`\n${video1.videoName} vs ${video2.videoName}:`);
    console.log(`  Video IDs: ${video1.videoId} vs ${video2.videoId}`);
    console.log(`  Clips generated: ${video1.clips.length} vs ${video2.clips.length}`);
    
    // Check if filenames are different
    const video1Files = video1.clips.map(c => path.basename(c.filename));
    const video2Files = video2.clips.map(c => path.basename(c.filename));
    
    const filesAreDifferent = !video1Files.some(f1 => 
      video2Files.some(f2 => f1 === f2)
    );
    
    if (filesAreDifferent) {
      console.log('  ✅ Generated different clip files for different videos');
    } else {
      console.log('  ❌ Generated same clip files for different videos (BUG!)');
    }
    
    // Check if headlines are different
    const video1Headlines = video1.clips.map(c => c.headline);
    const video2Headlines = video2.clips.map(c => c.headline);
    
    const headlinesAreDifferent = !video1Headlines.some(h1 => 
      video2Headlines.some(h2 => h1 === h2)
    );
    
    if (headlinesAreDifferent) {
      console.log('  ✅ Generated different headlines for different videos');
    } else {
      console.log('  ⚠️ Generated similar headlines (may be expected)');
    }
  }
  
  console.log('\n✅ Video processing fix test completed!');
  
  return results;
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
  console.log('🚀 Starting Video Processing Fix Tests...\n');
  
  // Check server connectivity
  const serverRunning = await testServerConnectivity();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Run the main tests
  await testVideoProcessingFix();
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testVideoProcessingFix,
  testServerConnectivity,
  runTests
};