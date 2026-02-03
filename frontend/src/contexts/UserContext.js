import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// 🛡️ NINA: Advanced device fingerprinting system
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('VlogClip fingerprint', 2, 2);
  
  // NINA: Safely access screen object to avoid ESLint errors
  const screenInfo = window.screen || {};
  
  return {
    screen: `${screenInfo.width || 0}x${screenInfo.height || 0}x${screenInfo.colorDepth || 0}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    canvas: canvas.toDataURL(),
    memory: navigator.deviceMemory || 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown',
    touchPoints: navigator.maxTouchPoints || 0
  };
};

// NINA: Enhanced persistent storage across browsers
const createPersistentId = () => {
  const storageKey = 'vlogclip_device_id';
  
  // Try multiple storage methods
  let deviceId = localStorage.getItem(storageKey) || 
                 sessionStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 15);
    
    // Store in multiple places
    try {
      localStorage.setItem(storageKey, deviceId);
      sessionStorage.setItem(storageKey, deviceId);
      
      // Also create a more persistent identifier
      const fingerprint = generateDeviceFingerprint();
      localStorage.setItem('vlogclip_fingerprint', JSON.stringify(fingerprint));
    } catch (e) {
      console.warn('🛡️ NINA: Storage limited, using session-only tracking');
    }
  }
  
  return deviceId;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    plan: 'free', // free, pro, business
    isAuthenticated: false,
    userId: null,
    email: null,
    username: null,
    deviceId: null,
    deviceFingerprint: null,
    usage: {
      clipsToday: 0,
      videosThisMonth: 0,
      lastResetDate: new Date().toDateString(),
      lastMonthlyReset: new Date().getMonth()
    }
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    // NINA: Initialize device fingerprinting
    const deviceId = createPersistentId();
    const deviceFingerprint = generateDeviceFingerprint();
    
    console.log('🛡️ NINA: Device security initialized', { 
      deviceId: deviceId.substring(0, 20) + '...', 
      fingerprintKeys: Object.keys(deviceFingerprint) 
    });
    
    // Check for authentication token
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token and load user data
      verifyTokenAndLoadUser(token, deviceId, deviceFingerprint);
    } else {
      // Load anonymous user data or create new anonymous user
      const savedUser = localStorage.getItem('vlogclip_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Reset daily count if it's a new day
        const today = new Date().toDateString();
        if (userData.usage?.lastResetDate !== today) {
          userData.usage.clipsToday = 0;
          userData.usage.lastResetDate = today;
        }
        
        // Reset monthly count if it's a new month
        const currentMonth = new Date().getMonth();
        if (userData.usage?.lastMonthlyReset !== currentMonth) {
          userData.usage.videosThisMonth = 0;
          userData.usage.lastMonthlyReset = currentMonth;
        }
        
        // NINA: Update security tracking
        userData.deviceId = deviceId;
        userData.deviceFingerprint = deviceFingerprint;
        userData.isAuthenticated = false;
        
        setUser(userData);
      } else {
        // Generate anonymous user ID for free tier with enhanced tracking
        const anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
          plan: 'free',
          isAuthenticated: false,
          userId: anonymousId,
          email: null,
          username: null,
          deviceId: deviceId,
          deviceFingerprint: deviceFingerprint,
          usage: {
            clipsToday: 0,
            videosThisMonth: 0,
            lastResetDate: new Date().toDateString(),
            lastMonthlyReset: new Date().getMonth()
          }
        };
        setUser(newUser);
        localStorage.setItem('vlogclip_user', JSON.stringify(newUser));
      }
    }
  }, []);

  // Verify token and load authenticated user data
  const verifyTokenAndLoadUser = async (token, deviceId, deviceFingerprint) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const authenticatedUser = {
          ...data.user,
          isAuthenticated: true,
          deviceId: deviceId,
          deviceFingerprint: deviceFingerprint,
          usage: {
            clipsToday: 0,
            videosThisMonth: data.user.metadata?.monthlyUsage || 0,
            lastResetDate: new Date().toDateString(),
            lastMonthlyReset: new Date().getMonth()
          }
        };
        setUser(authenticatedUser);
        localStorage.setItem('vlogclip_user', JSON.stringify(authenticatedUser));
      } else {
        // Token is invalid, remove it and fall back to anonymous user
        localStorage.removeItem('auth_token');
        createAnonymousUser(deviceId, deviceFingerprint);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      createAnonymousUser(deviceId, deviceFingerprint);
    }
  };

  const createAnonymousUser = (deviceId, deviceFingerprint) => {
    const anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      plan: 'free',
      isAuthenticated: false,
      userId: anonymousId,
      email: null,
      username: null,
      deviceId: deviceId,
      deviceFingerprint: deviceFingerprint,
      usage: {
        clipsToday: 0,
        videosThisMonth: 0,
        lastResetDate: new Date().toDateString(),
        lastMonthlyReset: new Date().getMonth()
      }
    };
    setUser(newUser);
    localStorage.setItem('vlogclip_user', JSON.stringify(newUser));
  };

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user.userId) {
      localStorage.setItem('vlogclip_user', JSON.stringify(user));
    }
  }, [user]);

  const upgradeToPlan = (planName) => {
    setUser(prev => ({
      ...prev,
      plan: planName,
      isAuthenticated: true
    }));
  };

  const incrementClipUsage = () => {
    setUser(prev => ({
      ...prev,
      usage: {
        ...prev.usage,
        clipsToday: prev.usage.clipsToday + 3 // Each generation creates 3 clips
      }
    }));
  };

  const incrementVideoUsage = () => {
    setUser(prev => ({
      ...prev,
      usage: {
        ...prev.usage,
        videosThisMonth: prev.usage.videosThisMonth + 1
      }
    }));
  };

  const checkUsageLimits = () => {
    const limits = {
      free: { clipsPerDay: 3, videosPerMonth: 1 },
      pro: { clipsPerDay: Infinity, videosPerMonth: Infinity },
      business: { clipsPerDay: Infinity, videosPerMonth: Infinity }
    };

    const userLimits = limits[user.plan] || limits.free;
    
    return {
      canGenerateClips: user.usage.clipsToday < userLimits.clipsPerDay,
      canProcessVideo: user.usage.videosThisMonth < userLimits.videosPerMonth,
      remainingClips: Math.max(0, userLimits.clipsPerDay - user.usage.clipsToday),
      remainingVideos: Math.max(0, userLimits.videosPerMonth - user.usage.videosThisMonth),
      limits: userLimits
    };
  };

  // Authentication methods
  const login = (userData, token) => {
    const deviceId = createPersistentId();
    const deviceFingerprint = generateDeviceFingerprint();
    
    const authenticatedUser = {
      ...userData,
      isAuthenticated: true,
      deviceId: deviceId,
      deviceFingerprint: deviceFingerprint,
      usage: {
        clipsToday: 0,
        videosThisMonth: userData.metadata?.monthlyUsage || 0,
        lastResetDate: new Date().toDateString(),
        lastMonthlyReset: new Date().getMonth()
      }
    };
    
    setUser(authenticatedUser);
    localStorage.setItem('vlogclip_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('auth_token', token);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('vlogclip_user');
    
    const deviceId = createPersistentId();
    const deviceFingerprint = generateDeviceFingerprint();
    createAnonymousUser(deviceId, deviceFingerprint);
  };

  const getPlanFeatures = () => {
    const features = {
      free: {
        maxClipDuration: 15, // seconds
        videoQuality: 'standard',
        priorityProcessing: false,
        analytics: false,
        commercialRights: false,
        teamSharing: false,
        extendedVideoLength: false,
        customDuration: false,
        bulkProcessing: false,
        apiAccess: false,
        whiteLabel: false
      },
      pro: {
        maxClipDuration: 30,
        videoQuality: 'high',
        priorityProcessing: true,
        analytics: false,
        commercialRights: false,
        teamSharing: false,
        extendedVideoLength: false,
        customDuration: false,
        bulkProcessing: true,
        apiAccess: false,
        whiteLabel: false
      },
      business: {
        maxClipDuration: 60,
        videoQuality: 'high',
        priorityProcessing: true,
        analytics: true,
        commercialRights: true,
        teamSharing: true,
        extendedVideoLength: true,
        customDuration: true,
        bulkProcessing: true,
        apiAccess: true,
        whiteLabel: true
      }
    };

    return features[user.plan] || features.free;
  };

  const value = {
    user,
    upgradeToPlan,
    incrementClipUsage,
    incrementVideoUsage,
    checkUsageLimits,
    getPlanFeatures,
    setUser,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};