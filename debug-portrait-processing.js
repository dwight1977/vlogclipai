// A-TEAM DEBUG: Test actual portrait processing workflow
const YouTubeHelper = require('./youtube-helper-new');

async function debugPortraitProcessing() {
  console.log('🔍 A-TEAM DEBUG: Testing portrait processing workflow...\n');
  
  const youtube = new YouTubeHelper();
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const outputPath = './debug-portrait-test.mp4';
  
  try {
    console.log('1. Testing download with portraitMode: true');
    console.log(`   URL: ${testUrl}`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Portrait Mode: TRUE\n`);
    
    // Download with portrait mode
    await youtube.downloadVideo(testUrl, outputPath, 'worst', true);
    
    console.log('2. Checking if file was created...');
    const fs = require('fs');
    if (fs.existsSync(outputPath)) {
      console.log('✅ File created successfully');
      
      // Check dimensions
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execPromise = promisify(exec);
      
      try {
        const result = await execPromise(`ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${outputPath}"`);
        const [width, height] = result.stdout.trim().split(',').map(Number);
        
        console.log(`📐 Video dimensions: ${width}x${height}`);
        
        if (width === 1080 && height === 1920) {
          console.log('✅ SUCCESS: Video is 1080x1920 (portrait)');
        } else {
          console.log('❌ FAILURE: Video is not portrait format');
          console.log(`   Expected: 1080x1920`);
          console.log(`   Got: ${width}x${height}`);
        }
        
        // Check aspect ratio
        const aspectRatio = width / height;
        const targetRatio = 9 / 16; // 0.5625
        console.log(`📊 Aspect ratio: ${aspectRatio.toFixed(4)} (target: ${targetRatio.toFixed(4)})`);
        
      } catch (probeError) {
        console.error('❌ Failed to check video dimensions:', probeError.message);
      }
      
      // Clean up
      setTimeout(() => {
        fs.unlinkSync(outputPath);
        console.log('🧹 Cleaned up test file');
      }, 2000);
      
    } else {
      console.log('❌ File was not created');
    }
    
  } catch (error) {
    console.error('❌ Portrait processing test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

debugPortraitProcessing().catch(console.error);