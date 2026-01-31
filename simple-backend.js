const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Progress tracking
let currentProgress = { status: 'idle', message: 'Ready', progress: 0 };

// Helper function to set CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Helper function to parse POST body
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Root endpoint
  if (path === '/' && method === 'GET') {
    sendJSON(res, 200, {
      message: 'VlogClip AI Server',
      status: 'running',
      endpoints: ['/api/progress', '/api/generate/batch']
    });
    return;
  }

  // Progress endpoint
  if (path === '/api/progress' && method === 'GET') {
    sendJSON(res, 200, currentProgress);
    return;
  }

  // Last clips endpoint (mock for now)
  if (path === '/api/last-clips' && method === 'GET') {
    sendJSON(res, 200, {
      clips: [
        {
          headline: 'Mock Clip - Opening Hook',
          timestamp: '00:00:10 - 00:00:25',
          file: '/uploads/mock-clip.mp4',
          captions: {
            tiktok: 'Amazing moment! #viral #trending',
            twitter: 'Check out this incredible clip!',
            linkedin: 'Professional insights from this video',
            instagram: 'Must watch content! 🔥'
          }
        }
      ]
    });
    return;
  }

  // Batch processing endpoint
  if (path === '/api/generate/batch' && method === 'POST') {
    parseBody(req, (error, data) => {
      if (error) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
        return;
      }

      const { videoUrls, customDuration = 15, plan = 'free' } = data;

      if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
        sendJSON(res, 400, { error: 'No valid video URLs provided' });
        return;
      }

      // Start processing simulation
      currentProgress = {
        status: 'processing',
        message: `Starting batch processing of ${videoUrls.length} videos...`,
        progress: 5
      };

      // Don't return results immediately - let the frontend poll for progress
      sendJSON(res, 202, {
        message: `Started processing ${videoUrls.length} videos`,
        status: 'processing'
      });

      // Simulate realistic processing with progress updates
      let currentVideoIndex = 0;
      const processingInterval = setInterval(() => {
        currentVideoIndex++;
        const progressPercent = Math.round((currentVideoIndex / videoUrls.length) * 90) + 5;
        
        currentProgress = {
          status: 'processing',
          message: `Processing video ${currentVideoIndex} of ${videoUrls.length}...`,
          progress: progressPercent
        };

        // When all videos are "processed"
        if (currentVideoIndex >= videoUrls.length) {
          clearInterval(processingInterval);
          
          // Generate mock results after processing is "complete"
          const results = videoUrls.map((videoUrl, index) => ({
            videoIndex: index + 1,
            videoUrl: videoUrl,
            clips: [
              {
                headline: `Amazing Clip ${index + 1} - Opening Hook`,
                timestamp: '00:00:10 - 00:00:25',
                videoUrl: '/uploads/mock-clip.mp4',
                captions: {
                  tiktok: 'Amazing moment! #viral #trending',
                  twitter: 'Check out this incredible clip!',
                  linkedin: 'Professional insights from this video',
                  instagram: 'Must watch content! 🔥'
                }
              }
            ]
          }));

          // Store results for the frontend to fetch
          currentProgress = {
            status: 'completed',
            message: `Batch processing completed! ${videoUrls.length} videos processed successfully.`,
            progress: 100,
            results: results,
            errors: [],
            totalProcessed: videoUrls.length
          };
        }
      }, 2000); // Process one video every 2 seconds
    });
    return;
  }

  // 404 for other endpoints
  sendJSON(res, 404, { error: 'Endpoint not found' });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Simple VlogClip AI Server running on port ${PORT}`);
  console.log(`📡 Basic batch processing enabled`);
  console.log(`🌐 Access at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});