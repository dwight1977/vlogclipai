// Test Portrait Mode Conversion
const YouTubeHelper = require('./youtube-helper-new');

async function testPortraitConversion() {
  console.log('🧪 TESTING PORTRAIT MODE CONVERSION...\n');
  
  const youtube = new YouTubeHelper();
  
  // Test video URL (short video for faster testing)
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll (short)
  const outputPath = './test-portrait-video.mp4';
  
  try {
    console.log('1. Testing portrait mode download...');
    
    // Download with portrait mode enabled
    const result = await youtube.downloadVideo(testUrl, outputPath, 'worst', true);
    
    console.log(`✅ Video downloaded: ${result}`);
    
    // Check if file exists and get dimensions
    const fs = require('fs');
    if (fs.existsSync(outputPath)) {
      const { exec } = require('child_process');
      
      // Use FFprobe to check video dimensions
      const probeCmd = `ffprobe -v quiet -print_format json -show_streams "${outputPath}"`;
      
      exec(probeCmd, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Failed to check video dimensions:', error.message);
          return;
        }
        
        try {
          const data = JSON.parse(stdout);
          const videoStream = data.streams.find(s => s.codec_type === 'video');
          
          if (videoStream) {
            const width = videoStream.width;
            const height = videoStream.height;
            const aspectRatio = width / height;
            
            console.log(`📐 Video dimensions: ${width}x${height}`);
            console.log(`📊 Aspect ratio: ${aspectRatio.toFixed(3)} (should be ~0.562 for 9:16)`);
            
            if (width === 1080 && height === 1920) {
              console.log('✅ PERFECT: Video is exactly 1080x1920 (portrait 9:16)');
            } else if (Math.abs(aspectRatio - (9/16)) < 0.1) {
              console.log('✅ GOOD: Video is in portrait format (close to 9:16)');
            } else {
              console.log('❌ ISSUE: Video is not in portrait format');
            }
          }
        } catch (parseError) {
          console.error('❌ Failed to parse video info:', parseError.message);
        }
        
        // Clean up test file
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log('🧹 Cleaned up test file');
          }
        }, 5000);
      });
    } else {
      console.log('❌ Video file was not created');
    }
    
  } catch (error) {
    console.error('❌ Portrait conversion test failed:', error.message);
  }
}

// Run the test
testPortraitConversion().catch(console.error);