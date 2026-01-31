const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test both YouTube APIs with fresh approach
async function testBothYouTubeAPIs() {
  console.log('🌅 Fresh Day Testing - YouTube APIs Status Check');
  console.log('=' * 60);
  console.log(`🕐 Current time: ${new Date().toISOString()}`);
  console.log('');

  // Test URLs - using different types of videos
  const testVideos = [
    {
      name: 'Rick Astley - Never Gonna Give You Up',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Classic test video - should always work'
    },
    {
      name: 'Me at the zoo (First YouTube video)',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 
      description: 'Historic YouTube video'
    },
    {
      name: 'Recent popular video',
      url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      description: 'Gangnam Style - popular video'
    },
    {
      name: 'Your original problematic URL',
      url: 'https://www.youtube.com/watch?v=ceeyrlbourc&t=506s',
      description: 'The URL from your screenshot'
    }
  ];

  console.log('📋 Testing Plan:');
  console.log('1. Test ytdl-core library');
  console.log('2. Test yt-dlp command line tool');
  console.log('3. Compare results');
  console.log('4. Determine which API is working\n');

  for (let i = 0; i < testVideos.length; i++) {
    const video = testVideos[i];
    console.log(`\n🎬 TEST ${i + 1}/4: ${video.name}`);
    console.log(`📍 URL: ${video.url}`);
    console.log(`📝 Description: ${video.description}`);
    console.log('-'.repeat(80));

    // TEST 1: ytdl-core
    console.log('\n🔧 TEST 1A: ytdl-core - URL Validation');
    try {
      const isValidUrl = ytdl.validateURL(video.url);
      const videoId = isValidUrl ? ytdl.getVideoID(video.url) : null;
      console.log(`  ✅ URL Valid: ${isValidUrl}`);
      console.log(`  🔑 Video ID: ${videoId}`);

      if (isValidUrl) {
        console.log('\n🔧 TEST 1B: ytdl-core - Video Info Retrieval');
        try {
          const info = await Promise.race([
            ytdl.getInfo(video.url),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout after 15 seconds')), 15000)
            )
          ]);

          console.log(`  ✅ SUCCESS: Got video info`);
          console.log(`  📺 Title: ${info.videoDetails.title}`);
          console.log(`  👤 Author: ${info.videoDetails.author.name}`);
          console.log(`  ⏱️ Duration: ${info.videoDetails.lengthSeconds}s`);
          console.log(`  🔒 Private: ${info.videoDetails.isPrivate}`);
          console.log(`  📊 Available formats: ${info.formats.length}`);

          // Check if we can get downloadable formats
          const videoFormats = info.formats.filter(f => f.hasVideo && f.hasAudio);
          console.log(`  🎥 Video+Audio formats: ${videoFormats.length}`);

          if (videoFormats.length > 0) {
            console.log(`  🎯 ytdl-core STATUS: FULLY WORKING ✅`);
          } else {
            console.log(`  ⚠️ ytdl-core STATUS: INFO ONLY (no downloadable formats)`);
          }

        } catch (infoError) {
          console.log(`  ❌ FAILED: ${infoError.message}`);
          console.log(`  🎯 ytdl-core STATUS: BROKEN ❌`);
        }
      } else {
        console.log(`  🎯 ytdl-core STATUS: INVALID URL ❌`);
      }
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
      console.log(`  🎯 ytdl-core STATUS: BROKEN ❌`);
    }

    // TEST 2: yt-dlp
    console.log('\n🔧 TEST 2: yt-dlp - Video Info & Download Test');
    const ytDlpPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp';
    
    try {
      // Check if yt-dlp exists
      await new Promise((resolve, reject) => {
        exec(`"${ytDlpPath}" --version`, (error, stdout) => {
          if (error) {
            reject(new Error('yt-dlp not found or not working'));
          } else {
            console.log(`  📦 yt-dlp version: ${stdout.trim()}`);
            resolve();
          }
        });
      });

      // Test video info retrieval
      const cmd = `"${ytDlpPath}" --dump-json --no-warnings "${video.url}"`;
      
      const metadata = await Promise.race([
        new Promise((resolve, reject) => {
          exec(cmd, { timeout: 20000 }, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`yt-dlp failed: ${error.message}`));
            } else {
              try {
                const info = JSON.parse(stdout);
                resolve(info);
              } catch (parseError) {
                reject(new Error(`JSON parse failed: ${parseError.message}`));
              }
            }
          });
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 20 seconds')), 20000)
        )
      ]);

      console.log(`  ✅ SUCCESS: Got video metadata`);
      console.log(`  📺 Title: ${metadata.title}`);
      console.log(`  👤 Uploader: ${metadata.uploader || metadata.channel}`);
      console.log(`  ⏱️ Duration: ${metadata.duration}s`);
      console.log(`  🌐 Availability: ${metadata.availability || 'unknown'}`);
      console.log(`  📊 Formats available: ${metadata.formats ? metadata.formats.length : 'unknown'}`);
      console.log(`  🎯 yt-dlp STATUS: FULLY WORKING ✅`);

    } catch (ytDlpError) {
      console.log(`  ❌ FAILED: ${ytDlpError.message}`);
      console.log(`  🎯 yt-dlp STATUS: BROKEN ❌`);
    }

    console.log('\n' + '='.repeat(80));
  }

  // Summary
  console.log('\n📊 FINAL SUMMARY - YouTube API Status Today:');
  console.log('=' * 50);
  console.log('Based on the tests above:');
  console.log('');
  console.log('🔍 Look for these patterns:');
  console.log('  ✅ FULLY WORKING = Can get info AND download');
  console.log('  ⚠️ PARTIALLY WORKING = Can get info but no download');  
  console.log('  ❌ BROKEN = Cannot get basic info');
  console.log('');
  console.log('💡 RECOMMENDATION:');
  console.log('  - If ytdl-core shows ✅ for most videos → Use ytdl-core');
  console.log('  - If yt-dlp shows ✅ for most videos → Use yt-dlp');
  console.log('  - If both show ❌ → YouTube may be blocking all requests');
  console.log('  - If your original URL fails but others work → That specific video is unavailable');
}

