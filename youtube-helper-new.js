const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const rateLimitRecovery = require('./rate-limit-recovery');
const EnhancedProxySystem = require('./enhanced-proxy-system');

// New YouTube helper that uses yt-dlp exclusively
class YouTubeHelper {
  constructor() {
    this.ytDlpPath = '/usr/local/bin/yt-dlp';
    this.proxySystem = new EnhancedProxySystem();
    
    // DR. ALEX: Optimized strategies - Android client is most reliable
    this.strategies = [
      {
        name: 'cat_android_primary',
        args: ['--dump-json', '--no-warnings', '--user-agent', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36', '--extractor-args', 'youtube:player_client=android'],
        delay: 3000 // Fast and reliable
      },
      {
        name: 'cat_ios_backup',
        args: ['--dump-json', '--no-warnings', '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15', '--extractor-args', 'youtube:player_client=ios'],
        delay: 5000
      },
      {
        name: 'cat_mobile_web',
        args: ['--dump-json', '--no-warnings', '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', '--extractor-args', 'youtube:player_client=mweb'],
        delay: 10000
      },
      {
        name: 'cat_tv_embedded',
        args: ['--dump-json', '--no-warnings', '--extractor-args', 'youtube:player_client=tv_embed'],
        delay: 15000
      }
    ];
    
    this.lastWorkingStrategy = 0; // Start with conservative strategy
    this.isRecoveryMode = false;
    this.lastError = null; // Track last error for better reporting
  }

  // Extract video ID from URL (simple regex, more reliable than ytdl-core)
  getVideoID(url) {
    try {
      const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  // Validate YouTube URL (simple check)
  validateURL(url) {
    return this.getVideoID(url) !== null;  
  }

  // Get video info using yt-dlp with fallback strategies
  async getVideoInfo(url) {
    console.log(`🔍 Getting video info for: ${url}`);
    
    // Check rate limiting status
    const recoveryStatus = rateLimitRecovery.getStatus();
    if (recoveryStatus.isInCooldown) {
      const delayMinutes = Math.round(recoveryStatus.recommendedDelay / 60000);
      console.log(`⚠️ Rate limit cooldown active. Recommended delay: ${delayMinutes} minutes`);
      console.log(`🔄 Attempting with extended delays between strategies...`);
    }
    
    // Try each strategy until one works
    for (let i = 0; i < this.strategies.length; i++) {
      const strategyIndex = (this.lastWorkingStrategy + i) % this.strategies.length;
      const strategy = this.strategies[strategyIndex];
      
      console.log(`  Trying strategy: ${strategy.name}`);
      
      try {
        const info = await this._getVideoInfoWithStrategy(url, strategy);
        console.log(`  ✅ Success with strategy: ${strategy.name}`);
        this.lastWorkingStrategy = strategyIndex; // Remember working strategy
        rateLimitRecovery.reset(); // Reset rate limit counter on success
        return info;
      } catch (error) {
        console.log(`  ❌ Strategy ${strategy.name} failed: ${error.message}`);
        
        // SARAH: Track last error for better reporting
        this.lastError = error.message;
        
        // Check for rate limiting
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          rateLimitRecovery.recordRateLimit();
          console.log(`  🚨 Rate limit detected with strategy: ${strategy.name}`);
        }
        
        // Add delay between strategies - longer if in recovery mode
        if (i < this.strategies.length - 1) {
          const baseDelay = recoveryStatus.isInCooldown ? 10000 : 3000;
          const delay = baseDelay + (i * 2000); // Progressive increase
          console.log(`  ⏳ Waiting ${delay/1000} seconds before trying next strategy...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // SARAH: Provide more specific error message based on the most common error
    const lastErrorMsg = this.lastError?.toLowerCase() || '';
    if (lastErrorMsg.includes('video is unavailable') || lastErrorMsg.includes('unavailable')) {
      throw new Error('This video is unavailable (may be private, deleted, or region-restricted)');
    } else if (lastErrorMsg.includes('age-restricted')) {
      throw new Error('This video is age-restricted and cannot be processed');
    } else if (lastErrorMsg.includes('rate limit') || lastErrorMsg.includes('429')) {
      throw new Error('YouTube rate limiting detected - please try again in a few minutes');
    } else {
      throw new Error('All video download strategies failed - video may be unavailable or restricted');
    }
  }
  
  // Helper method to get video info with specific strategy
  async _getVideoInfoWithStrategy(url, strategy) {
    // CAT: Skip proxy for now - iOS client works without it
    const args = [...strategy.args, url];
    const cmd = `"${this.ytDlpPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
    
    console.log(`    🐱 CAT: Using iOS client bypass (${strategy.name})`);
    
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: 45000 }, (error, stdout, stderr) => {
        if (error) {
          // Check for rate limiting or proxy errors
          if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            reject(new Error(`Rate limited: ${error.message}`));
          } else if (error.message.includes('proxy') || error.message.includes('ECONNREFUSED')) {
            reject(new Error(`Proxy error: ${error.message}`));
          } else {
            reject(new Error(`Failed to get video info: ${error.message}`));
          }
          return;
        }
        
        try {
          const info = JSON.parse(stdout);
          
          // Update proxy system stats on success
          this.proxySystem.sessionStats.successfulRequests++;
          
          resolve({
            id: info.id,
            title: info.title,
            author: info.uploader || info.channel || 'Unknown',
            duration: info.duration,
            available: info.availability === 'public' || !info.availability
          });
        } catch (parseError) {
          reject(new Error(`Failed to parse video info: ${parseError.message}`));
        }
      });
    });
  }

  // Download audio using yt-dlp with fallback strategies
  async downloadAudio(url, outputPath) {
    const videoId = this.getVideoID(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log(`🎵 Downloading audio for video: ${videoId}`);
    
    // Try each strategy until one works
    for (let i = 0; i < this.strategies.length; i++) {
      const strategyIndex = (this.lastWorkingStrategy + i) % this.strategies.length;
      const strategy = this.strategies[strategyIndex];
      
      console.log(`  Trying audio download with strategy: ${strategy.name}`);
      
      try {
        await this._downloadAudioWithStrategy(url, outputPath, strategy);
        console.log(`  ✅ Audio download success with strategy: ${strategy.name}`);
        this.lastWorkingStrategy = strategyIndex; // Remember working strategy
        return outputPath;
      } catch (error) {
        console.log(`  ❌ Audio strategy ${strategy.name} failed: ${error.message}`);
        
        // Clean up partial files
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        
        // Add delay between strategies
        if (i < this.strategies.length - 1) {
          console.log(`  ⏳ Waiting 5 seconds before trying next strategy...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    throw new Error('All audio download strategies failed');
  }
  
  // Helper method to download audio with specific strategy
  async _downloadAudioWithStrategy(url, outputPath, strategy) {
    // Build command with strategy-specific args
    const baseArgs = ['--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0', '-o', outputPath];
    
    // Add strategy-specific args (excluding --dump-json which is for info only)
    const strategyArgs = strategy.args.filter(arg => arg !== '--dump-json' && arg !== '--no-warnings');
    
    // CAT: Use iOS client bypass without proxy
    const allArgs = [...baseArgs, ...strategyArgs, url];
    
    const cmd = `"${this.ytDlpPath}" ${allArgs.map(arg => `"${arg}"`).join(' ')}`;
    
    console.log(`    🐱 CAT: Audio download using iOS client bypass`);
    
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: 180000 }, (error, stdout, stderr) => {
        if (error) {
          // Update proxy system stats on failure
          this.proxySystem.sessionStats.failedRequests++;
          
          if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            reject(new Error(`Rate limited during audio download: ${error.message}`));
          } else {
            reject(new Error(`Audio download failed: ${error.message}`));
          }
          return;
        }
        
        // Check if file was created
        if (fs.existsSync(outputPath)) {
          console.log(`✅ Audio downloaded with enhanced proxy: ${outputPath}`);
          this.proxySystem.sessionStats.successfulRequests++;
          resolve(outputPath);
        } else {
          reject(new Error('Audio file was not created'));
        }
      });
    });
  }

  // Download video using yt-dlp with fallback strategies
  async downloadVideo(url, outputPath, quality = 'best', portraitMode = false) {
    const videoId = this.getVideoID(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log(`🎥 Downloading video for: ${videoId}`);
    
    // Try each strategy until one works
    for (let i = 0; i < this.strategies.length; i++) {
      const strategyIndex = (this.lastWorkingStrategy + i) % this.strategies.length;
      const strategy = this.strategies[strategyIndex];
      
      console.log(`  Trying video download with strategy: ${strategy.name}`);
      
      try {
        await this._downloadVideoWithStrategy(url, outputPath, quality, strategy, portraitMode);
        console.log(`  ✅ Video download success with strategy: ${strategy.name}`);
        this.lastWorkingStrategy = strategyIndex; // Remember working strategy
        return outputPath;
      } catch (error) {
        console.log(`  ❌ Video strategy ${strategy.name} failed: ${error.message}`);
        
        // Clean up partial files
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        
        // Add delay between strategies
        if (i < this.strategies.length - 1) {
          console.log(`  ⏳ Waiting 5 seconds before trying next strategy...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    throw new Error('All video download strategies failed');
  }
  
  // Helper method to download video with specific strategy
  async _downloadVideoWithStrategy(url, outputPath, quality, strategy, portraitMode = false) {
    // EMMA: Enhanced format selection with portrait mode support
    let qualityFormat;
    
    // EMMA: Ultra-simple format selection - no complex restrictions
    if (quality === 'best') {
      qualityFormat = 'best[ext=mp4]/best';  // Simple: just get best MP4 or any best
    } else {
      qualityFormat = 'worst[ext=mp4]/worst';  // Simple: just get worst MP4 or any worst
    }
    
    const baseArgs = ['-f', qualityFormat, '-o', outputPath];
    
    // Add strategy-specific args (excluding --dump-json which is for info only)
    const strategyArgs = strategy.args.filter(arg => arg !== '--dump-json' && arg !== '--no-warnings');
    
    // CAT: Use iOS client bypass without proxy
    const allArgs = [...baseArgs, ...strategyArgs, url];
    
    const cmd = `"${this.ytDlpPath}" ${allArgs.map(arg => `"${arg}"`).join(' ')}`;
    
    console.log(`    🐱 CAT: Video download using iOS client bypass`);
    
    return new Promise((resolve, reject) => {
      exec(cmd, { timeout: 300000 }, (error, stdout, stderr) => {
        if (error) {
          // Update proxy system stats on failure
          this.proxySystem.sessionStats.failedRequests++;
          
          if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            reject(new Error(`Rate limited during video download: ${error.message}`));
          } else {
            reject(new Error(`Video download failed: ${error.message}`));
          }
          return;
        }
        
        // Check if file was created
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          console.log(`✅ Video downloaded with enhanced proxy: ${outputPath} (${stats.size} bytes)`);
          this.proxySystem.sessionStats.successfulRequests++;
          
          // PORTRAIT MODE CONVERSION: Convert to 1080x1920 if portraitMode is enabled
          if (portraitMode) {
            console.log(`🔄 Converting to portrait format (1080x1920)...`);
            this._convertToPortraitFormat(outputPath)
              .then(() => {
                console.log(`✅ Portrait conversion completed: ${outputPath}`);
                resolve(outputPath);
              })
              .catch((conversionError) => {
                console.error(`❌ A-TEAM: All portrait conversion strategies failed: ${conversionError.message}`);
                console.log(`🔄 A-TEAM: Implementing emergency fallback - basic upscale to prevent low-res output`);
                
                // Emergency fallback: Basic upscale to ensure minimum quality
                const emergencyCmd = `ffmpeg -i "${outputPath}" -vf "scale=1080:1920" -c:v libx264 -preset ultrafast -crf 28 -c:a copy -y "${outputPath.replace('.mp4', '_emergency.mp4')}"`;
                
                exec(emergencyCmd, { timeout: 60000 }, (emerError, stdout, stderr) => {
                  if (emerError) {
                    console.error(`❌ A-TEAM: Emergency fallback also failed: ${emerError.message}`);
                    // As absolute last resort, reject instead of using low-res video
                    reject(new Error(`Complete portrait conversion failure: ${conversionError.message}`));
                  } else {
                    try {
                      const emergencyPath = outputPath.replace('.mp4', '_emergency.mp4');
                      if (fs.existsSync(emergencyPath)) {
                        fs.unlinkSync(outputPath);
                        fs.renameSync(emergencyPath, outputPath);
                        console.log(`✅ A-TEAM: Emergency fallback successful - basic 1080x1920 applied`);
                        resolve(outputPath);
                      } else {
                        reject(new Error(`Emergency conversion file not created`));
                      }
                    } catch (fileError) {
                      reject(new Error(`Emergency file operations failed: ${fileError.message}`));
                    }
                  }
                });
              });
          } else {
            resolve(outputPath);
          }
        } else {
          reject(new Error('Video file was not created'));
        }
      });
    });
  }

  // Convert video to portrait format (1080x1920 / 9:16 aspect ratio)
  async _convertToPortraitFormat(videoPath) {
    // A-TEAM: Multi-tier portrait conversion with robust fallback strategies
    const tempPath = videoPath.replace('.mp4', '_temp.mp4');
    
    const conversionStrategies = [
      {
        name: 'High Quality with Crop',
        cmd: `ffmpeg -i "${videoPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1:1" -c:v libx264 -preset ultrafast -crf 18 -c:a aac -b:a 192k -aspect 9:16 -profile:v high -level 4.0 -pix_fmt yuv420p -y "${tempPath}"`
      },
      {
        name: 'Medium Quality Crop',
        cmd: `ffmpeg -i "${videoPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1:1" -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 128k -aspect 9:16 -pix_fmt yuv420p -y "${tempPath}"`
      },
      {
        name: 'Fast Quality Crop',
        cmd: `ffmpeg -i "${videoPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1:1" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -aspect 9:16 -pix_fmt yuv420p -y "${tempPath}"`
      },
      {
        name: 'Lanczos Quality Crop',
        cmd: `ffmpeg -i "${videoPath}" -vf "scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1:1" -c:v libx264 -preset medium -crf 21 -c:a aac -b:a 128k -aspect 9:16 -pix_fmt yuv420p -y "${tempPath}"`
      }
    ];
    
    for (let i = 0; i < conversionStrategies.length; i++) {
      const strategy = conversionStrategies[i];
      console.log(`    🎬 A-TEAM: Trying conversion strategy ${i + 1}/4: ${strategy.name}`);
      console.log(`    🔧 FFmpeg command: ${strategy.cmd}`);
      
      try {
        await new Promise((resolve, reject) => {
          exec(strategy.cmd, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
              console.log(`    ❌ Strategy ${i + 1} failed: ${error.message}`);
              // Clean up temp file if it exists
              if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
              }
              reject(error);
              return;
            }
            
            // Check if converted file was created and has reasonable size
            if (fs.existsSync(tempPath)) {
              const stats = fs.statSync(tempPath);
              if (stats.size > 1000) { // At least 1KB
                console.log(`    ✅ Strategy ${i + 1} SUCCESS: ${strategy.name} (${stats.size} bytes)`);
                resolve();
              } else {
                reject(new Error('Output file too small'));
              }
            } else {
              reject(new Error('Converted video file was not created'));
            }
          });
        });
        
        // If we get here, the conversion was successful
        try {
          fs.unlinkSync(videoPath); // Remove original
          fs.renameSync(tempPath, videoPath); // Rename temp to original
          console.log(`✅ A-TEAM: Portrait conversion successful using ${strategy.name}: 1080x1920 format applied`);
          return videoPath;
        } catch (fileError) {
          throw new Error(`File replacement failed: ${fileError.message}`);
        }
        
      } catch (error) {
        console.log(`    ⏭️ A-TEAM: Strategy ${i + 1} failed, trying next...`);
        continue;
      }
    }
    
    // If all strategies failed, throw error
    throw new Error('All portrait conversion strategies failed');
  }

  // Get proxy system statistics
  getProxyStats() {
    return this.proxySystem.getStats();
  }

  // Reset proxy system statistics
  resetProxyStats() {
    this.proxySystem.resetStats();
  }

  // Test if a video is accessible
  async testVideo(url) {
    try {
      const info = await this.getVideoInfo(url);
      return {
        accessible: true,
        info: info
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
  }
}

module.exports = YouTubeHelper;