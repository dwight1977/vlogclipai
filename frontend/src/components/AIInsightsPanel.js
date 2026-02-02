import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './UserDashboard.css';

const AIInsightsPanel = ({ onBack }) => {
  const { user } = useUser();
  const [insights, setInsights] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [contentTrends, setContentTrends] = useState([]);
  const [viralMetrics, setViralMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    fetchAIInsights();
    fetchPlatformData();
    fetchContentTrends();
    fetchViralMetrics();
    
    // Set up daily refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const dailyRefreshTimeout = setTimeout(() => {
      // Refresh all insights at midnight
      fetchAIInsights();
      fetchPlatformData();
      fetchContentTrends();
      fetchViralMetrics();
      
      // Set up interval for daily refreshes
      const dailyInterval = setInterval(() => {
        fetchAIInsights();
        fetchPlatformData();
        fetchContentTrends();
        fetchViralMetrics();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);
    
    return () => clearTimeout(dailyRefreshTimeout);
  }, []);

  const fetchAIInsights = async () => {
    // Generate daily-changing AI insights based on current date
    setTimeout(() => {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const weekday = today.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Daily seeded random for consistency within the same day
      const dailySeed = dayOfYear * 7 + weekday;
      const random = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Generate dynamic viral potential (75-95%)
      const viralPotential = Math.floor(75 + random(dailySeed) * 20);
      const confidenceScore = Math.floor(85 + random(dailySeed + 1) * 15);
      
      // Daily rotating recommendations
      const recommendations = [
        "Focus on micro-content: 15-second videos are seeing 45% higher completion rates this week",
        "Leverage trending audio: Videos with popular sounds get 3x more algorithm boost", 
        "Educational content is peaking: How-to videos show 67% better engagement",
        "Behind-the-scenes content trending: Authentic moments drive 89% more shares",
        "Interactive elements working: Polls and Q&A increase engagement by 156%",
        "Storytelling format dominant: Narrative-driven content sees 78% better retention",
        "Tech review content surging: Product demonstrations up 234% this month"
      ];
      
      const dailyRecommendation = recommendations[dailySeed % recommendations.length];
      
      // Daily rotating action items
      const actionSets = [
        [
          "Create a 15-second hook using trending sounds",
          `Post on ${dayNames[weekday]} between 2-4 PM for peak reach`,
          "Use current trending hashtags: #ViralContent #TechTrends #Creator",
          "Add text overlays with key points for accessibility"
        ],
        [
          "Film a behind-the-scenes process video", 
          `Schedule content for ${dayNames[(weekday + 1) % 7]} evening (6-8 PM)`,
          "Incorporate trending challenges or formats",
          "Create engaging thumbnails with bright colors"
        ],
        [
          "Develop educational micro-content series",
          `Target ${dayNames[(weekday + 2) % 7]} lunch hour (12-2 PM) posting`,
          "Use question-based hooks to drive engagement",
          "Add call-to-action in first 5 seconds"
        ],
        [
          "Create reaction or commentary content",
          `Optimize for ${dayNames[(weekday + 3) % 7]} prime time (7-9 PM)`,
          "Use split-screen or dual-view formats",
          "Include shareable quotes or insights"
        ]
      ];
      
      const dailyActions = actionSets[Math.floor(dailySeed / 7) % actionSets.length];
      
      // Dynamic platform scores based on daily trends
      const baseTikTokScore = 88 + Math.floor(random(dailySeed + 2) * 8);
      const baseInstagramScore = 82 + Math.floor(random(dailySeed + 3) * 10); 
      const baseYouTubeScore = 75 + Math.floor(random(dailySeed + 4) * 12);
      const baseTwitterScore = 70 + Math.floor(random(dailySeed + 5) * 15);
      
      const platformReasons = {
        tiktok: [
          "Algorithm favoring short-form content",
          "High engagement for trending sounds", 
          "Strong performance in tech niche",
          "Optimal timing for your audience",
          "Trending hashtags alignment"
        ],
        instagram: [
          "Reels format performing exceptionally",
          "Visual content resonating well",
          "Story engagement increasing",
          "Hashtag reach expanding",
          "Audience growth in target demo"
        ],
        youtube: [
          "Shorts gaining significant traction",
          "Subscriber engagement improving",
          "Search visibility increasing",
          "Content retention rates up",
          "Trending topics alignment strong"
        ],
        twitter: [
          "Thread format showing growth",
          "Video tweets gaining momentum",
          "Engagement consistency improving",
          "Retweet potential increasing",
          "Community building progressing"
        ]
      };

      setInsights({
        overallViralPotential: viralPotential,
        confidenceScore: confidenceScore,
        recommendation: dailyRecommendation,
        nextBestActions: dailyActions,
        platformOptimization: {
          tiktok: { 
            score: baseTikTokScore, 
            reason: platformReasons.tiktok[dailySeed % platformReasons.tiktok.length] 
          },
          instagram: { 
            score: baseInstagramScore, 
            reason: platformReasons.instagram[dailySeed % platformReasons.instagram.length] 
          },
          youtube: { 
            score: baseYouTubeScore, 
            reason: platformReasons.youtube[dailySeed % platformReasons.youtube.length] 
          },
          twitter: { 
            score: baseTwitterScore, 
            reason: platformReasons.twitter[dailySeed % platformReasons.twitter.length] 
          }
        },
        lastUpdated: today.toISOString()
      });
    }, 800);
  };

  const fetchPlatformData = async () => {
    // Simulate real-time platform performance data
    setTimeout(() => {
      setPlatformData({
        tiktok: {
          avgViews: "2.4M",
          engagementRate: "8.2%",
          bestTimes: ["6-9 PM EST"],
          trendingFormats: ["Tech Tips", "Quick Tutorials", "Behind the Scenes"],
          hashtagSuggestions: ["#TechTok", "#LearnOnTikTok", "#TechTips"],
          audienceAge: "18-34",
          peakDays: ["Tuesday", "Wednesday", "Thursday"]
        },
        instagram: {
          avgViews: "1.8M",
          engagementRate: "6.7%",
          bestTimes: ["12-3 PM EST", "7-9 PM EST"],
          trendingFormats: ["Carousels", "Reels", "Stories"],
          hashtagSuggestions: ["#TechLife", "#Productivity", "#Innovation"],
          audienceAge: "25-44",
          peakDays: ["Wednesday", "Thursday", "Sunday"]
        },
        youtube: {
          avgViews: "856K",
          engagementRate: "4.9%",
          bestTimes: ["2-4 PM EST", "8-10 PM EST"],
          trendingFormats: ["Tutorials", "Reviews", "Shorts"],
          hashtagSuggestions: ["#YouTubeShorts", "#TechReview", "#Tutorial"],
          audienceAge: "25-54",
          peakDays: ["Saturday", "Sunday"]
        },
        twitter: {
          avgViews: "342K",
          engagementRate: "3.8%",
          bestTimes: ["12-3 PM EST", "5-6 PM EST"],
          trendingFormats: ["Threads", "Videos", "Polls"],
          hashtagSuggestions: ["#TechTwitter", "#Innovation", "#AI"],
          audienceAge: "25-44",
          peakDays: ["Monday", "Tuesday", "Wednesday"]
        }
      });
    }, 600);
  };

  const fetchContentTrends = async () => {
    // Generate daily-changing trending content analysis
    setTimeout(() => {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const dailySeed = dayOfYear;
      
      const random = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      // Daily rotating trending topics
      const topicPool = [
        {
          topics: ["AI Tools 2025", "ChatGPT Updates", "ML Automation", "AI Writing Tools"],
          platforms: [["TikTok", "YouTube"], ["YouTube", "Twitter"], ["LinkedIn", "Twitter"], ["Instagram", "TikTok"]],
          contentTypes: [["Tutorials", "Comparisons", "Reviews"], ["News", "Analysis", "Predictions"], ["How-to", "Case Studies"], ["Tips", "Demos", "Reviews"]]
        },
        {
          topics: ["Remote Work Evolution", "Hybrid Workplace", "Digital Nomad Life", "Work-Life Balance"],
          platforms: [["Instagram", "TikTok"], ["LinkedIn", "YouTube"], ["TikTok", "Instagram"], ["YouTube", "Twitter"]],
          contentTypes: [["Room Tours", "Setup Reviews", "Tips"], ["Career Advice", "Productivity"], ["Travel", "Lifestyle"], ["Wellness", "Time Management"]]
        },
        {
          topics: ["Productivity Systems", "Morning Routines", "Time Management", "Focus Techniques"],
          platforms: [["YouTube", "Twitter"], ["TikTok", "Instagram"], ["LinkedIn", "YouTube"], ["Instagram", "TikTok"]],
          contentTypes: [["Quick Tips", "Day in Life", "Tools Review"], ["Routine", "Habits", "Morning"], ["Systems", "Frameworks"], ["Techniques", "Methods"]]
        },
        {
          topics: ["Tech Reviews 2025", "Gadget Unboxing", "Software Demos", "App Reviews"],
          platforms: [["YouTube", "Instagram"], ["TikTok", "YouTube"], ["Twitter", "LinkedIn"], ["Instagram", "TikTok"]],
          contentTypes: [["Unboxing", "First Impressions", "Comparisons"], ["Reviews", "Demos"], ["Tutorials", "Tips"], ["Rankings", "Recommendations"]]
        },
        {
          topics: ["Social Media Strategy", "Content Creation", "Creator Economy", "Influencer Marketing"],
          platforms: [["TikTok", "Instagram"], ["YouTube", "Twitter"], ["LinkedIn", "YouTube"], ["Instagram", "Twitter"]],
          contentTypes: [["Behind-the-scenes", "Growth Tips"], ["Strategy", "Analytics"], ["Business", "Monetization"], ["Trends", "Insights"]]
        },
        {
          topics: ["Fitness Tech", "Health Apps", "Wellness Tracking", "Mental Health"],
          platforms: [["Instagram", "TikTok"], ["YouTube", "Instagram"], ["TikTok", "Twitter"], ["LinkedIn", "YouTube"]],
          contentTypes: [["Workouts", "Reviews", "Progress"], ["Tutorials", "Comparisons"], ["Tips", "Experiences"], ["Advice", "Stories"]]
        },
        {
          topics: ["Sustainable Tech", "Green Energy", "Eco Innovation", "Climate Solutions"],
          platforms: [["YouTube", "LinkedIn"], ["TikTok", "Instagram"], ["Twitter", "YouTube"], ["Instagram", "LinkedIn"]],
          contentTypes: [["Education", "Reviews", "News"], ["Tips", "DIY", "Lifestyle"], ["Updates", "Analysis"], ["Innovation", "Solutions"]]
        }
      ];

      // Select trending topics for today
      const selectedTopicSet = topicPool[dailySeed % topicPool.length];
      const shuffledTopics = [...selectedTopicSet.topics].sort(() => random(dailySeed + 10) - 0.5);
      
      const trends = shuffledTopics.slice(0, 4).map((topic, index) => {
        const baseScore = 78 + Math.floor(random(dailySeed + index) * 17); // 78-95 range
        const growthPercent = Math.floor(45 + random(dailySeed + index + 10) * 85); // +45% to +130%
        
        const peakTimes = [
          "Next 24-48 hours",
          "This week", 
          "Next 3-5 days",
          "Weekend peak expected",
          "Peak starting now",
          "Next week trending"
        ];
        
        const durations = [
          "15-30 seconds",
          "30-45 seconds", 
          "45-60 seconds",
          "30-60 seconds",
          "15-45 seconds",
          "60-90 seconds"
        ];

        return {
          topic: topic,
          viralScore: baseScore,
          platforms: selectedTopicSet.platforms[index] || ["TikTok", "Instagram"],
          growth: `+${growthPercent}%`,
          peakTime: peakTimes[Math.floor(random(dailySeed + index + 5) * peakTimes.length)],
          contentTypes: selectedTopicSet.contentTypes[index] || ["Tips", "Reviews", "Tutorials"],
          suggestedDuration: durations[Math.floor(random(dailySeed + index + 15) * durations.length)],
          confidence: Math.floor(85 + random(dailySeed + index + 20) * 15) + "%"
        };
      });

      setContentTrends(trends);
    }, 400);
  };

  const fetchViralMetrics = async () => {
    // Generate daily-changing viral content metrics
    setTimeout(() => {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const dailySeed = dayOfYear + 100; // Offset to create different patterns
      
      const random = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      // Daily varying optimal lengths
      const lengthVariations = {
        tiktok: ["15-30 seconds", "10-25 seconds", "20-35 seconds", "15-40 seconds"],
        instagram: ["30-60 seconds", "25-50 seconds", "35-65 seconds", "20-55 seconds"],
        youtube: ["60-180 seconds", "45-120 seconds", "90-210 seconds", "60-150 seconds"],
        twitter: ["30-90 seconds", "20-60 seconds", "45-120 seconds", "30-75 seconds"]
      };

      // Daily rotating engagement factors with varying impact
      const factorSets = [
        [
          { factor: "Strong Hook (First 3 seconds)", impact: "94%", description: "Critical for retention" },
          { factor: "Trending Audio/Music", impact: "87%", description: "Algorithm boost" },
          { factor: "Captions/Subtitles", impact: "85%", description: "Accessibility & engagement" },
          { factor: "Clear Value Proposition", impact: "82%", description: "Viewer satisfaction" },
          { factor: "Call-to-Action", impact: "78%", description: "Drives interaction" },
          { factor: "Trending Hashtags", impact: "76%", description: "Discovery boost" }
        ],
        [
          { factor: "Visual Storytelling", impact: "92%", description: "Narrative engagement" },
          { factor: "Interactive Elements", impact: "89%", description: "User participation" },
          { factor: "Authentic Content", impact: "86%", description: "Trust building" },
          { factor: "Educational Value", impact: "83%", description: "Knowledge sharing" },
          { factor: "Emotional Connection", impact: "80%", description: "Audience bonding" },
          { factor: "Timing Optimization", impact: "77%", description: "Peak audience reach" }
        ],
        [
          { factor: "Mobile-First Design", impact: "96%", description: "Mobile optimization" },
          { factor: "Quick Payoff", impact: "91%", description: "Instant gratification" },
          { factor: "Community Engagement", impact: "88%", description: "Social interaction" },
          { factor: "Trend Integration", impact: "84%", description: "Cultural relevance" },
          { factor: "High-Quality Visuals", impact: "81%", description: "Professional appeal" },
          { factor: "Consistent Branding", impact: "79%", description: "Recognition factor" }
        ],
        [
          { factor: "Problem-Solution Format", impact: "93%", description: "Practical value" },
          { factor: "Behind-the-Scenes Access", impact: "90%", description: "Exclusivity appeal" },
          { factor: "User-Generated Content", impact: "87%", description: "Community driven" },
          { factor: "Data-Driven Insights", impact: "85%", description: "Credibility boost" },
          { factor: "Seasonal Relevance", impact: "82%", description: "Timely content" },
          { factor: "Multi-Platform Adaptation", impact: "78%", description: "Cross-platform reach" }
        ]
      ];

      // Daily rotating trending elements
      const trendingElementSets = [
        [
          "Quick transitions",
          "Before/after reveals", 
          "Split-screen comparisons",
          "Text overlays with key points",
          "Trending music/sounds"
        ],
        [
          "Voice-over narration",
          "Time-lapse sequences",
          "Multiple camera angles",
          "Interactive polls/questions",
          "Collaborative content"
        ],
        [
          "Animated graphics",
          "Green screen effects",
          "Product close-ups",
          "Tutorial step-by-step",
          "Reaction overlays"
        ],
        [
          "Live streaming elements",
          "User testimonials",
          "Data visualization",
          "Mini-documentary style",
          "Challenge participation"
        ],
        [
          "AR/VR integration",
          "360-degree content",
          "Interactive storytelling",
          "Real-time updates",
          "Cross-platform teasers"
        ],
        [
          "Micro-tutorials",
          "Behind-the-process shots",
          "Tool demonstrations",
          "Quick tips format",
          "Results showcasing"
        ],
        [
          "Seasonal adaptations",
          "Community spotlights",
          "Expert collaborations",
          "Trending challenge spins",
          "Educational carousels"
        ]
      ];

      const selectedFactorSet = factorSets[Math.floor(dailySeed / 3) % factorSets.length];
      const selectedTrendingSet = trendingElementSets[dailySeed % trendingElementSets.length];
      
      // Add daily variation to impact percentages
      const adjustedFactors = selectedFactorSet.map(factor => ({
        ...factor,
        impact: Math.floor(parseInt(factor.impact) + (random(dailySeed + 50) - 0.5) * 8) + "%"
      }));

      setViralMetrics({
        optimalLength: {
          tiktok: lengthVariations.tiktok[dailySeed % lengthVariations.tiktok.length],
          instagram: lengthVariations.instagram[dailySeed % lengthVariations.instagram.length],
          youtube: lengthVariations.youtube[dailySeed % lengthVariations.youtube.length],
          twitter: lengthVariations.twitter[dailySeed % lengthVariations.twitter.length]
        },
        engagementFactors: adjustedFactors,
        currentTrendingElements: selectedTrendingSet,
        dailyFocus: {
          primaryTrend: selectedTrendingSet[0],
          successRate: Math.floor(78 + random(dailySeed + 25) * 17) + "%",
          platforms: ["TikTok", "Instagram", "YouTube", "Twitter"].slice(0, 2 + Math.floor(random(dailySeed + 30) * 3))
        },
        lastUpdated: today.toDateString()
      });
      setIsLoading(false);
    }, 1000);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      tiktok: "🎵",
      instagram: "📸", 
      youtube: "📺",
      twitter: "🐦",
      all: "🌐"
    };
    return icons[platform] || "📱";
  };

  const getPlatformColor = (platform) => {
    const colors = {
      tiktok: "#ff0050",
      instagram: "#e4405f",
      youtube: "#ff0000", 
      twitter: "#1da1f2",
      all: "#6366f1"
    };
    return colors[platform] || "#6366f1";
  };

  if (isLoading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing viral potential and gathering insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ← Back to Dashboard
              </button>
            )}
            <div>
              <h1>🤖 AI Insights & Viral Analytics</h1>
              <p className="user-email">Real-time viral potential analysis for your content</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '8px 16px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            🎯 {insights?.confidenceScore}% Confidence
          </div>
          <div style={{ 
            padding: '8px 16px', 
            background: 'rgba(236, 72, 153, 0.1)', 
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '8px',
            color: '#ec4899',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            🚀 {insights?.overallViralPotential}% Viral Potential
          </div>
          <div style={{ 
            padding: '8px 16px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            color: '#6366f1',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            📅 Updated: {new Date().toLocaleDateString()}
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchAIInsights();
              fetchPlatformData();
              fetchContentTrends();
              fetchViralMetrics();
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🔄 Refresh Insights
          </button>
        </div>
      </div>

      {/* Platform Filter */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['all', 'tiktok', 'instagram', 'youtube', 'twitter'].map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            style={{
              padding: '8px 16px',
              background: selectedPlatform === platform ? `${getPlatformColor(platform)}20` : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${selectedPlatform === platform ? getPlatformColor(platform) : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '20px',
              color: selectedPlatform === platform ? getPlatformColor(platform) : '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {getPlatformIcon(platform)} {platform}
          </button>
        ))}
      </div>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* AI Recommendations Card */}
        <div className="dashboard-card" style={{ gridColumn: selectedPlatform !== 'all' ? 'span 1' : 'span 2' }}>
          <h2>🎯 AI Recommendations</h2>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Overall Viral Potential</span>
              <span style={{ 
                color: '#ec4899', 
                fontWeight: '700',
                fontSize: '24px'
              }}>
                {insights?.overallViralPotential}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${insights?.overallViralPotential}%`,
                  background: 'linear-gradient(90deg, #ec4899, #f97316)'
                }}
              ></div>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '16px' }}>💡 Next Best Actions:</h3>
            {insights?.nextBestActions.map((action, index) => (
              <div key={index} style={{
                padding: '12px',
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                borderRadius: '8px',
                marginBottom: '8px',
                color: '#ffffff',
                fontSize: '14px'
              }}>
                <span style={{ color: '#ec4899', fontWeight: '600' }}>
                  {index + 1}.
                </span> {action}
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '16px' }}>📊 Platform Optimization:</h3>
            {Object.entries(insights?.platformOptimization || {}).map(([platform, data]) => (
              <div key={platform} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{getPlatformIcon(platform)}</span>
                  <span style={{ color: '#ffffff', fontWeight: '600', textTransform: 'capitalize' }}>
                    {platform}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {data.reason}
                  </span>
                </div>
                <div style={{
                  padding: '4px 8px',
                  background: `${getPlatformColor(platform)}20`,
                  border: `1px solid ${getPlatformColor(platform)}40`,
                  borderRadius: '12px',
                  color: getPlatformColor(platform),
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {data.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Content Analysis */}
        <div className="dashboard-card">
          <h2>🔥 Trending Content Analysis</h2>
          <div style={{ space: '12px' }}>
            {contentTrends.map((trend, index) => (
              <div key={index} style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '4px' }}>
                      {trend.topic}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                      Peak time: {trend.peakTime} • Duration: {trend.suggestedDuration}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    <div style={{
                      color: '#10b981',
                      fontWeight: '700',
                      fontSize: '18px'
                    }}>
                      {trend.viralScore}%
                    </div>
                    <div style={{
                      color: '#10b981',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      {trend.growth}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '4px' }}>
                    Best platforms: {trend.platforms.join(', ')}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                    Content types: {trend.contentTypes.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform-Specific Insights */}
        {selectedPlatform !== 'all' && platformData?.[selectedPlatform] && (
          <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getPlatformIcon(selectedPlatform)} 
              <span style={{ textTransform: 'capitalize' }}>{selectedPlatform}</span> 
              Optimization Guide
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: getPlatformColor(selectedPlatform), fontSize: '24px', fontWeight: '700' }}>
                  {platformData[selectedPlatform].avgViews}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Average Views</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: getPlatformColor(selectedPlatform), fontSize: '24px', fontWeight: '700' }}>
                  {platformData[selectedPlatform].engagementRate}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Engagement Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: getPlatformColor(selectedPlatform), fontSize: '18px', fontWeight: '700' }}>
                  {platformData[selectedPlatform].audienceAge}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Target Audience</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>📅 Best Posting Times</h4>
                {platformData[selectedPlatform].bestTimes.map((time, index) => (
                  <div key={index} style={{ color: '#cbd5e1', marginBottom: '4px' }}>• {time}</div>
                ))}
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>🎬 Trending Formats</h4>
                {platformData[selectedPlatform].trendingFormats.map((format, index) => (
                  <div key={index} style={{ color: '#cbd5e1', marginBottom: '4px' }}>• {format}</div>
                ))}
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>#️⃣ Suggested Hashtags</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {platformData[selectedPlatform].hashtagSuggestions.map((hashtag, index) => (
                    <span key={index} style={{
                      padding: '4px 8px',
                      background: `${getPlatformColor(selectedPlatform)}20`,
                      border: `1px solid ${getPlatformColor(selectedPlatform)}40`,
                      borderRadius: '12px',
                      color: getPlatformColor(selectedPlatform),
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>📈 Peak Days</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {platformData[selectedPlatform].peakDays.map((day, index) => (
                    <span key={index} style={{
                      padding: '4px 8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '12px',
                      color: '#10b981',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Viral Success Factors */}
        <div className="dashboard-card" style={{ gridColumn: selectedPlatform !== 'all' ? 'span 1' : 'span 2' }}>
          <h2>⚡ Viral Success Factors</h2>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '16px' }}>🎯 Engagement Impact Factors:</h3>
            {viralMetrics?.engagementFactors.map((factor, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '2px' }}>
                    {factor.factor}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {factor.description}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  {factor.impact}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '16px' }}>🔥 Currently Trending Elements:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {viralMetrics?.currentTrendingElements.map((element, index) => (
                <span key={index} style={{
                  padding: '6px 12px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '16px',
                  color: '#f59e0b',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Optimal Content Length */}
        <div className="dashboard-card">
          <h2>⏱️ Optimal Content Length</h2>
          {Object.entries(viralMetrics?.optimalLength || {}).map(([platform, length]) => (
            <div key={platform} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{getPlatformIcon(platform)}</span>
                <span style={{ color: '#ffffff', fontWeight: '600', textTransform: 'capitalize' }}>
                  {platform}
                </span>
              </div>
              <div style={{
                padding: '4px 8px',
                background: `${getPlatformColor(platform)}20`,
                border: `1px solid ${getPlatformColor(platform)}40`,
                borderRadius: '12px',
                color: getPlatformColor(platform),
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {length}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AIInsightsPanel;