// Test actual download capability (small test)
async function testActualDownload() {
  console.log('\n🎯 BONUS TEST: Actual Download Capability');
  console.log('Testing small download to verify APIs can actually fetch video data...\n');

  const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'; // Short video
  const tempDir = path.join(__dirname, 'temp');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Test ytdl-core download
  console.log('🔧 Testing ytdl-core download...');
  try {
    const testPath = path.join(tempDir, 'test-ytdl-core.mp4');
    const stream = ytdl(testUrl, { quality: 'lowest', filter: 'videoandaudio' });
    const writeStream = fs.createWriteStream(testPath);
    
    let downloaded = 0;
    const maxDownload = 500000; // 500KB test

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        stream.destroy();
        writeStream.destroy();
        reject(new Error('Download timeout'));
      }, 15000);

      stream.on('data', (chunk) => {
        downloaded += chunk.length;
        if (downloaded >= maxDownload) {
          stream.destroy();
          writeStream.end();
          clearTimeout(timeout);
          resolve();
        } else {
          writeStream.write(chunk);
        }
      });

      stream.on('error', (err) => {
        clearTimeout(timeout);
        writeStream.destroy();
        reject(err);
      });
    });

    console.log(`  ✅ ytdl-core download test: SUCCESS (${downloaded} bytes)`);
    
    // Cleanup
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }

  } catch (error) {
    console.log(`  ❌ ytdl-core download test: FAILED (${error.message})`);
  }

  // Test yt-dlp download
  console.log('\n🔧 Testing yt-dlp download...');
  try {
    const testPath = path.join(tempDir, 'test-yt-dlp.mp3');
    const ytDlpPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp';
    const cmd = `"${ytDlpPath}" --extract-audio --audio-format mp3 --audio-quality 9 -o "${testPath}" "${testUrl}"`;

    await new Promise((resolve, reject) => {
      exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    if (fs.existsSync(testPath)) {
      const stats = fs.statSync(testPath);
      console.log(`  ✅ yt-dlp download test: SUCCESS (${stats.size} bytes)`);
      
      // Cleanup
      fs.unlinkSync(testPath);
    } else {
      console.log(`  ❌ yt-dlp download test: FAILED (file not created)`);
    }

  } catch (error) {
    console.log(`  ❌ yt-dlp download test: FAILED (${error.message})`);
  }
}

// Main function
async function main() {
  console.log('🚀 YouTube API Fresh Day Testing\n');
  
  await testBothYouTubeAPIs();
  await testActualDownload();
  
  console.log('\n✅ Testing Complete!');
  console.log('\n🎯 Next Steps:');
  console.log('1. Review the results above');
  console.log('2. Identify which API is working today');
  console.log('3. Update the main application to use the working API');
  console.log('4. Re-test video processing with working videos');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBothYouTubeAPIs, testActualDownload };