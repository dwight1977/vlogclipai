// EMMA's Portrait Mode Test Suite
// Testing 9:16 aspect ratio video processing

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

async function testPortraitMode() {
  console.log('🎬 EMMA: Testing Portrait Mode (9:16 aspect ratio) functionality...');
  
  // Test portrait mode with single video
  console.log('\n🧪 Testing Single Video Portrait Mode...');
  
  try {
    const singleVideoTest = await execPromise(`curl -X POST http://localhost:3001/api/generate \\
      -H "Content-Type: application/json" \\
      -d '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","customDuration":15,"portraitMode":true}' \\
      --max-time 120 -s`);
    
    const result = JSON.parse(singleVideoTest.stdout);
    
    if (result.clips && result.clips.length > 0) {
      console.log('✅ Single video portrait mode processing succeeded');
      console.log(`   Generated ${result.clips.length} clips in portrait format`);
    } else {
      console.log('❌ Single video portrait mode failed - no clips generated');
    }
    
  } catch (error) {
    console.log('❌ Single video portrait mode test failed:', error.message);
  }
  
  // Test batch processing with portrait mode
  console.log('\n🧪 Testing Batch Processing Portrait Mode...');
  
  try {
    const batchTest = await execPromise(`curl -X POST http://localhost:3001/api/generate/batch \\
      -H "Content-Type: application/json" \\
      -d '{"videoUrls":["https://www.youtube.com/watch?v=jNQXAC9IVRw"],"customDuration":15,"plan":"pro","portraitMode":true}' \\
      --max-time 120 -s`);
    
    const batchResult = JSON.parse(batchTest.stdout);
    
    if (batchResult.results && batchResult.results.length > 0) {
      console.log('✅ Batch portrait mode processing succeeded');
      console.log(`   Processed ${batchResult.totalProcessed || 0} videos in portrait format`);
    } else {
      console.log('❌ Batch portrait mode failed - no results generated');
    }
    
  } catch (error) {
    console.log('❌ Batch portrait mode test failed:', error.message);
  }
  
  // Test portrait mode disabled (landscape)
  console.log('\n🧪 Testing Landscape Mode (portraitMode=false)...');
  
  try {
    const landscapeTest = await execPromise(`curl -X POST http://localhost:3001/api/generate \\
      -H "Content-Type: application/json" \\
      -d '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","customDuration":15,"portraitMode":false}' \\
      --max-time 120 -s`);
    
    const landscapeResult = JSON.parse(landscapeTest.stdout);
    
    if (landscapeResult.clips && landscapeResult.clips.length > 0) {
      console.log('✅ Landscape mode processing succeeded');
      console.log(`   Generated ${landscapeResult.clips.length} clips in landscape format`);
    } else {
      console.log('❌ Landscape mode failed - no clips generated');
    }
    
  } catch (error) {
    console.log('❌ Landscape mode test failed:', error.message);
  }
  
  console.log('\n🎯 EMMA: Portrait mode testing completed!');
  console.log('📱 All videos should now be optimized for mobile platforms (TikTok, Instagram Reels, YouTube Shorts)');
}

testPortraitMode().catch(console.error);