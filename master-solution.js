const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const youtubedl = require('youtube-dl-exec');

// Create directories
const uploadDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');

for (const dir of [uploadDir, tempDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

// Progress tracking
let progress = {
  status: 'idle',
  step: '',
  progress: 0,
  message: ''
};

const updateProgress = (status, step, progressValue, message) => {
  progress = {
    status,
    step,
    progress: progressValue,
    message
  };
  console.log(`Progress: ${step} - ${progressValue}% - ${message}`);
};

// Progress endpoint
app.get('/api/progress', (req, res) => {
  res.json(progress);
});

// Get video ID from YouTube URL
const getVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Download YouTube video using youtube-dl-exec
const downloadYouTubeVideo = async (videoUrl, outputPath) => {
  try {
    updateProgress('processing', 'downloading', 10, 'Starting YouTube download...');
    
    const videoId = getVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    updateProgress('processing', 'downloading', 20, 'Getting video info...');
    
    // Get info first
    const info = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true
    });
    
    const title = info.title;
    updateProgress('processing', 'downloading', 30, `Downloading "${title}"...`);
    
    // Download the video
    await youtubedl(videoUrl, {
      output: outputPath,
      format: 'best[ext=mp4]/best',  // Prefer MP4 format
      noWarnings: true,
      noCallHome: true
    });
    
    updateProgress('processing', 'downloading', 90, 'Download complete!');
    return { path: outputPath, title };
  } catch (error) {
    console.error('YouTube download error:', error);
    throw new Error(`YouTube download failed: ${error.message}`);
  }
};

// Cut video segment using FFmpeg
const cutVideoSegment = async (inputPath, outputPath, startTime, duration) => {
  return new Promise((resolve, reject) => {
    updateProgress('processing', 'cutting', 91, `Cutting video segment (${duration}s from ${startTime}s)...`);
    
    const cmd = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Error cutting video:', error);
        reject(error);
        return;
      }
      
      resolve(outputPath);
    });
  });
};

// Create a fallback colored video (if everything else fails)
const createFallbackVideo = async (outputPath, color = 'blue') => {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -f lavfi -i color=c=${color}:s=640x360:d=10 -c:v libx264 -pix_fmt yuv420p "${outputPath}"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Error creating fallback video:', error);
        reject(error);
        return;
      }
      
      resolve(outputPath);
    });
  });
};

