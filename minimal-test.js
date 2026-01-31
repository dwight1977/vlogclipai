const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Progress tracking
let currentProgress = { status: 'idle', message: 'Ready', progress: 0 };

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'VlogClip AI Server', 
    status: 'running',
    endpoints: ['/api/progress', '/api/generate/batch']
  });
});

// Progress endpoint
app.get('/api/progress', (req, res) => {
  res.json(currentProgress);
});

// Batch processing endpoint with basic functionality
app.post('/api/generate/batch', async (req, res) => {
  try {
    const { videoUrls, customDuration = 15, plan = 'free' } = req.body;
    
    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return res.status(400).json({ error: 'No valid video URLs provided' });
    }
    
    // Update progress
    currentProgress = { 
      status: 'processing', 
      message: `Processing ${videoUrls.length} videos...`, 
      progress: 25 
    };
    
    // Simulate processing delay
    setTimeout(() => {
      currentProgress = { 
        status: 'completed', 
        message: `Batch processing completed successfully!`, 
        progress: 100 
      };
    }, 2000);
    
    // Mock results for now
    const results = videoUrls.map((url, index) => ({
      videoIndex: index + 1,
      videoUrl: url,
      clips: [
        {
          headline: `Clip ${index + 1} - Opening Hook`,
          timestamp: '00:00:10 - 00:00:25',
          videoUrl: '/uploads/mock-clip-1.mp4',
          captions: {
            tiktok: 'Amazing moment! #viral #trending',
            twitter: 'Check out this incredible clip!',
            linkedin: 'Professional insights from this video',
            instagram: 'Must watch content! 🔥'
          }
        }
      ]
    }));
    
    res.json({
      results,
      errors: [],
      totalProcessed: videoUrls.length,
      message: `Successfully processed ${videoUrls.length} videos`
    });
    
  } catch (error) {
    console.error('Batch processing error:', error);
    currentProgress = { 
      status: 'error', 
      message: 'Processing failed', 
      progress: 0 
    };
    res.status(500).json({ error: 'Batch processing failed' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal VlogClip server running on port ${PORT}`);
  console.log(`📡 Basic batch processing enabled`);
  console.log(`🌐 Server accessible at http://localhost:${PORT}`);
});