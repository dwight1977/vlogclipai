// DR. ALEX's Comprehensive Batch Processing Test
// Simulate exactly what happens in localhost:3000 batch processing

const fetch = require('node-fetch');

async function testBatchProcessing() {
  console.log('🧪 DR. ALEX: Testing actual batch processing endpoint...');
  
  const testData = {
    videoUrls: [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - reliable test
    ],
    customDuration: 15,
    plan: 'pro'
  };
  
  console.log('📝 Test payload:', testData);
  
  try {
    console.log('🚀 Sending batch processing request to localhost:3001...');
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3001/api/generate/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ Request completed in ${Math.round(duration/1000)} seconds`);
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Batch processing completed successfully!');
    console.log('📊 Results summary:');
    console.log(`  - Total processed: ${result.totalProcessed || 0}`);
    console.log(`  - Results count: ${result.results?.length || 0}`);
    console.log(`  - Errors count: ${result.errors?.length || 0}`);
    
    if (result.results && result.results.length > 0) {
      console.log('🎬 First result details:');
      const firstResult = result.results[0];
      console.log(`  - Video index: ${firstResult.videoIndex}`);
      console.log(`  - Video URL: ${firstResult.videoUrl?.substring(0, 50)}...`);
      console.log(`  - Clips generated: ${firstResult.clips?.length || 0}`);
      
      if (firstResult.clips && firstResult.clips.length > 0) {
        console.log('🎥 First clip details:');
        const firstClip = firstResult.clips[0];
        console.log(`  - Headline: ${firstClip.headline}`);
        console.log(`  - Timestamp: ${firstClip.timestamp}`);
        console.log(`  - Video URL: ${firstClip.videoUrl}`);
        
        // Check if this is demo content
        if (firstClip.videoUrl?.includes('demo') || 
            firstClip.headline?.toLowerCase().includes('demo') ||
            firstClip.headline?.toLowerCase().includes('sample')) {
          console.log('⚠️ WARNING: Demo content detected! This means real processing failed.');
        } else {
          console.log('✅ Real content generated successfully!');
        }
      }
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('❌ Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`  Error ${index + 1}: ${error.error}`);
        console.log(`  Video: ${error.videoUrl?.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.log('❌ Network/Request error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Make sure the backend server is running on localhost:3001');
    }
  }
}

// Run the test
testBatchProcessing().catch(console.error);