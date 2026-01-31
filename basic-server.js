const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create uploads directory if needed
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

// Root endpoint that shows server status
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
      <title>Video API Server</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .card { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        button { background: #4CAF50; border: none; color: white; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        input { padding: 10px; width: 400px; margin-right: 10px; }
      </style>
    </head>
    <body>
      <h1>Video API Server</h1>
      
      <div class="card">
        <h2>API Status</h2>
        <p>Server is running at: http://localhost:3001</p>
        <p><a href="/api/test">Test API endpoint</a></p>
      </div>
      
      <div class="card">
        <h2>Available Videos</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${videoHtml}
        </div>
      </div>
      
      <div class="card">
        <h2>Generate Video Test</h2>
        <form id="testForm">
          <input type="text" id="videoUrl" value="https://www.youtube.com/watch?v=dQw4w9WgXcQ" placeholder="Enter YouTube URL">
          <button type="submit">Generate Video</button>
        </form>
        <div id="result" style="margin-top: 15px;"></div>
      </div>
      
      <script>
        document.getElementById('testForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          const videoUrl = document.getElementById('videoUrl').value;
          
          resultDiv.innerHTML = 'Generating video...';
          
          try {
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrl })
            });
            
            const data = await response.json();
            
            if (data.clips && data.clips.length > 0) {
              resultDiv.innerHTML = '<p>Video generated! Refresh the page to see it above.</p>';
              
              // Add video element
              const videoElement = document.createElement('video');
              videoElement.controls = true;
              videoElement.width = 400;
              
              const sourceElement = document.createElement('source');
              sourceElement.src = data.clips[0].file;
              sourceElement.type = 'video/mp4';
              
              videoElement.appendChild(sourceElement);
              resultDiv.appendChild(videoElement);
            } else {
              resultDiv.innerHTML = 'Error: ' + (data.error || 'Unknown error');
            }
          } catch (error) {
            resultDiv.innerHTML = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API endpoint to check server status
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API server is running',
    time: new Date().toISOString()
  });
});

// Get progress endpoint
app.get('/api/progress', (req, res) => {
  res.json(progress);
});

// Generate video endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    updateProgress('processing', 'starting', 0, 'Starting video generation...');
    
    // Generate a unique filename
    const timestamp = Date.now();
    const videoFile = `clip_${timestamp}.mp4`;
    const videoPath = path.join(uploadDir, videoFile);
    
    // Create a video with the URL text
    await new Promise((resolve, reject) => {
      // Create a colored video based on URL hash
      const colorIndex = Math.abs(videoUrl.split('').reduce((a, b) => {
        return ((a << 5) - a) + b.charCodeAt(0) | 0;
      }, 0)) % 6;
      
      const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];
      const color = colors[colorIndex];
      
      // Escape URL for ffmpeg
      const escapedUrl = videoUrl.replace(/'/g, "'\\''");
      
      // Create a simple colored video with URL text
      const cmd = `ffmpeg -y -f lavfi -i color=c=${color}:s=640x360:d=10 -vf "drawtext=text='${escapedUrl}':fontcolor=white:fontsize=24:x=20:y=20:box=1:boxcolor=black@0.5:boxborderw=5" -c:v libx264 -pix_fmt yuv420p "${videoPath}"`;
      
      console.log('Running FFmpeg command:', cmd);
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('Error creating video:', error);
          reject(error);
          return;
        }
        
        console.log('Video created successfully');
        resolve();
      });
    });
    
    // Send back the video information
    const clipData = {
      timestamp: "00:00:00 - 00:00:10",
      headline: "Video for: " + videoUrl,
      file: `/uploads/${videoFile}`,
      videoUrl: `/uploads/${videoFile}`
    };
    
    updateProgress('completed', 'done', 100, 'Video ready!');
    return res.json({ clips: [clipData] });
    
  } catch (error) {
    console.error('Error processing video:', error);
    updateProgress('error', 'failed', 0, `Error: ${error.message}`);
    
    return res.status(500).json({
      error: 'Failed to generate video',
      details: error.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the interface`);
});
