// Test the user's exact URLs with proper case
const YouTubeHelper = require('./youtube-helper-new.js');

async function testUserUrls() {
  console.log('🧪 Testing user URLs with case sensitivity...');
  
  const youtube = new YouTubeHelper();
  
  // User's URLs - let's test both lowercase and potential correct case
  const testUrls = [
    'https://www.youtube.com/watch?v=m9yz1ijkefs&t=64s', // user's lowercase
    'https://www.youtube.com/watch?v=M9yz1IJkEfS&t=64s', // potential correct case
    'https://www.youtube.com/watch?v=iv9m2kfte2q&t=56s', // user's lowercase  
    'https://www.youtube.com/watch?v=Iv9m2KfTe2Q&t=56s'  // correct case from before
  ];
  
  for (const url of testUrls) {
    console.log(`\n🎯 Testing: ${url}`);
    
    try {
      const videoId = youtube.getVideoID(url);
      console.log(`📋 Video ID: ${videoId}`);
      
      const info = await youtube.getVideoInfo(url);
      console.log(`✅ Video available: ${info.title?.substring(0, 50)}...`);
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      if (error.message.toLowerCase().includes('unavailable')) {
        console.log('🔍 Video appears to be unavailable or private');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Test completed');
}

testUserUrls().catch(console.error);