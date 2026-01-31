const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the most basic YouTube functionality
async function testBasicYouTube() {
  console.log('🔍 Testing Basic YouTube Functionality\n');
  
  // Let's try some different recent, public YouTube videos
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Classic test video
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo - first YouTube video
    'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - Gangnam Style
  ];
  
  for (const url of testUrls) {
    console.log(`\n🎬 Testing URL: ${url}`);
    
    try {
      // Test 1: Basic ytdl-core validation
      console.log('  📋 Step 1: URL validation');
      const isValid = ytdl.validateURL(url);
      console.log(`    Valid: ${isValid}`);
      
      if (!isValid) {
        console.log('    ❌ URL validation failed');
        continue;
      }
      
      // Test 2: Video ID extraction
      console.log('  🔑 Step 2: Video ID extraction');
      const videoId = ytdl.getVideoID(url);
      console.log(`    Video ID: ${videoId}`);
      
      // Test 3: Basic info retrieval (this is where it often fails)
      console.log('  📊 Step 3: Video info retrieval');
      try {
        const info = await Promise.race([
          ytdl.getInfo(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        
        console.log(`    ✅ Title: ${info.videoDetails.title}`);
        console.log(`    📺 Channel: ${info.videoDetails.author.name}`);
        console.log(`    ⏱️ Duration: ${info.videoDetails.lengthSeconds}s`);
        console.log(`    🔒 Private: ${info.videoDetails.isPrivate}`);
        
        // Test 4: Check if we can get formats
        console.log('  🎥 Step 4: Available formats');
        const formats = info.formats.filter(f => f.hasVideo && f.hasAudio);
        console.log(`    Available video+audio formats: ${formats.length}`);
        
        if (formats.length > 0) {
          console.log(`    ✅ This video should be downloadable`);
          
          // Test 5: Try a tiny download to verify it works
          console.log('  📥 Step 5: Test download (first 1MB)');
          const testPath = path.join(__dirname, 'temp', `test-${videoId}.mp4`);
          
          // Create temp dir if needed
          if (!fs.existsSync(path.dirname(testPath))) {
            fs.mkdirSync(path.dirname(testPath), { recursive: true });
          }
          
          const stream = ytdl(url, { quality: 'lowest', filter: 'videoandaudio' });
          const writeStream = fs.createWriteStream(testPath);
          
          let downloaded = 0;
          const maxDownload = 1024 * 1024; // 1MB test
          
          stream.on('data', (chunk) => {
            downloaded += chunk.length;
            if (downloaded < maxDownload) {
              writeStream.write(chunk);
            } else {
              stream.destroy();
              writeStream.end();
              console.log(`    ✅ Successfully downloaded ${downloaded} bytes`);
              
              // Clean up test file
              setTimeout(() => {
                if (fs.existsSync(testPath)) {
                  fs.unlinkSync(testPath);
                }
              }, 1000);
            }
          });
          
          stream.on('error', (err) => {
            console.log(`    ❌ Download failed: ${err.message}`);
            writeStream.end();
          });
          
        } else {
          console.log(`    ❌ No downloadable formats available`);
        }
        
      } catch (infoError) {
        console.log(`    ❌ Info retrieval failed: ${infoError.message}`);
        
        // If ytdl-core fails, try yt-dlp
        console.log('  🔄 Trying yt-dlp as fallback...');
        const ytDlpPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp';
        const cmd = `"${ytDlpPath}" --dump-json --no-warnings "${url}"`;
        
        try {
          await new Promise((resolve, reject) => {
            exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
              if (error) {
                console.log(`    ❌ yt-dlp also failed: ${error.message}`);
                reject(error);
              } else {
                try {
                  const metadata = JSON.parse(stdout);
                  console.log(`    ✅ yt-dlp success: ${metadata.title}`);
                  resolve();
                } catch (parseError) {
                  console.log(`    ❌ yt-dlp JSON parse error`);
                  reject(parseError);
                }
              }
            });
          });
        } catch (ytDlpError) {
          console.log(`    ❌ Both ytdl-core and yt-dlp failed for this video`);
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Overall test failed: ${error.message}`);
    }
    
    console.log('  ' + '-'.repeat(50));
  }
  
  // Test what's currently in uploads directory
  console.log('\n📁 Current uploads directory:');
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const recentFiles = files
      .filter(f => f.endsWith('.mp4'))
      .map(f => {
        const stats = fs.statSync(path.join(uploadsDir, f));
        return { name: f, size: stats.size, modified: stats.mtime };
      })
      .sort((a, b) => b.modified - a.modified)
      .slice(0, 5);
    
    console.log('Recent video files:');
    recentFiles.forEach(file => {
      console.log(`  ${file.name} (${file.size} bytes, ${file.modified.toISOString()})`);
    });
  } else {
    console.log('  No uploads directory found');
  }
  
  console.log('\n✅ Basic YouTube test completed');
}

// Run test
if (require.main === module) {
  testBasicYouTube().catch(console.error);
}

module.exports = { testBasicYouTube };