// A-TEAM: Test what Chrome receives during download
const { exec } = require('child_process');

async function testChromeHeaders() {
  console.log('🔍 A-TEAM: Testing what Chrome receives during download...\n');
  
  const testUrl = 'http://localhost:3001/api/download/batch_clip_Tz9TEXsJasE_1753426693282_video1_segment_1.mp4';
  
  // Test with curl to see actual headers
  const curlCmd = `curl -I "${testUrl}"`;
  
  console.log('1. Testing headers Chrome receives:');
  console.log(`   Command: ${curlCmd}\n`);
  
  exec(curlCmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Header test failed:', error.message);
      return;
    }
    
    console.log('📡 Headers received:');
    console.log(stdout);
    
    // Now test actual download
    console.log('\n2. Testing actual file download:');
    const downloadCmd = `curl -s "${testUrl}" -o test_chrome_download.mp4`;
    
    exec(downloadCmd, (dlError, dlStdout, dlStderr) => {
      if (dlError) {
        console.error('❌ Download test failed:', dlError.message);
        return;
      }
      
      console.log('✅ Download completed, checking dimensions...');
      
      // Check dimensions of downloaded file
      const probeCmd = 'ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=p=0 test_chrome_download.mp4';
      
      exec(probeCmd, (probeError, probeStdout, probeStderr) => {
        if (probeError) {
          console.error('❌ Dimension check failed:', probeError.message);
          return;
        }
        
        const [width, height] = probeStdout.trim().split(',').map(Number);
        console.log(`📐 Downloaded file dimensions: ${width}x${height}`);
        
        if (width === 1080 && height === 1920) {
          console.log('✅ SUCCESS: File downloaded correctly');
        } else {
          console.log('❌ ISSUE: File dimensions are wrong');
          console.log(`   Expected: 1080x1920`);
          console.log(`   Got: ${width}x${height}`);
        }
        
        // Clean up
        exec('rm test_chrome_download.mp4', () => {
          console.log('🧹 Cleaned up test file');
        });
      });
    });
  });
}

testChromeHeaders();