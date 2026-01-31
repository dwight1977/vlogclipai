// Reset VlogClip AI Free Tier Usage to 0
console.log('🔄 Resetting VlogClip AI Free Tier Usage...');

// Function to reset usage in localStorage (simulates frontend behavior)
function resetFreeTerrUsage() {
  const user = {
    plan: 'starter', // Reset to free tier
    isAuthenticated: false,
    userId: 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    usage: {
      clipsToday: 0,          // Reset daily clips to 0
      videosThisMonth: 0,     // Reset monthly videos to 0
      lastResetDate: new Date().toDateString(),
      lastMonthlyReset: new Date().getMonth()
    }
  };

  // Since we can't directly access localStorage from Node.js, 
  // we'll output the reset commands for the user
  console.log('✅ Free tier usage reset data:');
  console.log('   📱 Clips today: 0/3');
  console.log('   📹 Videos this month: 0/5');
  console.log('   👤 Plan: starter (free tier)');
  console.log('');
  console.log('🔧 To apply this reset, run this in your browser console:');
  console.log('');
  console.log('localStorage.setItem("vlogclip_user", JSON.stringify(' + JSON.stringify(user, null, 2) + '));');
  console.log('window.location.reload();');
  console.log('');
  console.log('📋 Or visit the frontend and clear browser data, then refresh the page.');
  
  return user;
}

// Reset the usage
const resetUser = resetFreeTerrUsage();

console.log('');
console.log('🎯 TESTING RECOMMENDATIONS:');
console.log('');
console.log('✅ Individual Video Test (Free Tier):');
console.log('   URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
console.log('   Plan: starter');
console.log('   Expected: 3 clips generated, real YouTube content');
console.log('');
console.log('⚠️ Problematic URL to avoid:');
console.log('   URL: https://www.youtube.com/watch?v=kyo72x3d3c4');
console.log('   Issue: Video genuinely unavailable (geolocation/restrictions)');
console.log('');
console.log('✅ Alternative Working URLs for Testing:');
console.log('   • https://www.youtube.com/watch?v=jNQXAC9IVRw (Me at the zoo)');
console.log('   • https://www.youtube.com/watch?v=YE7VzlLtp-4 (Big Buck Bunny)');
console.log('   • https://www.youtube.com/watch?v=9bZkp7q19f0 (Gangnam Style)');
console.log('');
console.log('🚀 Ready for fresh testing with reset usage limits!');