// Generate video endpoint
app.post('/api/generate', async (req, res) => {
  let tempFile = null;
  
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    console.log('Processing URL:', videoUrl);
    updateProgress('processing', 'starting', 0, 'Starting YouTube video processing...');
    
    // Create unique filenames
    const timestamp = Date.now();
    const videoId = getVideoId(videoUrl) || 'video';
    tempFile = path.join(tempDir, `full_${videoId}_${timestamp}.mp4`);
    const outputFile = `clip_${videoId}_${timestamp}.mp4`;
    const outputPath = path.join(uploadDir, outputFile);
    
    // Download the YouTube video
    const { path: downloadedPath, title } = await downloadYouTubeVideo(videoUrl, tempFile);
    
    // For simplicity, we'll extract a 10-second clip from the beginning
    const startTime = 5;  // 5 seconds in
    const duration = 10;  // 10 seconds long clip
    
    updateProgress('processing', 'cutting', 90, 'Creating clip from video...');
    await cutVideoSegment(downloadedPath, outputPath, startTime, duration);
    
    updateProgress('processing', 'finalizing', 95, 'Finalizing video...');
    
    // Create clip data
    const clipData = {
      timestamp: `00:00:${startTime} - 00:00:${startTime + duration}`,
      headline: title || 'YouTube Video Clip',
      file: `/uploads/${outputFile}`,
      videoUrl: `/uploads/${outputFile}`,
      captions: {
        tiktok: `🎬 Check out this clip from YouTube! #video #trending`,
        twitter: `Interesting clip from "${title || 'YouTube'}"`,
        linkedin: `Professional content from YouTube: "${title || 'Video clip'}"`
      }
    };
    
    // Clean up temp file
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (err) {
      console.error('Error cleaning up temp file:', err);
    }
    
    updateProgress('completed', 'done', 100, 'Video clip ready!');
    return res.json({ clips: [clipData] });
    
  } catch (error) {
    console.error('Error processing video:', error);
    updateProgress('error', 'failed', 0, `Error: ${error.message}`);
    
    // Clean up temp file
    try {
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (err) {
      console.error('Error cleaning up temp file:', err);
    }
    
    // Create a fallback video as last resort
    try {
      const timestamp = Date.now();
      const fallbackFile = `fallback_${timestamp}.mp4`;
      const fallbackPath = path.join(uploadDir, fallbackFile);
      
      await createFallbackVideo(fallbackPath, 'red');
      
      // Return the fallback video
      const fallbackClip = {
        timestamp: "00:00:00 - 00:00:10",
        headline: "YouTube Processing Error",
        file: `/uploads/${fallbackFile}`,
        videoUrl: `/uploads/${fallbackFile}`,
        captions: {
          tiktok: "🚫 YouTube processing error #error",
          twitter: "We encountered an error processing this YouTube video",
          linkedin: "Error processing YouTube content"
        }
      };
      
      return res.json({
        clips: [fallbackClip],
        error: error.message
      });
      
    } catch (fallbackError) {
      console.error('Fallback creation failed:', fallbackError);
      
      return res.status(500).json({
        error: 'Failed to process YouTube video',
        details: error.message
      });
    }
  }
});

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Video Processor</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .card { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        button { background: #4CAF50; border: none; color: white; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
        input { padding: 8px; width: 300px; margin-right: 10px; }
        .progress-container { margin-top: 15px; display: none; }
        .progress-bar { height: 20px; background-color: #f0f0f0; border-radius: 4px; margin-top: 5px; }
        .progress-fill { height: 100%; background-color: #4CAF50; border-radius: 4px; width: 0%; transition: width 0.3s; }
      </style>
    </head>
    <body>
      <h1>YouTube Video Processor</h1>
      
      <div class="card">
        <h2>Generate Video Clip</h2>
        <form id="testForm">
          <input type="text" id="videoUrl" value="https://www.youtube.com/watch?v=jNQXAC9IVRw" placeholder="Enter YouTube URL">
          <button type="submit">Generate Clip</button>
        </form>
        
        <div id="progress-container" class="progress-container">
          <div id="progress-text">Starting...</div>
          <div class="progress-bar">
            <div id="progress-fill" class="progress-fill"></div>
          </div>
        </div>
        
        <div id="result" style="margin-top: 15px;"></div>
      </div>
      
      <script>
        document.getElementById('testForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const resultDiv = document.getElementById('result');
          const progressContainer = document.getElementById('progress-container');
          const progressFill = document.getElementById('progress-fill');
          const progressText = document.getElementById('progress-text');
          const videoUrl = document.getElementById('videoUrl').value;
          
          resultDiv.innerHTML = '';
          progressContainer.style.display = 'block';
          
          // Start progress updates
          const progressInterval = setInterval(async () => {
            try {
              const response = await fetch('/api/progress');
              const data = await response.json();
              
              progressFill.style.width = data.progress + '%';
              progressText.textContent = data.message + ' (' + data.progress + '%)';
              
              if (data.status === 'completed' || data.status === 'error') {
                clearInterval(progressInterval);
              }
            } catch (err) {
              console.error('Error checking progress:', err);
            }
          }, 1000);
          
          try {
            resultDiv.innerHTML = 'Processing...';
            
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrl })
            });
            
            const data = await response.json();
            
            if (data.clips && data.clips.length > 0) {
              resultDiv.innerHTML = \`
                <h3>\${data.clips[0].headline}</h3>
                <p>Clip: \${data.clips[0].timestamp}</p>
                <video controls width="640" height="360">
                  <source src="\${data.clips[0].file}" type="video/mp4">
                </video>
                <p>
                  <a href="\${data.clips[0].file}" target="_blank">Open in new window</a> |
                  <button onclick="window.location.reload()">Generate another clip</button>
                </p>
              \`;
            } else {
              resultDiv.innerHTML = '<p style="color: red;">Error: ' + (data.error || 'Unknown error') + '</p>';
            }
          } catch (error) {
            resultDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`YouTube Video Processor running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the app`);
});
