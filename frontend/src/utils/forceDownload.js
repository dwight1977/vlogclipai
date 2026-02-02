// A-TEAM: Force download utility to bypass Chrome video conversion
export const forceDownload = async (videoUrl, filename) => {
  try {
    console.log('🔧 A-TEAM: Using force download to bypass Chrome conversion');
    
    // Method 1: Fetch as blob and create object URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('📁 Blob size:', blob.size, 'bytes');
    console.log('📁 Blob type:', blob.type);
    
    // Create object URL and download
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectURL;
    link.download = filename || 'video.mp4';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
    
    console.log('✅ A-TEAM: Force download completed');
    return true;
    
  } catch (error) {
    console.error('❌ A-TEAM: Force download failed:', error);
    
    // Fallback to original method
    console.log('🔄 A-TEAM: Falling back to original download method');
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename || 'video.mp4';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return false;
  }
};