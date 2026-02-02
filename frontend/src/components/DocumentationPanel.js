import React, { useState } from 'react';
import './UserDashboard.css';

const DocumentationPanel = () => {
  const [selectedSection, setSelectedSection] = useState('getting-started');

  const documentationSections = {
    'getting-started': {
      title: '🚀 Getting Started',
      content: `
# Welcome to VlogClip AI

VlogClip AI is the ultimate tool for creating viral clips from your videos using advanced AI technology.

## Quick Start Guide

1. **Upload or Paste YouTube URL**
   - Simply paste any YouTube video URL
   - Or upload your own video files (MP4, MOV, AVI)
   - Maximum file size: 2GB per video

2. **AI Processing**
   - Our AI analyzes your video content
   - Identifies the most engaging moments
   - Generates platform-specific captions

3. **Download Your Clips**
   - Get 3 viral clips optimized for different platforms
   - Each clip includes captions and subtitles
   - Export in various formats and resolutions

## Supported Platforms

- **TikTok**: 9:16 aspect ratio, 15-60 seconds
- **Instagram Reels**: 9:16 aspect ratio, up to 90 seconds  
- **YouTube Shorts**: 9:16 aspect ratio, up to 60 seconds
- **Twitter**: 16:9 or 1:1 aspect ratio, up to 2:20 minutes
- **LinkedIn**: Professional format with captions

## Pro Tips for Best Results

✨ **Upload Quality**: Use HD videos (1080p or higher) for best results
🎯 **Content Type**: Educational, entertainment, and tutorial videos work best
⏰ **Length**: 5-60 minute videos provide the best clip opportunities
🗣️ **Audio**: Clear speech and good audio quality improve AI analysis
      `
    },
    'api-guide': {
      title: '🔌 API Documentation',
      content: `
# VlogClip AI API

Integrate VlogClip AI into your workflow with our powerful REST API.

## Authentication

All API requests require authentication using Bearer tokens:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.vlogclip.ai/v1/clips
\`\`\`

## Endpoints

### POST /api/clips/generate
Generate clips from a video URL or uploaded file.

**Request Body:**
\`\`\`json
{
  "url": "https://youtube.com/watch?v=example",
  "platforms": ["tiktok", "instagram", "youtube"],
  "clip_count": 3,
  "max_duration": 60
}
\`\`\`

**Response:**
\`\`\`json
{
  "job_id": "clip_12345",
  "status": "processing",
  "estimated_time": 120
}
\`\`\`

### GET /api/clips/status/{job_id}
Check the status of your clip generation job.

**Response:**
\`\`\`json
{
  "job_id": "clip_12345",
  "status": "completed",
  "clips": [
    {
      "id": "clip_001",
      "platform": "tiktok",
      "duration": 30,
      "download_url": "https://cdn.vlogclip.ai/clips/clip_001.mp4"
    }
  ]
}
\`\`\`

### GET /api/user/analytics
Get detailed analytics for your account.

**Response:**
\`\`\`json
{
  "videos_processed": 45,
  "clips_generated": 135,
  "total_views": 1250000,
  "engagement_rate": 0.087
}
\`\`\`

## Rate Limits

- **Free Tier**: 10 requests per hour
- **Pro Tier**: 100 requests per hour  
- **Business Tier**: 1000 requests per hour

## Webhooks

Configure webhooks to receive notifications when clips are ready:

\`\`\`json
{
  "webhook_url": "https://yourapp.com/webhooks/vlogclip",
  "events": ["clip.completed", "clip.failed"]
}
\`\`\`

## SDKs Available

- **Node.js**: \`npm install vlogclip-ai\`
- **Python**: \`pip install vlogclip-ai\`
- **PHP**: \`composer require vlogclip/ai\`
      `
    },
    'best-practices': {
      title: '💡 Best Practices',
      content: `
# Best Practices for Viral Clips

Learn how to maximize engagement and create clips that go viral.

## Content Strategy

### 🎯 Hook Your Audience (First 3 Seconds)
- Start with a compelling question or statement
- Use visual movement or scene changes
- Create curiosity gaps that demand resolution

### 📱 Platform-Specific Optimization

**TikTok:**
- Vertical orientation (9:16)
- Fast-paced editing
- Trending sounds and effects
- Clear, bold text overlays

**Instagram Reels:**
- High-quality visuals
- Consistent branding
- Strategic hashtag usage
- Strong opening hook

**YouTube Shorts:**
- Clear, engaging thumbnails
- Descriptive titles
- Community engagement in comments
- Cross-promotion with long-form content

## Technical Guidelines

### Video Quality
- **Resolution**: Minimum 1080p (1920x1080)
- **Frame Rate**: 30fps or 60fps
- **Audio**: -14 LUFS to -16 LUFS
- **Format**: MP4 with H.264 codec

### Captions and Text
- **Size**: Large enough to read on mobile
- **Contrast**: High contrast with background
- **Duration**: 2-3 seconds per caption
- **Font**: Sans-serif fonts (Arial, Helvetica)

## Content Types That Perform Well

### 🔥 High-Engagement Categories
1. **Educational/Tutorial**: How-to guides, tips, explanations
2. **Entertainment**: Funny moments, reactions, surprises
3. **Behind-the-Scenes**: Process reveals, day-in-the-life
4. **Trending Topics**: Current events, viral challenges
5. **Motivational**: Inspiring quotes, success stories

### 📊 Analytics to Track
- **View-through Rate**: Percentage who watch to completion
- **Engagement Rate**: Likes, comments, shares per view
- **Click-through Rate**: Profile visits from clips
- **Conversion Rate**: Actions taken after viewing

### ⏰ Optimal Posting Times
- **TikTok**: 6-10 PM, Tuesday-Thursday
- **Instagram**: 11 AM-1 PM, Wednesday-Friday  
- **YouTube**: 2-4 PM, weekdays
- **LinkedIn**: 8-9 AM, Tuesday-Thursday

## Advanced Techniques

### Storytelling Framework
1. **Setup** (0-3s): Establish context
2. **Conflict** (3-20s): Present problem/challenge
3. **Resolution** (20-60s): Provide solution/outcome

### Visual Techniques
- **Jump cuts**: Maintain energy and pace
- **B-roll footage**: Add visual interest
- **Text animations**: Emphasize key points
- **Color grading**: Create consistent mood

### Audio Optimization
- **Background music**: Match energy level
- **Sound effects**: Enhance key moments
- **Voice clarity**: Remove background noise
- **Volume levels**: Consistent throughout
      `
    },
    'troubleshooting': {
      title: '🔧 Troubleshooting',
      content: `
# Troubleshooting Guide

Common issues and solutions for VlogClip AI.

## Video Processing Issues

### ❌ "Video processing failed"
**Causes:**
- Unsupported video format
- File size too large (>2GB)
- Corrupted video file
- Network connectivity issues

**Solutions:**
1. Convert video to MP4 format
2. Compress video file size
3. Check internet connection
4. Try uploading again

### ⏳ "Processing taking too long"
**Normal Processing Times:**
- 5-10 minutes: Videos under 30 minutes
- 10-20 minutes: Videos 30-60 minutes
- 20+ minutes: Videos over 60 minutes

**If processing exceeds normal time:**
1. Check system status page
2. Refresh browser and check again
3. Contact support if issue persists

## Audio Issues

### 🔇 "No audio detected"
**Causes:**
- Muted video source
- Audio track corruption
- Unsupported audio codec

**Solutions:**
1. Verify original video has audio
2. Re-encode video with standard audio codec
3. Upload alternative audio format

### 🗣️ "Poor transcription quality"
**Improvements:**
- Use videos with clear speech
- Minimize background noise
- Ensure single speaker per segment
- Upload higher quality audio

## Account & Billing

### 💳 "Payment failed"
**Common Causes:**
- Expired credit card
- Insufficient funds
- International payment restrictions
- Bank security measures

**Solutions:**
1. Update payment method in settings
2. Contact your bank about the charge
3. Try alternative payment method
4. Contact our billing support

### 📊 "Usage not updating"
**Solutions:**
1. Refresh browser cache (Ctrl+F5)
2. Log out and back in
3. Check after 5-10 minutes
4. Contact support if persists

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Browser-Specific Issues

**Chrome:**
- Clear cache and cookies
- Disable ad blockers temporarily
- Check for browser updates

**Safari:**
- Enable cookies and local storage
- Disable intelligent tracking prevention
- Update to latest version

**Firefox:**
- Disable strict privacy settings
- Clear site data
- Check extension conflicts

## API Issues

### 🔑 "Authentication failed"
**Solutions:**
1. Verify API key is correct
2. Check key hasn't expired
3. Ensure proper Authorization header format
4. Confirm account has API access

### ⏱️ "Rate limit exceeded"
**Solutions:**
1. Reduce request frequency
2. Implement exponential backoff
3. Upgrade to higher tier plan
4. Contact support for rate limit increase

### 📡 "Network timeout"
**Solutions:**
1. Increase timeout values
2. Implement retry logic
3. Check network connectivity
4. Verify endpoint URLs

## Getting Help

### 📞 Contact Support
- **Email**: support@vlogclip.ai
- **Live Chat**: Available 9 AM - 6 PM EST
- **Response Time**: Within 4 hours

### 🐛 Bug Reports
Please include:
- Browser and version
- Steps to reproduce
- Screenshot/video of issue
- Console error messages
- Video URL or file details

### 💡 Feature Requests
Submit via:
- In-app feedback form
- Email to features@vlogclip.ai
- Community forum discussions
      `
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>📚 Documentation</h1>
          <p className="user-email">Learn everything about VlogClip AI</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
        {/* Sidebar Navigation */}
        <div style={{
          minWidth: '250px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: 'fit-content'
        }}>
          <h3 style={{ 
            color: '#ffffff', 
            marginBottom: '16px', 
            fontSize: '18px',
            fontWeight: '700'
          }}>
            📖 Table of Contents
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(documentationSections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setSelectedSection(key)}
                style={{
                  padding: '12px 16px',
                  background: selectedSection === key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: selectedSection === key ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: selectedSection === key ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: selectedSection === key ? '600' : '500'
                }}
                onMouseOver={(e) => {
                  if (selectedSection !== key) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.color = '#cbd5e1';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedSection !== key) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#94a3b8';
                  }
                }}
              >
                {section.title}
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px'
          }}>
            <h4 style={{ color: '#10b981', marginBottom: '8px', fontSize: '14px' }}>
              💬 Need Help?
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 12px 0' }}>
              Can't find what you're looking for?
            </p>
            <button
              onClick={() => window.open('mailto:support@vlogclip.ai', '_blank')}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '6px',
                color: '#10b981',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{
            color: '#e2e8f0',
            lineHeight: '1.6',
            fontSize: '14px'
          }}>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              margin: 0,
              background: 'transparent',
              border: 'none'
            }}>
              {documentationSections[selectedSection].content}
            </pre>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        position: 'relative',
        zIndex: 1
      }}>
        <button
          onClick={() => window.open('https://github.com/vlogclip/examples', '_blank')}
          style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📦</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Code Examples</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Browse integration examples</div>
        </button>

        <button
          onClick={() => window.open('https://status.vlogclip.ai', '_blank')}
          style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🟢</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>System Status</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Check service availability</div>
        </button>

        <button
          onClick={() => window.open('https://changelog.vlogclip.ai', '_blank')}
          style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📝</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Changelog</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Latest updates and features</div>
        </button>

        <button
          onClick={() => window.open('https://community.vlogclip.ai', '_blank')}
          style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Community Forum</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Connect with other creators</div>
        </button>
      </div>
    </div>
  );
};

export default DocumentationPanel;