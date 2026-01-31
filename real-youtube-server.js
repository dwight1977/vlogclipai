const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const ytdl = require('ytdl-core');
const http = require('http');
const { pipeline } = require('stream');
const { promisify } = require('util');

// Create directories
const uploadDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');

[uploadDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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

// Function to download actual YouTube content
const downloadYouTubeVideo = async (videoUrl, outputPath) => {
  return new Promise((resolve, reject) => {
    console.log('Starting YouTube video download...');
    
    try {
      // METHOD 1: Using ytdl-core directly
      const stream = ytdl(videoUrl, {
        quality: 'highest',
        filter: format => {
          return format.container === 'mp4' && format.qualityLabel && 
                 parseInt(format.qualityLabel.replace('p', '')) <= 720;
        }
      });
      
      // Handle download progress
      let downloaded = 0;
      const fileStream = fs.createWriteStream(outputPath);
      
      stream.on('info', (info, format) => {
        const videoTitle = info.videoDetails.title;
        const totalSize = format.contentLength;
        console.log(`Downloading: ${videoTitle} (${(totalSize / (1024 * 1024)).toFixed(2)} MB)`);
      });
      
      stream.on('data', chunk => {
        downloaded += chunk.length;
        updateProgress('processing', 'downloading_video', 
                      Math.min(70, Math.round((downloaded / 10000000) * 100)), 
                      `Downloaded: ${(downloaded / (1024 * 1024)).toFixed(2)} MB`);
      });
      
      stream.on('error', (err) => {
        console.error('YouTube download error:', err);
        fileStream.close();
        reject(err);
      });
      
      fileStream.on('finish', () => {
        console.log('Download finished!');
        resolve(outputPath);
      });
      
      fileStream.on('error', (err) => {
        console.error('File write error:', err);
        reject(err);
      });
      
      pipeline(stream, fileStream, (err) => {
        if (err) {
          console.error('Pipeline error:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('YouTube download initialization error:', error);
      reject(error);
    }
  });
};

// Function to cut a video segment
const cutVideoSegment = async (inputPath, outputPath, startTime, duration) => {
  return new Promise((resolve, reject) => {
    // Direct ffmpeg command for cutting
    const cmd = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;
    
    console.log('Executing:', cmd);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg error:', error);
        reject(error);
        return;
      }
      console.log('Video segment created');
      resolve(outputPath);
    });
  });
};

// Handler for ANY error that might happen
const handleErrors = async (res, error, videoUrl) => {
  console.error('Error processing:', error);
  
  // Create a blue video as ultimate fallback
  try {
    const timestamp = Date.now();
    const fallbackPath = path.join(uploadDir, `fallback_${timestamp}.mp4`);
    
    await new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -f lavfi -i color=c=blue:s=640x360:d=15 -vf "drawtext=text='Could not process video ${
        videoUrl.substring(0, 20)}...':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p ${fallbackPath}`;
      
      exec(cmd, (cmdError) => {
        if (cmdError) {
          console.error('Error creating fallback video:', cmdError);
          reject(cmdError);
          return;
        }
        resolve();
      });
    });
    
    // Return fallback clip
    const errorClip = {
      timestamp: "00:00:00 - 00:00:15",
      headline: "Error Processing Video",
      captions: {
        tiktok: "⚠️ Sorry! Couldn't process this video. Please try another one!",
        twitter: "We encountered an error processing this video. Please try another YouTube URL.",
        linkedin: "Technical difficulties encountered processing this content. Please try another video source."
      },
      file: `/uploads/fallback_${timestamp}.mp4`,
      videoUrl: `/uploads/fallback_${timestamp}.mp4`,
      error: error.message
    };
    
    updateProgress('error', 'failed', 100, 'Processing failed, returning fallback');
    return res.json({ clips: [errorClip], error: error.message });
    
  } catch (fallbackError) {
    // Complete failure, return JSON error
    updateProgress('error', 'failed', 0, 'Complete failure');
    return res.status(500).json({ 
      error: 'Failed to process video and create fallback',
      details: error.message
    });
  }
};

// Main endpoint for generating clips
app.post('/api/generate', async (req, res) => {
  const { videoUrl } = req.body;
  let tempFilePaths = [];
  
  try {
    // Reset progress
    updateProgress('processing', 'starting', 0, 'Starting processing...');
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    // Attempt to validate YouTube URL
    if (!ytdl.validateURL(videoUrl)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Get unique ID elements
    const videoId = ytdl.getVideoID(videoUrl);
    const timestamp = Date.now();
    const tempVideoPath = path.join(tempDir, `full_${videoId}_${timestamp}.mp4`);
    const clipName = `clip_${videoId}_${timestamp}.mp4`;
    const clipPath = path.join(uploadDir, clipName);
    
    tempFilePaths.push(tempVideoPath);
    
    // Get video info first
    updateProgress('processing', 'getting_info', 5, 'Getting video information...');
    const videoInfo = await ytdl.getInfo(videoUrl);
    
    // Show user we're downloading their specific video
    updateProgress('processing', 'downloading_video', 10, 
                  `Downloading "${videoInfo.videoDetails.title}"...`);
    
    // Download the actual YouTube video
    await downloadYouTubeVideo(videoUrl, tempVideoPath);
    
    // Generate a sample timestamp (normally would come from AI analysis)
    // Take a 20-second segment starting 30 seconds in
    const startTime = 30;
    const duration = 20;
    
    updateProgress('processing', 'cutting_video', 80, 'Cutting video segment...');
    
    // Cut the segment from the downloaded video
    await cutVideoSegment(tempVideoPath, clipPath, startTime, duration);
    
    // Create response data
    const clipData = {
      timestamp: `00:00:30 - 00:00:50`,
      headline: `Highlight from ${videoInfo.videoDetails.title}`,
      captions: {
        tiktok: `🔥 Check out this awesome moment from ${videoInfo.videoDetails.title.substring(0, 30)}... #trending`,
        twitter: `Amazing highlight from this YouTube video by ${videoInfo.videoDetails.author.name}`,
        linkedin: `Professional insights from content by ${videoInfo.videoDetails.author.name}`
      },
      file: `/uploads/${clipName}`,
      videoUrl: `/uploads/${clipName}`
    };
    
    // Clean up temp files
    tempFilePaths.forEach(file => {
      try { fs.unlinkSync(file); } catch (err) { /* ignore cleanup errors */ }
    });
    
    updateProgress('completed', 'done', 100, 'Processing complete');
    res.json({ clips: [clipData] });
  } catch (error) {
    // Handle all possible errors gracefully
    handleErrors(res, error, videoUrl);
    
    // Clean up temp files
    tempFilePaths.forEach(file => {
      try { fs.unlinkSync(file); } catch (err) { /* ignore cleanup errors */ }
    });
  }
});

// Start server with error handling
const PORT = process.env.PORT || 3001;

// Ensure the port is free
const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying to close existing connections...`);
    
    // Try to forcibly close the existing server
    exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
      if (error) {
        console.error('Failed to kill process on port:', error);
        process.exit(1);
      }
      
      // Try again after a brief delay
      setTimeout(() => {
        server.listen(PORT, () => {
          console.log(`Server restarted successfully on port ${PORT}`);
        });
      }, 1000);
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from ${uploadDir}`);
});
