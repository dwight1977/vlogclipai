// A-TEAM CHROME VIDEO DEBUG TEST
// This will help us understand what's happening during download

console.log('🔍 A-TEAM CHROME VIDEO DEBUG STARTED');

// Function to check video dimensions in browser
function checkVideoInBrowser(videoUrl) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.onloadedmetadata = function() {
      console.log('📐 Video dimensions in browser:', {
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        naturalWidth: this.videoWidth,
        naturalHeight: this.videoHeight,
        aspectRatio: (this.videoWidth / this.videoHeight).toFixed(4)
      });
      resolve({
        width: this.videoWidth,
        height: this.videoHeight
      });
    };
    video.onerror = function(e) {
      console.error('❌ Video load error:', e);
      resolve({ error: 'Failed to load video' });
    };
    video.src = videoUrl;
  });
}

// Test the user's specific file
const testVideoUrl = 'http://localhost:3001/uploads/batch_clip_Tz9TEXsJasE_1753426693282_video1_segment_1.mp4';

console.log('🧪 Testing video URL:', testVideoUrl);

// Check if we're in browser environment
if (typeof document !== 'undefined') {
  checkVideoInBrowser(testVideoUrl).then(result => {
    console.log('✅ Browser video check result:', result);
    
    // Also test the API download endpoint
    fetch('http://localhost:3001/api/download/batch_clip_Tz9TEXsJasE_1753426693282_video1_segment_1.mp4', {
      method: 'HEAD'
    }).then(response => {
      console.log('📡 API download response headers:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentDisposition: response.headers.get('content-disposition'),
        contentLength: response.headers.get('content-length')
      });
    }).catch(err => {
      console.error('❌ API download test error:', err);
    });
  });
} else {
  console.log('⚠️ Not in browser environment - run this in browser console');
}

// Instructions for user
console.log(`
🎯 USER INSTRUCTIONS:
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Paste and run this entire script
4. Check the output for video dimensions
5. Compare with what you're actually downloading

This will help us identify if Chrome is converting the video during download.
`);