// API Configuration
// Centralized API URL management for different environments

const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For local development/testing, always use localhost
  // In production, this should be set via REACT_APP_API_URL environment variable
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoint helpers
export const apiEndpoints = {
  generate: `${API_BASE_URL}/api/generate`,
  generateBatch: `${API_BASE_URL}/api/generate/batch`,
  progress: `${API_BASE_URL}/api/progress`,
  lastClips: `${API_BASE_URL}/api/last-clips`,
  download: (fileName) => `${API_BASE_URL}/api/download/${fileName}`,
  access: (plan) => `${API_BASE_URL}/api/access?plan=${plan}`,
  video: (videoPath) => `${API_BASE_URL}${videoPath}`
};

export default apiEndpoints;