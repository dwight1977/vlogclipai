import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';
import './PricingSection.css';

const PricingSection = () => {
  const { user, upgradeToPlan } = useUser();
  const { formatPrice } = useCurrency();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [spotsLeft, setSpotsLeft] = useState(47); // Dynamic scarcity number
  const [liveActivity, setLiveActivity] = useState([]);

  const plans = {
    starter: {
      name: "Free Tier",
      description: "Perfect for trying out VlogClip AI with your first videos",
      monthly: { price: 0, clips: 3, videos: 1 },
      yearly: { price: 0, clips: 3, videos: 1, savings: "Always Free" },
      features: [
        "3 viral clips per day",
        "1 YouTube video per month",
        "AI hotspot detection",
        "4 platform captions (TikTok, Twitter, LinkedIn, Instagram)",
        "Standard video quality",
        "Download clips",
        "Community support"
      ],
      color: "from-blue-500 to-purple-600",
      popular: false
    },
    pro: {
      name: "Creator Pro",
      description: "For serious creators who need more viral content",
      monthly: { price: 3.99, clips: "unlimited", videos: "unlimited" },
      yearly: { price: 3.19, clips: "unlimited", videos: "unlimited", savings: "20%" },
      features: [
        "Unlimited viral clips",
        "Unlimited YouTube videos", 
        "Advanced AI hotspot detection",
        "4 platform captions",
        "High-quality video processing",
        "Instant downloads",
        "Priority processing",
        "Email support",
        "No watermarks",
        "Faster processing"
      ],
      color: "from-orange-500 to-red-600",
      popular: true,
      badge: "MOST POPULAR"
    },
    agency: {
      name: "Business",
      description: "For agencies and businesses managing multiple creators",
      monthly: { price: 8.99, clips: "unlimited", videos: "unlimited" },
      yearly: { price: 7.19, clips: "unlimited", videos: "unlimited", savings: "20%" },
      features: [
        "Everything in Creator Pro",
        "Commercial usage rights",
        "Bulk video processing",
        "Custom clip duration",
        "Priority support",
        "Usage analytics",
        "Team sharing features",
        "Extended video length support",
        "API access (coming soon)",
        "White-label options (coming soon)"
      ],
      color: "from-purple-600 to-pink-600",
      popular: false,
      badge: "BUSINESS"
    }
  };

  const getPrice = (plan) => {
    return billingCycle === 'yearly' ? plan.yearly.price : plan.monthly.price;
  };

  const calculateSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.yearly.savings) {
      const monthlyCost = plan.monthly.price * 12;
      const yearlyCost = plan.yearly.price * 12;
      const saved = monthlyCost - yearlyCost;
      return saved;
    }
    return 0;
  };

  // Generate dynamic live activity with correct tiers and currencies
  const generateLiveActivity = () => {
    const currentTime = new Date();
    const timeSlot = Math.floor(currentTime.getMinutes() / 30); // 0 or 1 for 30min rotation
    const seed = Math.floor(currentTime.getTime() / (1000 * 60 * 30)); // Changes every 30 mins
    
    // Random but consistent names for each 30-min slot
    const names = [
      'Sarah K.', 'Mike R.', 'Alex M.', 'Emma W.', 'Jack L.', 'Sophie T.',
      'Ryan B.', 'Lisa C.', 'Tom H.', 'Nina P.', 'Chris D.', 'Maya S.'
    ];
    
    // Correct tier names
    const tierNames = ['Free Tier', 'Creator Pro', 'Business'];
    
    // Multi-currency support
    const currencies = [
      { symbol: '£', name: 'British Pounds', multiplier: 1 },
      { symbol: '€', name: 'Euros', multiplier: 1.12 },
      { symbol: '$', name: 'US Dollars', multiplier: 1.27 }
    ];
    
    // Activity templates - accurate to VlogClip AI product features
    const activityTemplates = [
      {
        icon: '🎉',
        template: (name, tier, currency) => `<strong>${name}</strong> just upgraded to ${tier}`,
        timeRange: [1, 8]
      },
      {
        icon: '🚀', 
        template: (name) => `<strong>${name}</strong> created ${Math.floor(Math.random() * 3 + 3)} viral clips from YouTube videos`,
        timeRange: [2, 12]
      },
      {
        icon: '💰',
        template: (name, tier, currency) => {
          const savings = tier === 'Business' ? Math.floor(85 * currency.multiplier) : 
                         tier === 'Creator Pro' ? Math.floor(48 * currency.multiplier) : 
                         Math.floor(25 * currency.multiplier);
          return `<strong>${name}</strong> saved ${currency.symbol}${savings} with yearly plan`;
        },
        timeRange: [3, 15]
      },
      {
        icon: '📱',
        template: (name) => `<strong>${name}</strong> used batch processing for ${Math.floor(Math.random() * 4 + 2)} YouTube videos`,
        timeRange: [1, 10]
      },
      {
        icon: '📊',
        template: (name) => `<strong>${name}</strong> viewed business analytics dashboard`,
        timeRange: [2, 8]
      },
      {
        icon: '🎯',
        template: (name) => `<strong>${name}</strong> used AI hotspot detection for viral clips`,
        timeRange: [1, 6]
      },
      {
        icon: '⏱️',
        template: (name) => {
          const durations = ['15s', '20s', '30s', '60s'];
          const duration = durations[Math.floor(Math.random() * durations.length)];
          return `<strong>${name}</strong> generated ${duration} clips for TikTok and Instagram`;
        },
        timeRange: [2, 9]
      },
      {
        icon: '🌟',
        template: (name) => `<strong>${name}</strong> downloaded clips optimized for 4 social platforms`,
        timeRange: [1, 7]
      }
    ];
    
    // Generate seeded random number
    const seededRandom = (seed, index) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate 3 activities for this 30-minute slot
    const activities = [];
    for (let i = 0; i < 3; i++) {
      const nameIndex = Math.floor(seededRandom(seed, i) * names.length);
      const templateIndex = Math.floor(seededRandom(seed, i + 10) * activityTemplates.length);
      const tierIndex = Math.floor(seededRandom(seed, i + 20) * tierNames.length);
      const currencyIndex = Math.floor(seededRandom(seed, i + 30) * currencies.length);
      
      const template = activityTemplates[templateIndex];
      const name = names[nameIndex];
      const tier = tierNames[tierIndex];
      const currency = currencies[currencyIndex];
      
      const minTime = template.timeRange[0];
      const maxTime = template.timeRange[1];
      const timeAgo = Math.floor(seededRandom(seed, i + 40) * (maxTime - minTime) + minTime);
      
      activities.push({
        icon: template.icon,
        text: template.template(name, tier, currency),
        time: `${timeAgo} min ago`
      });
    }
    
    return activities;
  };

  // Update live activity every 30 minutes
  useEffect(() => {
    const updateActivity = () => {
      setLiveActivity(generateLiveActivity());
    };
    
    // Initial load
    updateActivity();
    
    // Set up interval to update every 30 minutes
    const activityTimer = setInterval(updateActivity, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(activityTimer);
  }, []);

  // Flash sale countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay.getTime() - now.getTime();
      
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate decreasing spots (psychological pressure)
  useEffect(() => {
    const spotsTimer = setInterval(() => {
      setSpotsLeft(prev => {
        if (prev > 12 && Math.random() < 0.3) { // 30% chance to decrease every 30 seconds
          return prev - 1;
        }
        return prev;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(spotsTimer);
  }, []);

  const handlePlanSelection = (planKey) => {
    if (planKey === 'starter') {
      // Free plan - immediate activation
      upgradeToPlan('starter');
      alert('🎉 Free tier activated! You can now generate 3 clips per day.');
    } else if (planKey === 'pro') {
      // Pro plan - simulate payment
      if (window.confirm(`Upgrade to Creator Pro for ${formatPrice(3.99)}/month? (This is a demo - no real payment required)`)) {
        upgradeToPlan('pro');
        alert('🚀 Creator Pro activated! You now have unlimited clips and videos.');
      }
    } else if (planKey === 'agency') {
      // Business plan - simulate payment
      if (window.confirm(`Upgrade to Business plan for ${formatPrice(8.99)}/month? (This is a demo - no real payment required)`)) {
        upgradeToPlan('business');
        alert('💼 Business plan activated! You now have access to all features including analytics, bulk processing, and commercial rights.');
      }
    }
  };

  return (
    <div className="pricing-section">
      {/* Flash Sale Banner */}
      <div className="flash-sale-banner">
        <div className="sale-content">
          <div className="sale-badge">🔥 FLASH SALE</div>
          <div className="sale-text">
            <strong>FREE TIER + 50% OFF Pro</strong> - Limited Time!
          </div>
          <div className="countdown-timer">
            <div className="timer-label">Sale ends in:</div>
            <div className="timer-display">
              <span className="time-unit">
                <strong>{String(timeLeft.hours).padStart(2, '0')}</strong>
                <small>hours</small>
              </span>
              <span className="timer-colon">:</span>
              <span className="time-unit">
                <strong>{String(timeLeft.minutes).padStart(2, '0')}</strong>
                <small>min</small>
              </span>
              <span className="timer-colon">:</span>
              <span className="time-unit">
                <strong>{String(timeLeft.seconds).padStart(2, '0')}</strong>
                <small>sec</small>
              </span>
            </div>
          </div>
          <div className="spots-remaining">
            Only <span className="spots-count">{spotsLeft}</span> spots left at this price!
          </div>
        </div>
      </div>

      <div className="pricing-header">
        <h2 className="pricing-title">
          <span className="pricing-emoji">💰</span>
          Choose Your Viral Success Plan
        </h2>
        <p className="pricing-subtitle">
          Transform any YouTube video into viral social media gold with AI-powered hotspot detection
        </p>
        
        {/* Billing Toggle */}
        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
          <button 
            className="toggle-switch"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          >
            <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : 'monthly'}`}></div>
          </button>
          <span className={billingCycle === 'yearly' ? 'active' : ''}>
            Yearly <span className="savings-badge">Save 21%</span>
          </span>
        </div>
      </div>

      <div className="pricing-grid">
        {Object.entries(plans).map(([key, plan]) => {
          const savings = calculateSavings(plan);
          
          return (
            <div key={key} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.badge && (
                <div className="plan-badge">{plan.badge}</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-pricing">
                <div className="price-container">
                  <span className="price">{formatPrice(getPrice(plan))}</span>
                  <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'mo'}</span>
                </div>
                
                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="savings-info">
                    <span className="savings-text">Save {formatPrice(savings)}/year</span>
                    <span className="billed-text">Billed annually</span>
                  </div>
                )}
                
                {billingCycle === 'monthly' && (
                  <div className="billed-text">Billed monthly</div>
                )}
              </div>

              <div className="plan-stats">
                <div className="stat-item">
                  <span className="stat-number">{plan[billingCycle].clips}</span>
                  <span className="stat-label">Viral Clips/Month</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{plan[billingCycle].videos}</span>
                  <span className="stat-label">Video Uploads/Month</span>
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-check">✅</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`plan-button ${plan.popular ? 'popular-button' : ''} ${(user.plan === key || (key === 'agency' && user.plan === 'business')) ? 'current-plan' : ''}`}
                onClick={() => handlePlanSelection(key)}
                disabled={user.plan === key || (key === 'agency' && user.plan === 'business')}
              >
                <span className="button-text">
                  {(user.plan === key || (key === 'agency' && user.plan === 'business')) ? 'Current Plan' : 
                   key === 'starter' ? 'Start Free' : 
                   plan.popular ? 'Get 50% OFF' : 'Upgrade Now'}
                </span>
                <span className="button-icon">
                  {(user.plan === key || (key === 'agency' && user.plan === 'business')) ? '✅' : '🚀'}
                </span>
                {plan.popular && !(user.plan === key || (key === 'agency' && user.plan === 'business')) && (
                  <div className="button-urgency">
                    <span className="urgency-text">⚡ {spotsLeft} spots left</span>
                  </div>
                )}
              </button>

            </div>
          );
        })}
      </div>

      {/* Live Activity Feed */}
      <div className="live-activity">
        <div className="activity-header">
          <span className="live-indicator">🔴 LIVE</span>
          <span className="activity-title">Real-time activity</span>
        </div>
        <div className="activity-feed">
          {liveActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-icon">{activity.icon}</span>
              <span 
                className="activity-text" 
                dangerouslySetInnerHTML={{ __html: `${activity.text} - <em>${activity.time}</em>` }}
              ></span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div className="social-proof">
        <div className="proof-stats">
          <div className="proof-stat">
            <span className="proof-number">2.5K+</span>
            <span className="proof-label">Viral clips created</span>
          </div>
          <div className="proof-stat">
            <span className="proof-number">450+</span>
            <span className="proof-label">Content creators</span>
          </div>
          <div className="proof-stat">
            <span className="proof-number">150K+</span>
            <span className="proof-label">Views generated</span>
          </div>
          <div className="proof-stat">
            <span className="proof-number">{spotsLeft}</span>
            <span className="proof-label">Flash sale spots remaining</span>
          </div>
        </div>
        
        <div className="testimonials">
          <div className="testimonial">
            <p>"VlogClip AI helped me find the best moments in my YouTube videos. Much faster than doing it manually!"</p>
            <span className="testimonial-author">- Sarah K, Content Creator</span>
          </div>
          <div className="testimonial">
            <p>"The AI hotspot detection actually works. Saved me hours of editing time."</p>
            <span className="testimonial-author">- Mike R, YouTuber</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How does AI hotspot detection work?</h4>
            <p>Our AI analyzes video duration, transcript content, and identifies opening hooks, mid-video peaks, and climactic moments to automatically create 3 engaging clips from your YouTube videos.</p>
          </div>
          <div className="faq-item">
            <h4>What's included in the free tier?</h4>
            <p>The free tier lets you generate 3 clips per day from up to 1 YouTube video per month. Perfect for testing VlogClip AI before upgrading.</p>
          </div>
          <div className="faq-item">
            <h4>What video platforms do you support?</h4>
            <p>We support YouTube video input and generate captions optimized for TikTok, Instagram, Twitter, and LinkedIn. Currently working on expanding to more input sources.</p>
          </div>
          <div className="faq-item">
            <h4>Do I keep my clips after downloading?</h4>
            <p>Yes! Once you download clips, they're yours to keep. We recommend downloading immediately as server storage is temporary.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;