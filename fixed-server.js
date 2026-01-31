const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { exec } = require('child_process');
require('dotenv').config();

// Create directories if they don't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize app
const app = express();

// Configure CORS with expanded options
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3000', '*'], // Allow frontend domains and all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

app.use(express.json());

// Handle potential errors in JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

// Serve static files from uploads directory with proper MIME types
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

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API server is working correctly',
    time: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Progress endpoint
app.get('/api/progress', (req, res) => {
  console.log('Progress requested, sending:', progress);
  res.json(progress);
});

// Simplified generate endpoint for reliable testing
app.post('/api/generate', async (req, res) => {
  console.log('Generate request received:', req.body);
  const { videoUrl } = req.body;

  try {
    // Reset progress
    updateProgress('processing', 'starting', 0, 'Starting processing...');

    // Validate video URL
    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Simulate processing with progress updates
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress('processing', 'downloading_audio', 20, 'Downloading audio...');
    
    // Simulate various steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress('processing', 'transcribing', 40, 'Transcribing audio...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress('processing', 'generating_highlight', 60, 'Analyzing transcript...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress('processing', 'cutting_video', 80, 'Creating video clip...');
    
    // Create simple blue video
    const timestamp = Date.now();
    const videoFile = `clip_${timestamp}.mp4`;
    const videoPath = path.join(uploadDir, videoFile);
    
    // Use simple FFmpeg command to create a reliable blue video
    await new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -f lavfi -i color=c=blue:s=640x360:d=10 -c:v libx264 -pix_fmt yuv420p ${videoPath}`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          reject(error);
          return;
        }
        resolve();
      });
    });
    
    // Create sample clip data
    const clipData = {
      timestamp: "00:01:15 - 00:01:45",
      headline: "Tech Innovation Reshaping Our Future",
      captions: {
        tiktok: "🚀 Tech innovations changing EVERYTHING! #FutureTech #Innovation",
        twitter: "How emerging technologies are quietly revolutionizing our daily lives and what to expect next.",
        linkedin: "Technological innovation continues to accelerate, creating unprecedented opportunities for businesses prepared to adapt quickly."
      },
      file: `/uploads/${videoFile}`,
      videoUrl: `/uploads/${videoFile}`
    };
    
    updateProgress('completed', 'done', 100, 'Processing complete');
    
    console.log('Sending successful response with clips:', { clips: [clipData] });
    return res.json({ clips: [clipData] });
    
  } catch (error) {
    console.error('Error processing video:', error);
    updateProgress('error', 'failed', 0, 'Processing failed');
    return res.status(500).json({
      error: 'Failed to process video',
      details: error.message
    });
  }
});

// Start server on all interfaces
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test API endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Progress endpoint: http://localhost:${PORT}/api/progress`);
  console.log(`Generate endpoint: http://localhost:${PORT}/api/generate (POST)`);
});
