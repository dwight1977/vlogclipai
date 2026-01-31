const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create simple Express app for testing
const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if needed
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'success', message: 'Server is working' });
});

// Generate a simple test video that definitely will work
app.post('/api/generate-test', (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    console.log('Received URL:', videoUrl);
    
    // Create a simple JSON response that matches the format expected by the frontend
    const testClip = {
      timestamp: "00:00:00 - 00:00:10",
      headline: "Test Video",
      file: "/uploads/test_simple.mp4", // Using the existing test video
      videoUrl: "/uploads/test_simple.mp4",
      captions: {
        tiktok: "This is a test TikTok caption",
        twitter: "This is a test Twitter caption",
        linkedin: "This is a test LinkedIn caption"
      }
    };
    
    // Return the test clip
    return res.json({ clips: [testClip] });
    
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Debug test server running at http://localhost:${PORT}`);
});
