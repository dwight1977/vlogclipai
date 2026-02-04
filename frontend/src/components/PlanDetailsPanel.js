import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';
import './UserDashboard.css';

const PlanDetailsPanel = ({ plan }) => {
  const { user } = useUser();
  const { formatPrice } = useCurrency();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(plan);

  const planDetails = {
    free: {
      name: 'Free Tier',
      tagline: 'Perfect for getting started',
      icon: '💫',
      color: '#6b7280',
      price: { monthly: 0, annual: 0 },
      features: [
        '1 video per month',
        '3 clips per day',
        'Standard quality (720p)',
        'Basic support',
        'Watermarked exports',
        'Community access'
      ],
      limits: {
        videos: '1/month',
        clips: '3/day',
        storage: '1 GB',
        bandwidth: '10 GB/month'
      },
      description: 'Get started with VlogClip AI and create your first viral clips. Perfect for individuals trying out the platform.',
      ctaText: 'Current Plan',
      ctaAction: 'current'
    },
    pro: {
      name: 'Pro Plan',
      tagline: 'For serious content creators',
      icon: '🚀',
      color: '#8b5cf6',
      price: { monthly: 7, annual: 72 },
      features: [
        'Unlimited videos',
        'Unlimited clips',
        'High quality export (1080p)',
        'High Quality Processing',
        'Priority support',
        'No watermarks',
        'Bulk processing',
        'Advanced AI models',
        'Custom clip duration',
        'Analytics dashboard',
        'API access (100 req/hour)'
      ],
      limits: {
        videos: 'Unlimited',
        clips: 'Unlimited',
        bandwidth: '1 TB/month'
      },
      description: 'Unlock unlimited video processing with advanced features. Perfect for content creators and small businesses.',
      ctaText: user.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaAction: user.plan === 'pro' ? 'current' : 'upgrade'
    },
    business: {
      name: 'Business Plan',
      tagline: 'For teams and enterprises',
      icon: '🏢',
      color: '#10b981',
      price: { monthly: 23, annual: 216 },
      features: [
        'Everything in Pro',
        'Advanced analytics',
        'Commercial rights',
        'Team collaboration (10 users)',
        'White-label options',
        'Priority processing queue',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee (99.9%)',
        'API access (1000 req/hour)',
        'Webhook support',
        'Custom branding',
        'High Quality Processing',
        'Premium video quality'
      ],
      limits: {
        videos: 'Unlimited',
        clips: 'Unlimited',
        bandwidth: '5 TB/month'
      },
      description: 'Enterprise-grade solution with advanced features, team collaboration, and dedicated support.',
      ctaText: user.plan === 'business' ? 'Current Plan' : 'Upgrade to Business',
      ctaAction: user.plan === 'business' ? 'current' : 'upgrade'
    }
  };

  const currentPlan = planDetails[selectedPlan];
  const isCurrentPlan = user.plan === selectedPlan;
  const isUpgrade = user.plan === 'free' && selectedPlan !== 'free' || user.plan === 'pro' && selectedPlan === 'business';
  const isDowngrade = user.plan === 'business' && selectedPlan !== 'business' || user.plan === 'pro' && selectedPlan === 'free';

  const handleAction = async () => {
    if (isCurrentPlan) {
      return;
    } else if (isUpgrade) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            planType: selectedPlan,
            billingPeriod: billingCycle
          })
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Failed to start checkout.');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
      }
    } else if (isDowngrade) {
      alert('Please contact support to downgrade.');
    }
  };


  const handlePlanClick = (planKey) => {
    setSelectedPlan(planKey);
  };

  const getActionButtonStyle = () => {
    if (isCurrentPlan) {
      return {
        background: `linear-gradient(135deg, ${currentPlan.color}20 0%, ${currentPlan.color}10 100%)`,
        border: `2px solid ${currentPlan.color}40`,
        color: currentPlan.color,
        cursor: 'default'
      };
    } else if (isUpgrade) {
      return {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: '2px solid rgba(16, 185, 129, 0.4)',
        color: '#ffffff',
        cursor: 'pointer'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        border: '2px solid rgba(107, 114, 128, 0.4)',
        color: '#ffffff',
        cursor: 'pointer'
      };
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>{currentPlan.icon} {currentPlan.name}</h1>
          <p className="user-email">{currentPlan.tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isCurrentPlan && (
            <div style={{ 
              padding: '8px 16px', 
              background: `${currentPlan.color}20`, 
              border: `1px solid ${currentPlan.color}40`,
              borderRadius: '8px',
              color: currentPlan.color,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              ✅ Your Current Plan
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', position: 'relative', zIndex: 1 }}>
        {/* Main Plan Details */}
        <div>
          {/* Pricing Card */}
          <div className="dashboard-card" style={{
            background: `linear-gradient(135deg, ${currentPlan.color}10 0%, ${currentPlan.color}05 100%)`,
            border: `1px solid ${currentPlan.color}20`,
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {currentPlan.icon}
              </div>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '700',
                background: `linear-gradient(135deg, ${currentPlan.color} 0%, ${currentPlan.color}CC 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
              }}>
                {currentPlan.name}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '20px' }}>
                {currentPlan.description}
              </p>
              
              {currentPlan.price.monthly > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      style={{
                        padding: '8px 16px',
                        background: billingCycle === 'monthly' ? `${currentPlan.color}20` : 'transparent',
                        border: `1px solid ${billingCycle === 'monthly' ? currentPlan.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: billingCycle === 'monthly' ? currentPlan.color : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      style={{
                        padding: '8px 16px',
                        background: billingCycle === 'annual' ? `${currentPlan.color}20` : 'transparent',
                        border: `1px solid ${billingCycle === 'annual' ? currentPlan.color : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: billingCycle === 'annual' ? currentPlan.color : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Annual (Save 17%)
                    </button>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '48px',
                      fontWeight: '800',
                      color: '#ffffff'
                    }}>
                      {formatPrice(billingCycle === 'monthly' ? currentPlan.price.monthly : Math.floor(currentPlan.price.annual / 12))}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '16px' }}>
                      /month
                    </span>
                    {billingCycle === 'annual' && (
                      <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>
                        {formatPrice(currentPlan.price.annual)} billed annually
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentPlan.price.monthly === 0 && (
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: '#ffffff'
                  }}>
                    Free
                  </span>
                  <div style={{ color: '#94a3b8', fontSize: '16px', marginTop: '4px' }}>
                    No credit card required
                  </div>
                </div>
              )}

              <button
                onClick={handleAction}
                disabled={isCurrentPlan}
                style={{
                  ...getActionButtonStyle(),
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseOver={(e) => {
                  if (!isCurrentPlan) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = isUpgrade ? 
                      '0 8px 25px rgba(16, 185, 129, 0.4)' : 
                      '0 8px 25px rgba(107, 114, 128, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isCurrentPlan) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {isCurrentPlan ? '✅ Current Plan' : 
                 isUpgrade ? `🚀 Upgrade to ${currentPlan.name}` :
                 `👁️ View ${currentPlan.name}`}
              </button>
            </div>
          </div>

          {/* Features List */}
          <div className="dashboard-card">
            <h2>✨ Features Included</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              {currentPlan.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: `linear-gradient(135deg, ${currentPlan.color} 0%, ${currentPlan.color}CC 100%)`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <span style={{ color: '#e2e8f0', fontWeight: '500' }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Usage Limits */}
          <div className="dashboard-card">
            <h2>📊 Usage Limits</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(currentPlan.limits).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                    {key}
                  </span>
                  <span style={{ 
                    color: value === 'Unlimited' ? '#10b981' : '#ffffff', 
                    fontWeight: '600' 
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="dashboard-card">
            <h2>🔄 Other Plans</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(planDetails).map(([planKey, planInfo]) => {
                if (planKey === selectedPlan) return null;
                const isPlanActive = user.plan === planKey;
                const isSelected = selectedPlan === planKey;
                return (
                  <button
                    key={planKey}
                    onClick={() => handlePlanClick(planKey)}
                    style={{
                      padding: '12px',
                      background: isPlanActive ? `${planInfo.color}20` : isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isPlanActive ? planInfo.color : isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      color: isPlanActive ? planInfo.color : isSelected ? '#ffffff' : '#e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      fontSize: '14px'
                    }}
                    onMouseOver={(e) => {
                      if (!isPlanActive && !isSelected) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isPlanActive && !isSelected) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{planInfo.icon}</span>
                      <span style={{ fontWeight: '600' }}>{planInfo.name}</span>
                      {isPlanActive && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✅ Current</span>}
                      {isSelected && !isPlanActive && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>👁️ Viewing</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Support Info */}
          <div className="dashboard-card">
            <h2>💬 Need Help?</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              Questions about this plan? Our team is here to help.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => window.open('mailto:vlogclipai@outlook.com', '_blank')}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                📧 Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPanel;