const http = require('http');

// Create a simple HTTP server that responds to all requests
const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.end();
    return;
  }
  
  // Simple response for all other requests
  res.end(JSON.stringify({
    status: 'success',
    message: 'Backend server is accessible',
    time: new Date().toISOString()
  }));
});

// Listen on port 3001
const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
  console.log(`Test server running at http://localhost:${PORT}/`);
});
