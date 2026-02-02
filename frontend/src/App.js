import React, { useState, useEffect } from 'react';
import ClipGenerator from './components/ClipGenerator';
import BatchProcessor from './components/BatchProcessor';
import ApiAccess from './components/ApiAccess';
import PricingSection from './components/PricingSection';
import BusinessFeatures from './components/BusinessFeatures';
import UserDashboard from './components/UserDashboard';
import AuthModal from './components/AuthModal';
import NotificationsPanel from './components/NotificationsPanel';
import DocumentationPanel from './components/DocumentationPanel';
import SupportPanel from './components/SupportPanel';
// Removed AccountInbox component - using direct email replies instead
import AIInsightsPanel from './components/AIInsightsPanel';
import PlanDetailsPanel from './components/PlanDetailsPanel';
import { UserProvider, useUser } from './contexts/UserContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProcessingProvider } from './contexts/ProcessingContext';
import CurrencySelector from './components/CurrencySelector';
import ProcessingIndicator from './components/ProcessingIndicator';
import { useProcessing } from './contexts/ProcessingContext';
import './App.css';

const AppContent = () => {
  const { user } = useUser();
  const { processingState } = useProcessing();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationHistory, setNavigationHistory] = useState(['dashboard']);

  // Enhanced navigation with browser-like back button functionality
  const handleNavigateToApp = (section) => {
    setNavigationHistory(prev => [...prev, section]);
    setCurrentView(section);
    
    // Update browser URL without page refresh for better UX
    if (window.history && window.history.pushState) {
      window.history.pushState({ section }, '', `/${section}`);
    }
  };

  const handleBackToDashboard = () => {
    setNavigationHistory(prev => [...prev, 'dashboard']);
    setCurrentView('dashboard');
    
    // Update browser URL
    if (window.history && window.history.pushState) {
      window.history.pushState({ section: 'dashboard' }, '', '/dashboard');
    }
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.section) {
        setCurrentView(event.state.section);
      } else {
        // If no state, determine from URL
        const path = window.location.pathname.substring(1) || 'dashboard';
        setCurrentView(path);
      }
    };

    // Set initial URL state
    const initialPath = window.location.pathname.substring(1) || 'dashboard';
    if (initialPath !== 'dashboard') {
      setCurrentView(initialPath);
    }
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Custom back function that uses navigation history
  const handleCustomBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1] || 'dashboard';
      setNavigationHistory(newHistory);
      setCurrentView(previousPage);
      
      // Update browser URL
      if (window.history && window.history.pushState) {
        window.history.pushState({ section: previousPage }, '', `/${previousPage}`);
      }
    } else {
      handleBackToDashboard();
    }
  };

  // If user is authenticated, show dashboard or app sections
  if (user.isAuthenticated) {
    if (currentView === 'dashboard') {
      return <UserDashboard onNavigateToApp={handleNavigateToApp} />;
    }

    // Render specific app sections based on currentView
    return (
      <div className="App">
        <ProcessingIndicator onNavigateToProcessor={handleNavigateToApp} />
        <div className="app-container">
          <header className="header">
            <div className="header-content">
              <div className="logo">
                <div className="logo-icon">🎬</div>
                <h1 className="logo-text">VlogClip AI</h1>
              </div>
              <div className="tagline">
                Welcome back, {user.username}!
              </div>
            </div>
            <button 
              className={`back-to-dashboard-btn ${processingState.isProcessing ? 'processing' : ''}`}
              onClick={handleBackToDashboard}
              title="Return to Dashboard"
            >
              ← Dashboard
              {processingState.isProcessing && (
                <div className="processing-dot"></div>
              )}
            </button>
            <div className="header-gradient"></div>
          </header>

          <main className="main-content">
            {currentView === 'generator' && <ClipGenerator />}
            {currentView === 'batch' && <BatchProcessor />}
            {currentView === 'analytics' && <BusinessFeatures />}
            {currentView === 'api' && <ApiAccess />}
            {currentView === 'notifications' && <NotificationsPanel />}
            {currentView === 'documentation' && <DocumentationPanel />}
            {currentView === 'support' && <SupportPanel />}
            {/* Removed inbox view - using direct email replies instead */}
            {currentView === 'ai-insights' && <AIInsightsPanel onBack={handleCustomBack} />}
            {currentView === 'plan-free' && <PlanDetailsPanel plan="free" />}
            {currentView === 'plan-pro' && <PlanDetailsPanel plan="pro" />}
            {currentView === 'plan-business' && <PlanDetailsPanel plan="business" />}
          </main>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the landing page with login option
  return (
    <>
      <div className="App">
        <div className="app-container">
          <header className="header">
            <div className="header-content">
              <div className="logo">
                <div className="logo-icon">🎬</div>
                <h1 className="logo-text">VlogClip AI</h1>
              </div>
              <div className="tagline">
                Turn your content into viral moments
              </div>
            </div>
            
            {/* Prominent Currency Selector */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1000
            }}>
              <CurrencySelector />
            </div>
            
            <div className="header-gradient"></div>
          </header>

          <main className="main-content">
            <div className="hero-section">
              <h2 className="hero-title">
                Create <span className="gradient-text">viral clips</span> from your videos
              </h2>
              <p className="hero-subtitle">
                AI-powered highlight generation for TikTok, Twitter, LinkedIn, and Instagram
              </p>
              
              <div style={{
                maxWidth: '600px',
                margin: '24px auto',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  color: '#ffffff', 
                  marginBottom: '12px', 
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  ✨ Perfect for Content Creators & Influencers
                </h3>
                <p style={{ 
                  color: '#cbd5e1', 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  Don't have time to find viral moments in your long-form videos? Let VlogClip AI automatically identify and extract the most engaging clips for you to use straight away on your platform of choice.
                </p>
              </div>
              
              <div className="explanation-section">
                <div className="explanation-card">
                  <h3>🎯 How It Works</h3>
                  <div className="steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <div className="step-content">
                        <strong>Paste YouTube URL</strong>
                        <p>Enter any YouTube video URL to get started</p>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">2</span>
                      <div className="step-content">
                        <strong>AI Analysis</strong>
                        <p>OpenAI Whisper transcribes audio, GPT-4 finds viral moments</p>
                      </div>
                    </div>
                    <div className="step">
                      <span className="step-number">3</span>
                      <div className="step-content">
                        <strong>Get Viral Clips</strong>
                        <p>Download ready-to-post clips with platform-specific captions</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="platforms-showcase">
                  <h3>📱 Optimized For All Platforms</h3>
                  <div className="platforms-grid">
                    <div className="platform-item tiktok">
                      <span className="platform-icon">🎵</span>
                      <span className="platform-name">TikTok</span>
                    </div>
                    <div className="platform-item twitter">
                      <span className="platform-icon">🐦</span>
                      <span className="platform-name">Twitter</span>
                    </div>
                    <div className="platform-item linkedin">
                      <span className="platform-icon">💼</span>
                      <span className="platform-name">LinkedIn</span>
                    </div>
                    <div className="platform-item instagram">
                      <span className="platform-icon">📸</span>
                      <span className="platform-name">Instagram</span>
                    </div>
                  </div>
                </div>
                
                {/* Prominent Sign In CTA */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '40px',
                  padding: '20px'
                }}>
                  <button 
                    className="hero-signin-btn"
                    onClick={() => setShowAuthModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 25%, #ff8e53 50%, #ff6b9d 75%, #c44569 100%)',
                      border: 'none',
                      borderRadius: '50px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '20px',
                      padding: '18px 45px',
                      boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4), 0 0 40px rgba(255, 107, 107, 0.2)',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0) scale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-4px) scale(1.05)';
                      e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.6), 0 0 60px rgba(255, 107, 107, 0.3)';
                      e.target.style.background = 'linear-gradient(135deg, #ff8a80 0%, #ff5722 25%, #ff9800 50%, #e91e63 75%, #9c27b0 100%)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4), 0 0 40px rgba(255, 107, 107, 0.2)';
                      e.target.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 25%, #ff8e53 50%, #ff6b9d 75%, #c44569 100%)';
                    }}
                  >
                    ✨ Sign In & Get Started ✨
                  </button>
                  <p style={{
                    marginTop: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    Join thousands creating viral content daily
                  </p>
                </div>
              </div>
            </div>
            
            {/* Protected components removed - only accessible after authentication */}
          </main>

          <PricingSection />

          <footer className="footer">
            <div className="footer-content">
              <p>© 2024 VlogClip AI - Powered by OpenAI & FFmpeg</p>
              <div className="social-links">
                <span className="social-link">📱 TikTok Ready</span>
                <span className="social-link">🐦 Twitter Optimized</span>
                <span className="social-link">💼 LinkedIn Perfect</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

function App() {
  return (
    <CurrencyProvider>
      <ProcessingProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ProcessingProvider>
    </CurrencyProvider>
  );
}

export default App;