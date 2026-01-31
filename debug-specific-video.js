const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Debug the specific video from the screenshot
async function debugSpecificVideo() {
  const videoUrl = 'https://www.youtube.com/watch?v=ceeyrlbourc&t=506s';
  
  console.log('🔍 Debugging video from screenshot:', videoUrl);
  
  try {
    // Step 1: Validate URL
    console.log('\n📋 Step 1: URL Validation');
    const isValidUrl = ytdl.validateURL(videoUrl);
    console.log(`  Valid URL: ${isValidUrl}`);
    
    if (!isValidUrl) {
      console.log('❌ URL validation failed - this is the problem!');
      return;
    }
    
    // Step 2: Extract video ID
    console.log('\n🔑 Step 2: Video ID Extraction');
    const videoId = ytdl.getVideoID(videoUrl);
    console.log(`  Video ID: ${videoId}`);
    
    // Step 3: Try to get video info
    console.log('\n📊 Step 3: Video Info Retrieval');
    try {
      const info = await ytdl.getInfo(videoUrl);
      console.log(`  Title: ${info.videoDetails.title}`);
      console.log(`  Channel: ${info.videoDetails.author.name}`);
      console.log(`  Duration: ${info.videoDetails.lengthSeconds} seconds`);
      console.log(`  Available: ${info.videoDetails.isLiveContent ? 'Live' : 'Regular'}`);
      console.log(`  Private: ${info.videoDetails.isPrivate}`);
    } catch (infoError) {
      console.log(`❌ Failed to get video info: ${infoError.message}`);
      console.log('This might be why the video is showing as unavailable!');
    }
    
    // Step 4: Test yt-dlp download capability
    console.log('\n📥 Step 4: Testing yt-dlp Download');
    const ytDlpPath = '/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp';
    
    // Test if yt-dlp can get info
    const infoCmd = `"${ytDlpPath}" --dump-json "${videoUrl}"`;
    
    try {
      await new Promise((resolve, reject) => {
        exec(infoCmd, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            console.log(`❌ yt-dlp info failed: ${error.message}`);
            reject(error);
          } else {
            try {
              const metadata = JSON.parse(stdout);
              console.log(`  yt-dlp Title: ${metadata.title}`);
              console.log(`  yt-dlp Duration: ${metadata.duration} seconds`);
              console.log(`  yt-dlp Available: ${metadata.availability || 'unknown'}`);
              resolve();
            } catch (parseError) {
              console.log(`❌ yt-dlp JSON parse error: ${parseError.message}`);
              reject(parseError);
            }
          }
        });
      });
      
      console.log('✅ yt-dlp can access this video');
    } catch (ytDlpError) {
      console.log('❌ yt-dlp cannot access this video - this explains the issue!');
      console.log('Error details:', ytDlpError.message);
    }
    
    // Step 5: Test different strategies
    console.log('\n🔄 Step 5: Testing Download Strategies');
    
    const strategies = [
      `"${ytDlpPath}" --extractor-args "youtube:player_client=tv_embed" --dump-json "${videoUrl}"`,
      `"${ytDlpPath}" --extractor-args "youtube:player_client=mweb" --dump-json "${videoUrl}"`,
      `"${ytDlpPath}" --extractor-args "youtube:player_client=android" --dump-json "${videoUrl}"`
    ];
    
    for (let i = 0; i < strategies.length; i++) {
      console.log(`\n  Testing strategy ${i + 1}:`);
      try {
        await new Promise((resolve, reject) => {
          exec(strategies[i], { timeout: 20000 }, (error, stdout, stderr) => {
            if (error) {
              console.log(`    ❌ Strategy ${i + 1} failed: ${error.message}`);
              reject(error);
            } else {
              console.log(`    ✅ Strategy ${i + 1} succeeded`);
              resolve();
            }
          });
        });
      } catch (error) {
        // Already logged above
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
  
  console.log('\n🏁 Debug completed!');
}

// Run the debug
if (require.main === module) {
  debugSpecificVideo().catch(console.error);
}

module.exports = { debugSpecificVideo };