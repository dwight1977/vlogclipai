// Test new 1080x1350 (4:5) aspect ratio
async function test1350Dimensions() {
  console.log('🧪 Testing new 1080x1350 dimensions...\n');
  
  try {
    console.log('1. Processing a test video with new 1080x1350 dimensions...');
    
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        customDuration: 15,
        plan: 'pro',
        portraitMode: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Video processing completed');
    
    if (data.clips && data.clips.length > 0) {
      const testClip = data.clips[0];
      const clipFilename = testClip.videoUrl.split('/').pop();
      
      console.log(`📁 Generated clip: ${clipFilename}`);
      
      // Check the aspect ratio of the new clip
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execPromise = promisify(exec);
      
      const probeCmd = `ffprobe -v quiet -print_format json -show_streams uploads/${clipFilename}`;
      const result = await execPromise(probeCmd);
      const streams = JSON.parse(result.stdout);
      const videoStream = streams.streams.find(s => s.codec_type === 'video');
      
      if (videoStream) {
        console.log('📐 New clip dimensions:', {
          width: videoStream.width,
          height: videoStream.height,
          displayAspectRatio: videoStream.display_aspect_ratio,
          sampleAspectRatio: videoStream.sample_aspect_ratio
        });
        
        if (videoStream.width === 1080 && videoStream.height === 1350) {
          console.log('✅ SUCCESS: Dimensions are correct (1080x1350)!');
        } else {
          console.log('❌ WRONG: Expected 1080x1350, got', videoStream.width + 'x' + videoStream.height);
        }
        
        if (videoStream.display_aspect_ratio === '4:5') {
          console.log('✅ SUCCESS: Display aspect ratio is correct (4:5)!');
        } else {
          console.log('❌ STILL WRONG: Display aspect ratio is', videoStream.display_aspect_ratio);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if this is the main module
if (require.main === module) {
  test1350Dimensions();
}

module.exports = test1350Dimensions;