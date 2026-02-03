import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './UserDashboard.css';

const AccountInbox = ({ onBack }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Generate Account ID for API calls (matching backend logic)
  useEffect(() => {
    if (user.email || user.userId) {
      const generateUniqueAccountId = (userEmail, userPlan = 'free') => {
        const timestamp = Date.now();
        const planPrefix = userPlan.slice(0, 3).toUpperCase();
        let emailHash = 0;
        if (userEmail) {
          for (let i = 0; i < userEmail.length; i++) {
            emailHash = ((emailHash << 5) - emailHash) + userEmail.charCodeAt(i);
            emailHash = emailHash & emailHash;
          }
        }
        const baseId = Math.abs(emailHash).toString(36).slice(0, 6);
        const timeId = timestamp.toString(36).slice(-4);
        return `VCA-${planPrefix}-${baseId}-${timeId}`.toUpperCase();
      };

      const generatedAccountId = generateUniqueAccountId(user.email || user.userId, user.plan);
      setAccountId(generatedAccountId);
      console.log(`📧 Generated Account ID for inbox polling: ${generatedAccountId}`);
    }
  }, [user.email, user.userId, user.plan]);

  // Load messages from API and set up auto-refresh
  useEffect(() => {
    if (accountId) {
      loadInboxMessages();
      
      // Set up auto-refresh every 15 seconds to match server polling
      const refreshInterval = setInterval(() => {
        console.log('📧 Auto-refreshing inbox messages...');
        loadInboxMessages(true); // Silent refresh
      }, 15000); // 15 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [accountId]);

  const loadInboxMessages = async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    try {
      if (!accountId) {
        console.log('📧 No Account ID available for inbox API call');
        if (!silent) setIsLoading(false);
        return;
      }

      console.log(`📧 Fetching inbox messages for Account ID: ${accountId}`);
      
      const response = await fetch(`/api/inbox/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📧 API: Retrieved ${result.messages.length} inbox messages from server`);
        
        // Convert API messages to component format
        const apiMessages = result.messages.map(msg => ({
          id: msg.id,
          from: msg.from || 'vlogclipai@gmail.com',
          to: user.email || user.userId,
          subject: msg.subject,
          message: msg.message,
          timestamp: msg.date,
          type: msg.type || 'support_response',
          status: msg.status || 'unread',
          priority: 'normal',
          accountId: msg.accountId
        }));

        // Load existing tickets as fallback messages if no API messages
        let fallbackMessages = [];
        if (apiMessages.length === 0) {
          const ticketKey = `support_tickets_${user.email || user.userId}`;
          const existingTickets = JSON.parse(localStorage.getItem(ticketKey) || '[]');
          
          fallbackMessages = existingTickets.map(ticket => ({
            id: `ticket-${ticket.id}`,
            from: 'vlogclipai@gmail.com',
            to: user.email || user.userId,
            subject: `Re: Support Ticket ${ticket.id} - ${ticket.subject}`,
            message: generateTicketResponse(ticket),
            timestamp: new Date(new Date(ticket.created).getTime() + 1000 * 60 * 30).toISOString(),
            type: 'support_response',
            status: 'unread',
            priority: ticket.priority,
            originalTicket: ticket.id
          }));
        }

        // Add welcome message if still no messages
        const allMessages = [...apiMessages, ...fallbackMessages];
        if (allMessages.length === 0) {
          allMessages.push({
            id: `welcome-${Date.now()}`,
            from: 'vlogclipai@gmail.com',
            to: user.email || user.userId,
            subject: 'Welcome to VlogClip AI - Email Polling Active',
            message: `Dear ${user.username || user.displayName || user.email || 'Valued User'},

🎉 Welcome to VlogClip AI with real-time email polling!

Your inbox is now connected to vlogclipai@gmail.com and will automatically check for new messages every 15 seconds.

Account ID: ${accountId}
When sending emails to vlogclipai@gmail.com, include this Account ID in the subject line for proper routing.

Features now active:
• Real-time email polling from Gmail
• Automatic message delivery to your dashboard
• Support for unique Account ID routing
• 15-second refresh intervals

Need help? Send an email to vlogclipai@gmail.com with your Account ID in the subject line!

Best regards,
The VlogClip AI Team

---
This is an automated message from VlogClip AI Support
Your inbox is now polling vlogclipai@gmail.com every 15 seconds`,
            timestamp: new Date().toISOString(),
            type: 'welcome',
            status: 'unread',
            priority: 'normal'
          });
        }

        setMessages(allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLastRefresh(new Date());
        
        if (!silent) {
          console.log(`📧 Inbox updated with ${allMessages.length} messages at ${new Date().toLocaleTimeString()}`);
        }
      } else {
        console.error('📧 API: Failed to fetch inbox messages:', response.statusText);
        // Fall back to localStorage in case of API failure
        loadFallbackMessages();
      }
    } catch (error) {
      console.error('📧 Error loading inbox messages from API:', error);
      // Fall back to localStorage in case of network error
      loadFallbackMessages();
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const loadFallbackMessages = () => {
    try {
      console.log('📧 Loading fallback messages from localStorage');
      const inboxKey = `inbox_messages_${user.email || user.userId}`;
      const savedMessages = JSON.parse(localStorage.getItem(inboxKey) || '[]');
      setMessages(savedMessages);
    } catch (error) {
      console.error('Error loading fallback messages:', error);
      setMessages([]);
    }
  };

  const clearAllMessages = async () => {
    if (!window.confirm('Are you sure you want to clear all messages from your inbox? This action cannot be undone.')) {
      return;
    }

    try {
      if (accountId) {
        console.log(`📧 Clearing all messages for Account ID: ${accountId}`);
        
        const response = await fetch(`/api/inbox/${accountId}/clear`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`📧 API: Cleared ${result.clearedCount} messages from server`);
          
          // Clear UI immediately
          setMessages([]);
          setSelectedMessage(null);
          
          alert(`Successfully cleared ${result.clearedCount} messages from your inbox!`);
        } else {
          console.error('📧 API: Failed to clear messages via API');
          throw new Error('Failed to clear messages via API');
        }
      }
    } catch (error) {
      console.error('📧 Error clearing messages via API:', error);
      
      // Fallback to localStorage clearing
      const inboxKey = `inbox_messages_${user.email || user.userId}`;
      localStorage.removeItem(inboxKey);
      setMessages([]);
      setSelectedMessage(null);
      
      alert('Messages cleared from local storage (API clear failed)');
    }
  };

  const generateTicketResponse = (ticket) => {
    const responses = {
      general: `Thank you for contacting VlogClip AI support regarding "${ticket.subject}".

We have received your request and our team is reviewing it. Based on your inquiry, here are some immediate suggestions:

• Check our comprehensive FAQ section in the Support Center
• Review our getting started guide for common questions
• Ensure you're using the latest version of our platform

We typically respond to general inquiries within 4-6 hours during business hours (9 AM - 6 PM PST). 

If this is urgent, please reply to this email with "URGENT" in the subject line.

Best regards,
Sarah Chen
VlogClip AI Support Team`,

      technical: `Hello ${user.username || 'there'},

We've received your technical support request about "${ticket.subject}" (Ticket #${ticket.id}).

Our technical team is investigating the issue. In the meantime, please try these troubleshooting steps:

1. Clear your browser cache and cookies
2. Disable browser extensions temporarily
3. Try using a different browser (Chrome recommended)
4. Check your internet connection stability

If the issue persists, please reply with:
• Your browser version and operating system
• Steps you've already tried
• Any error messages you're seeing

Expected resolution time: 2-4 hours for most technical issues.

Technical regards,
Marcus Rodriguez
Lead Developer, VlogClip AI`,

      billing: `Dear ${user.username || 'Valued Customer'},

Thank you for your billing inquiry regarding "${ticket.subject}".

We've received your request and are reviewing your account details. For billing matters, we ensure:

• All charges are transparent and clearly explained
• Refunds are processed according to our policy
• Account upgrades/downgrades take effect immediately

Common billing questions:
• Plan changes: Effective immediately with prorated billing
• Refunds: Available within 30 days for eligible requests
• Payment issues: We accept all major credit cards and PayPal

We'll have a detailed response within 2-3 hours. If you need immediate billing assistance, call our billing department at 1-800-VLOGCLIP.

Billing regards,
Jennifer Martinez
Billing Specialist, VlogClip AI`,

      api: `Hello Developer,

Thank you for your API integration question about "${ticket.subject}".

Our API team has received your request. For Business plan API support:

• Documentation: Available in your dashboard under API Access
• Rate limits: 1000 requests/hour for Business plan
• Authentication: Bearer token (coming soon)
• Support: Dedicated developer support channel

Current API status: All systems operational
Response time for API queries: 1-2 hours during business hours

For immediate API assistance, join our developer Discord channel (link in your dashboard).

Happy coding,
Alex Thompson
Senior API Engineer, VlogClip AI`
    };

    return responses[ticket.category] || responses.general;
  };

  const markAsRead = async (messageId) => {
    // Optimistically update UI
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    );
    setMessages(updatedMessages);
    
    // Also update API if available
    if (accountId) {
      try {
        const response = await fetch(`/api/inbox/${accountId}/mark-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageIds: [messageId]
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`📧 API: Marked ${result.updatedCount} message(s) as read`);
        } else {
          console.error('📧 API: Failed to mark message as read via API');
        }
      } catch (error) {
        console.error('📧 Error marking message as read via API:', error);
      }
    }
    
    // Fallback to localStorage for persistence
    const inboxKey = `inbox_messages_${user.email || user.userId}`;
    localStorage.setItem(inboxKey, JSON.stringify(updatedMessages));
  };

  const handleComposeMessage = async (e) => {
    e.preventDefault();
    
    try {
      // Send email via API
      const response = await fetch('/api/send-inbox-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email || user.userId,
          userName: user.username || user.displayName || user.email || 'Unknown User',
          userPlan: user.plan || 'Free',
          subject: newMessage.subject,
          message: newMessage.message,
          priority: newMessage.priority
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Add to sent messages
        const sentMessage = {
          id: `sent-${Date.now()}`,
          from: user.email || user.userId,
          to: 'vlogclipai@gmail.com',
          subject: newMessage.subject,
          message: newMessage.message,
          timestamp: new Date().toISOString(),
          type: 'sent',
          status: 'sent',
          priority: newMessage.priority
        };

        const updatedMessages = [sentMessage, ...messages];
        setMessages(updatedMessages);
        
        const inboxKey = `inbox_messages_${user.email || user.userId}`;
        localStorage.setItem(inboxKey, JSON.stringify(updatedMessages));

        // Reset form
        setNewMessage({ subject: '', message: '', priority: 'normal' });
        setComposeMode(false);
        
        alert('Message sent successfully to vlogclipai@gmail.com!');
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Fallback to mailto link
      const emailContent = `
New Message from VlogClip AI User
From: ${user.username || user.displayName || user.email || 'Unknown User'}
Email: ${user.email || user.userId}
Plan: ${user.plan || 'Free'}
Priority: ${newMessage.priority}
Subject: ${newMessage.subject}

Message:
${newMessage.message}

---
Sent from VlogClip AI Account Inbox
User Dashboard: ${window.location.origin}
      `;

      const mailtoLink = `mailto:vlogclipai@gmail.com?subject=${encodeURIComponent(newMessage.subject)}&body=${encodeURIComponent(emailContent)}`;
      window.open(mailtoLink, '_blank');

      // Add to sent messages even if API fails
      const sentMessage = {
        id: `sent-${Date.now()}`,
        from: user.email || user.userId,
        to: 'vlogclipai@gmail.com',
        subject: newMessage.subject,
        message: newMessage.message,
        timestamp: new Date().toISOString(),
        type: 'sent',
        status: 'sent',
        priority: newMessage.priority
      };

      const updatedMessages = [sentMessage, ...messages];
      setMessages(updatedMessages);
      
      const inboxKey = `inbox_messages_${user.email || user.userId}`;
      localStorage.setItem(inboxKey, JSON.stringify(updatedMessages));

      // Reset form
      setNewMessage({ subject: '', message: '', priority: 'normal' });
      setComposeMode(false);
      
      alert('Email sending failed, but we\'ve opened your email client. Please send the email manually.');
    }
  };

  const deleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      
      const inboxKey = `inbox_messages_${user.email || user.userId}`;
      localStorage.setItem(inboxKey, JSON.stringify(updatedMessages));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'support_response': return '💬';
      case 'welcome': return '🎉';
      case 'billing': return '💳';
      case 'technical': return '🔧';
      case 'api': return '🔌';
      case 'sent': return '📤';
      default: return '📧';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'normal': return '#6366f1';
      case 'high': return '#f59e0b';
      case 'urgent': return '#ef4444';
      default: return '#6366f1';
    }
  };

  if (isLoading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your inbox...</p>
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
              <h1>📥 Account Inbox</h1>
              <p className="user-email">Messages from VlogClip AI Support Team</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ 
            padding: '8px 16px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            📧 {messages.filter(m => m.status === 'unread').length} Unread
          </div>
          <div style={{ 
            padding: '8px 16px', 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            🔄 Last refresh: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={() => loadInboxMessages()}
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#22c55e',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600'
            }}
            title="Refresh inbox messages"
          >
            🔄 Refresh
          </button>
          <button
            onClick={clearAllMessages}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600'
            }}
            title="Clear all messages from inbox"
          >
            🗑️ Clear All
          </button>
          <button
            onClick={() => setComposeMode(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ✏️ Compose
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '350px 1fr' : '1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
        {/* Message List */}
        <div className="dashboard-card" style={{ height: 'fit-content', maxHeight: '100%', overflow: 'hidden' }}>
          <h2>📬 Messages ({messages.length})</h2>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📪</div>
                <p>No messages yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === 'unread') {
                        markAsRead(message.id);
                      }
                    }}
                    style={{
                      padding: '16px',
                      background: message.status === 'unread' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                      border: message.status === 'unread' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderLeft: message.status === 'unread' ? '4px solid #6366f1' : '4px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = message.status === 'unread' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px' }}>{getMessageTypeIcon(message.type)}</span>
                          <span style={{ 
                            color: message.type === 'sent' ? '#10b981' : '#ffffff', 
                            fontWeight: '600', 
                            fontSize: '14px' 
                          }}>
                            {message.type === 'sent' ? 'To: VlogClip AI Support' : 'From: VlogClip AI Support'}
                          </span>
                          {message.status === 'unread' && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              background: '#6366f1',
                              borderRadius: '50%'
                            }} />
                          )}
                        </div>
                        <h4 style={{ 
                          color: '#ffffff', 
                          margin: '0 0 4px 0', 
                          fontSize: '15px', 
                          fontWeight: message.status === 'unread' ? '700' : '600',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {message.subject}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
                          <span>{formatTimeAgo(message.timestamp)}</span>
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              background: getPriorityColor(message.priority),
                              borderRadius: '50%'
                            }}
                            title={`${message.priority} priority`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '14px'
                        }}
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail View */}
        {selectedMessage && (
          <div className="dashboard-card" style={{ height: 'fit-content', maxHeight: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{getMessageTypeIcon(selectedMessage.type)}</span>
                <div>
                  <h2 style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: '700' }}>
                    {selectedMessage.subject}
                  </h2>
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
                    {selectedMessage.type === 'sent' 
                      ? `To: ${selectedMessage.to}` 
                      : `From: ${selectedMessage.from}`
                    }
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    padding: '4px 8px',
                    background: `${getPriorityColor(selectedMessage.priority)}20`,
                    border: `1px solid ${getPriorityColor(selectedMessage.priority)}40`,
                    borderRadius: '12px',
                    color: getPriorityColor(selectedMessage.priority),
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}
                >
                  {selectedMessage.priority}
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '13px' }}>
              Received: {new Date(selectedMessage.timestamp).toLocaleString()}
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '20px'
            }}>
              <div style={{
                color: '#e2e8f0',
                lineHeight: '1.6',
                fontSize: '15px',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const replySubject = selectedMessage.subject.startsWith('Re:') 
                    ? selectedMessage.subject 
                    : `Re: ${selectedMessage.subject}`;
                  const replyMessage = `\n\n---\nReplying to message from ${selectedMessage.from}\nSent: ${new Date(selectedMessage.timestamp).toLocaleString()}\n\nOriginal message:\n${selectedMessage.message.substring(0, 200)}...`;
                  
                  setNewMessage({
                    subject: replySubject,
                    message: replyMessage,
                    priority: selectedMessage.priority
                  });
                  setComposeMode(true);
                  setSelectedMessage(null);
                }}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                📧 Reply
              </button>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {composeMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            width: '90vw',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: '700' }}>
                ✏️ Compose Message
              </h2>
              <button
                onClick={() => setComposeMode(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleComposeMessage} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                  To
                </label>
                <input
                  type="text"
                  value="vlogclipai@gmail.com"
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Message subject"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                    Priority
                  </label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                  Message
                </label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message..."
                  required
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setComposeMode(false)}
                  style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  📤 Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInbox;