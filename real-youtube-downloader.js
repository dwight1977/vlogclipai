const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const ytdl = require('ytdl-core');
const { pipeline } = require('stream/promises');

// Create directories
const uploadDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');

for (const dir of [uploadDir, tempDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initialize Express
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files with proper MIME types
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
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

// Root endpoint with UI
app.get('/', (req, res) => {
  const videos = fs.readdirSync(uploadDir)
    .filter(file => file.endsWith('.mp4'))
    .map(file => `/uploads/${file}`)
    .slice(0, 10); // Limit to 10 videos
    
  let videoHtml = '';
  if (videos.length > 0) {
    videos.forEach((video, i) => {
      videoHtml += `
        <div style="width: 320px; margin: 10px; display: inline-block; vertical-align: top;">
          <h3>Video ${i + 1}</h3>
          <video controls width="100%" style="border: 1px solid #ccc;">
            <source src="${video}" type="video/mp4">
            Your browser doesn't support video playback.
          </video>
          <p><a href="${video}" target="_blank">Direct link</a></p>
        </div>
      `;
    });
  } else {
    videoHtml = '<p>No videos generated yet.</p>';
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Video Generator</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .card { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        button { background: #4CAF50; border: none; color: white; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        input { padding: 10px; width: 400px; margin-right: 10px; }
        .progress-bar { height: 20px; background-color: #f0f0f0; border-radius: 4px; margin: 10px 0; }
        .progress-fill { height: 100%; background-color: #4CAF50; border-radius: 4px; width: 0%; transition: width 0.3s; }
        .status { padding: 5px 10px; border-radius: 3px; display: inline-block; margin: 5px 0; }
        .status.success { background-color: #dff0d8; color: #3c763d; }
        .status.error { background-color: #f2dede; color: #a94442; }
        .status.pending { background-color: #fcf8e3; color: #8a6d3b; }
        video { max-width: 100%; }
      </style>
    </head>
    <body>
      <h1>YouTube Video Generator</h1>
      
      <div class="card">
        <h2>Generate Real YouTube Video</h2>
        <form id="generateForm">
          <input type="text" id="videoUrl" placeholder="Enter YouTube URL" value="https://www.youtube.com/watch?v=jNQXAC9IVRw">
          <button type="submit">Generate Video Clip</button>
        </form>
        
        <div id="progressContainer" style="display: none; margin-top: 15px;">
          <div class="status pending" id="statusText">Processing...</div>
          <div class="progress-bar">
            <div class="progress-fill" id="progressBar"></div>
          </div>
          <div id="progressText">0%</div>
        </div>
        
        <div id="result" style="margin-top: 15px;"></div>
      </div>
      
      <div class="card">
        <h2>Available Videos</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${videoHtml}
        </div>
      </div>
      
      <script>
        // Form submission
        document.getElementById('generateForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          const videoUrl = document.getElementById('videoUrl').value;
          const progressContainer = document.getElementById('progressContainer');
          const progressBar = document.getElementById('progressBar');
          const progressText = document.getElementById('progressText');
          const statusText = document.getElementById('statusText');
          
          // Reset and show progress
          resultDiv.innerHTML = '';
          progressContainer.style.display = 'block';
          progressBar.style.width = '0%';
          progressText.textContent = '0%';
          statusText.textContent = 'Processing...';
          statusText.className = 'status pending';
          
          // Start progress polling
          const progressInterval = setInterval(async () => {
            try {
              const response = await fetch('/api/progress');
              const data = await response.json();
              
              progressBar.style.width = data.progress + '%';
              progressText.textContent = data.progress + '% - ' + data.message;
              
              if (data.status === 'error') {
                statusText.textContent = 'Error: ' + data.message;
                statusText.className = 'status error';
                clearInterval(progressInterval);
              } else if (data.status === 'completed') {
                statusText.textContent = 'Complete!';
                statusText.className = 'status success';
                clearInterval(progressInterval);
              }
            } catch (error) {
              console.error('Error checking progress:', error);
            }
          }, 1000);
          
          // Send generate request
          try {
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrl })
            });
            
            const data = await response.json();
            
            // Clear interval when we get response
            clearInterval(progressInterval);
            
            if (data.clips && data.clips.length > 0) {
              resultDiv.innerHTML = '<p>Video generated successfully!</p>';
              
              // Add video element
              const videoElement = document.createElement('video');
              videoElement.controls = true;
              videoElement.width = 640;
              
              const sourceElement = document.createElement('source');
              sourceElement.src = data.clips[0].file;
              sourceElement.type = 'video/mp4';
              
              videoElement.appendChild(sourceElement);
              resultDiv.appendChild(videoElement);
              
              // Add refresh button
              const refreshBtn = document.createElement('button');
              refreshBtn.textContent = 'Refresh Page';
              refreshBtn.onclick = () => window.location.reload();
              refreshBtn.style.marginTop = '10px';
              resultDiv.appendChild(refreshBtn);
            } else {
              resultDiv.innerHTML = '<p class="status error">Error: ' + (data.error || 'Unknown error') + '</p>';
            }
          } catch (error) {
            resultDiv.innerHTML = '<p class="status error">Error: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API endpoint to check status
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'YouTube video generator running',
    time: new Date().toISOString()
  });
});

// Get progress endpoint
app.get('/api/progress', (req, res) => {
  res.json(progress);
});

// Function to download YouTube video
const downloadYouTube = async (videoUrl, outputPath) => {
  try {
    updateProgress('processing', 'downloading', 10, 'Starting YouTube download...');
    
    if (!ytdl.validateURL(videoUrl)) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Get video info first
    updateProgress('processing', 'downloading', 15, 'Getting video information...');
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    
    updateProgress('processing', 'downloading', 20, `Downloading "${title}"...`);
    
    // Select format - prioritize mp4 format with both audio and video
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highest',
      filter: format => format.container === 'mp4' && format.hasAudio && format.hasVideo
    });
    
    if (!format) {
      throw new Error('No suitable video format found');
    }
    
    // Download the video
    const videoStream = ytdl(videoUrl, { format: format });
    const fileStream = fs.createWriteStream(outputPath);
    
    let downloadedBytes = 0;
    const totalBytes = parseInt(format.contentLength) || 1000000; // Fallback if size unknown
    
    videoStream.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      const percent = Math.min(Math.round((downloadedBytes / totalBytes) * 80) + 20, 95);
      updateProgress('processing', 'downloading', percent, 
                    `Downloaded: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
    });
    
    await pipeline(videoStream, fileStream);
    
    updateProgress('processing', 'processing', 95, 'Download complete, processing video...');
    return outputPath;
  } catch (error) {
    console.error('Error downloading YouTube video:', error);
    throw new Error(`YouTube download failed: ${error.message}`);
  }
};

// Function to extract clip
const extractClip = async (inputPath, outputPath, startTime, duration) => {
  return new Promise((resolve, reject) => {
    updateProgress('processing', 'cutting', 96, `Cutting video clip (${duration}s from ${startTime}s)...`);
    
    const ffmpegCommand = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;
    
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error cutting video:', error);
        reject(error);
        return;
      }
      
      updateProgress('processing', 'finalizing', 99, 'Finalizing video...');
      resolve(outputPath);
    });
  });
};

// Generate video endpoint - now downloads actual YouTube videos
app.post('/api/generate', async (req, res) => {
  const { videoUrl } = req.body;
  let tempFilePath = null;
  
  try {
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Reset progress
    updateProgress('processing', 'starting', 0, 'Starting YouTube processing...');
    
    // Create unique filenames
    const videoId = ytdl.getVideoID(videoUrl);
    const timestamp = Date.now();
    tempFilePath = path.join(tempDir, `full_${videoId}_${timestamp}.mp4`);
    const clipFile = `clip_${videoId}_${timestamp}.mp4`;
    const clipPath = path.join(uploadDir, clipFile);
    
    // Download YouTube video
    await downloadYouTube(videoUrl, tempFilePath);
    
    // For simplicity, we'll extract a 10-second clip from 30 seconds into the video
    // In a real app, you'd analyze the video to find the best clip points
    const startTime = 30; // 30 seconds in
    const duration = 10;  // 10 seconds long
    
    // Extract the clip
    await extractClip(tempFilePath, clipPath, startTime, duration);
    
    // Get some video info for the clip data
    const info = await ytdl.getBasicInfo(videoUrl);
    const videoTitle = info.videoDetails.title;
    const author = info.videoDetails.author.name;
    
    // Create clip data
    const clipData = {
      timestamp: `00:00:30 - 00:00:40`, // Hardcoded for now, but could be dynamic
      headline: videoTitle.substring(0, 50) + (videoTitle.length > 50 ? '...' : ''),
      file: `/uploads/${clipFile}`,
      videoUrl: `/uploads/${clipFile}`,
      captions: {
        tiktok: `🎬 Check out this clip from ${author} #youtube #viral`,
        twitter: `Interesting moment from "${videoTitle.substring(0, 30)}..."`,
        linkedin: `Content from ${author}: "${videoTitle.substring(0, 40)}..."`
      }
    };
    
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }
    
    updateProgress('completed', 'done', 100, 'Video clip ready!');
    return res.json({ clips: [clipData] });
    
  } catch (error) {
    console.error('Error processing YouTube video:', error);
    updateProgress('error', 'failed', 0, `Error: ${error.message}`);
    
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
    }
    
    // Create a fallback video with error message
    try {
      const timestamp = Date.now();
      const fallbackFile = `error_${timestamp}.mp4`;
      const fallbackPath = path.join(uploadDir, fallbackFile);
      
      await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -f lavfi -i color=c=red:s=640x360:d=10 -vf "drawtext=text='Error processing ${videoUrl.substring(0, 20)}...':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p "${fallbackPath}"`;
        
        exec(cmd, (cmdError) => {
          if (cmdError) {
            console.error('Error creating fallback video:', cmdError);
            reject(cmdError);
            return;
          }
          resolve();
        });
      });
      
      // Return the fallback video
      const fallbackClip = {
        timestamp: "00:00:00 - 00:00:10",
        headline: "Error Processing Video",
        file: `/uploads/${fallbackFile}`,
        videoUrl: `/uploads/${fallbackFile}`,
        captions: {
          tiktok: "🚫 Error processing video #error",
          twitter: "This video couldn't be processed",
          linkedin: "Error occurred during video processing"
        }
      };
      
      return res.json({
        clips: [fallbackClip],
        error: error.message
      });
      
    } catch (fallbackError) {
      return res.status(500).json({
        error: 'Failed to process video',
        details: error.message
      });
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`YouTube Video Generator running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the app`);
});
