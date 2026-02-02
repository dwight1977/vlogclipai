import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './UserDashboard.css';

const NotificationsPanel = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Simulate fetching real notifications
    setTimeout(() => {
      const mockNotifications = [
        {
          id: 1,
          type: 'success',
          category: 'processing',
          title: 'Video Processing Complete',
          message: 'Your video "AI Tutorial 2024" has been successfully processed. 3 viral clips are ready for download.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
          actions: [
            { label: 'View Clips', action: 'view_clips' },
            { label: 'Download All', action: 'download_all' }
          ]
        },
        {
          id: 2,
          type: 'info',
          category: 'system',
          title: 'New AI Model Available',
          message: 'GPT-4 Turbo is now available for better clip generation. Your account has been automatically upgraded.',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          read: false,
          actions: [
            { label: 'Learn More', action: 'learn_more' }
          ]
        },
        {
          id: 3,
          type: 'warning',
          category: 'billing',
          title: 'Usage Limit Approaching',
          message: 'You have used 8/10 videos this month. Your limit resets in 3 days.',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          read: true,
          actions: [
            { label: 'Upgrade Plan', action: 'upgrade_plan' },
            { label: 'View Usage', action: 'view_usage' }
          ]
        },
        {
          id: 4,
          type: 'tip',
          category: 'optimization',
          title: 'Content Optimization Tip',
          message: 'Your TikTok videos perform 34% better when posted between 6-9 PM EST. Schedule your next upload accordingly.',
          timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
          read: true,
          actions: [
            { label: 'View Analytics', action: 'view_analytics' }
          ]
        },
        {
          id: 5,
          type: 'achievement',
          category: 'milestone',
          title: 'Milestone Reached! 🎉',
          message: 'Congratulations! You\'ve created 100 viral clips. You\'re now eligible for our Creator Program.',
          timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
          read: false,
          actions: [
            { label: 'Join Program', action: 'join_program' },
            { label: 'Share Achievement', action: 'share_achievement' }
          ]
        },
        {
          id: 6,
          type: 'security',
          category: 'account',
          title: 'New Login Detected',
          message: 'Your account was accessed from a new device (MacBook Pro, Chrome) in New York, NY.',
          timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
          read: true,
          actions: [
            { label: 'Secure Account', action: 'secure_account' },
            { label: 'View Sessions', action: 'view_sessions' }
          ]
        }
      ];
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 800);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleAction = (action, notificationId) => {
    markAsRead(notificationId);
    
    switch (action) {
      case 'view_clips':
        // Navigate to clips library
        console.log('Navigate to clips library');
        break;
      case 'download_all':
        // Trigger download
        console.log('Download all clips');
        break;
      case 'upgrade_plan':
        // Navigate to pricing
        console.log('Navigate to pricing');
        break;
      case 'view_analytics':
        // Navigate to analytics
        console.log('Navigate to analytics');
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'tip': return '💡';
      case 'achievement': return '🏆';
      case 'security': return '🔒';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'info': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'tip': return { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' };
      case 'achievement': return { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)' };
      case 'security': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.category === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (isLoading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>🔔 Notifications</h1>
          <p className="user-email">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            style={{
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#6366f1',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['all', 'unread', 'processing', 'system', 'billing', 'optimization'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              padding: '8px 16px',
              background: filter === filterType ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${filter === filterType ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '20px',
              color: filter === filterType ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {filterType} {filterType === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
        {filteredNotifications.map((notification) => {
          const colors = getNotificationColor(notification.type);
          return (
            <div
              key={notification.id}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                opacity: notification.read ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {!notification.read && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '8px',
                  height: '8px',
                  background: '#6366f1',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)'
                }} />
              )}
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '24px', flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '18px',
                      margin: '0',
                      lineHeight: '1.2'
                    }}>
                      {notification.title}
                    </h3>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '0 0 16px 0'
                  }}>
                    {notification.message}
                  </p>
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action.action, notification.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = 'rgba(99, 102, 241, 0.3)';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredNotifications.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#cbd5e1', marginBottom: '8px' }}>No notifications found</h3>
            <p>You're all caught up! New notifications will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;