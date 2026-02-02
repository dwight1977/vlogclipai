import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import AIInsights from './AIInsights';
import './UserDashboard.css';

const SupportPanel = () => {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    firstName: '',
    lastName: '',
    subject: '',
    message: '',
    priority: 'normal',
    category: 'general',
    userEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem(`support_tickets_${user.email || user.userId}`);
    return savedTickets ? JSON.parse(savedTickets) : [];
  });

  const supportCategories = {
    general: {
      title: '💬 General Support',
      description: 'General questions and assistance',
      articles: [
        { 
          id: 'getting-started',
          title: 'How to get started with VlogClip AI', 
          views: '12.3K', 
          helpful: '95%',
          content: {
            overview: 'VlogClip AI is designed to transform your long-form videos into viral short clips using advanced AI analysis. This comprehensive guide will walk you through the complete setup process.',
            steps: [
              {
                title: '1. Account Creation',
                description: 'Sign up for your VlogClip AI account and choose the plan that fits your needs.',
                details: ['Visit the VlogClip AI website', 'Click "Sign In & Get Started"', 'Choose between Free Tier, Pro Plan, or Business Plan', 'Complete email verification']
              },
              {
                title: '2. First Video Upload',
                description: 'Upload your first YouTube video to start creating clips.',
                details: ['Copy your YouTube video URL', 'Paste it into the video input field', 'Select your desired clip duration (15s, 20s, 30s, or 60s for Business users)', 'Click "Generate Clips"']
              },
              {
                title: '3. Understanding Results',
                description: 'Learn how to interpret and use your generated clips.',
                details: ['Review engagement scores for each clip', 'Download clips in portrait format', 'Use platform-specific captions provided', 'Track your usage through the analytics dashboard']
              }
            ],
            tips: ['Start with shorter videos (2-10 minutes) for best results', 'Ensure your YouTube videos have clear audio', 'Use videos with good lighting and minimal background noise']
          }
        },
        { 
          id: 'usage-limits',
          title: 'Understanding your usage limits', 
          views: '8.7K', 
          helpful: '92%',
          content: {
            overview: 'Each VlogClip AI plan comes with specific usage limits designed to provide optimal service quality while managing system resources.',
            plans: [
              {
                name: 'Free Tier',
                limits: ['1 video per month', '3 clips per processing session', 'Standard quality (720p)', 'Watermarked exports'],
                notes: 'Perfect for trying out the platform and occasional use'
              },
              {
                name: 'Pro Plan ($7/month)',
                limits: ['Unlimited videos', 'Unlimited clips', 'High quality export (1080p)', 'No watermarks', 'Bulk processing'],
                notes: 'Ideal for content creators and small businesses'
              },
              {
                name: 'Business Plan ($23/month)',
                limits: ['Everything in Pro', 'High Quality Processing', 'Advanced analytics', 'API access (1000 req/hour)', 'Priority support'],
                notes: 'Enterprise-grade solution with team collaboration'
              }
            ],
            faqs: [
              { q: 'What happens if I exceed my limits?', a: 'Free users will be notified and asked to upgrade. Pro and Business users have unlimited video processing.' },
              { q: 'Do limits reset monthly?', a: 'Yes, all usage limits reset on your billing cycle date.' }
            ]
          }
        },
        { 
          id: 'account-settings',
          title: 'Account settings and preferences', 
          views: '6.2K', 
          helpful: '89%',
          content: {
            overview: 'Customize your VlogClip AI experience with personalized settings and preferences.',
            sections: [
              {
                title: 'Profile Management',
                items: ['Update your display name and email', 'Change password and security settings', 'Set up two-factor authentication', 'Manage notification preferences']
              },
              {
                title: 'Processing Preferences',
                items: ['Set default clip duration', 'Choose preferred output quality', 'Configure automatic watermarking (Free users)', 'Select default export format']
              },
              {
                title: 'Privacy & Data',
                items: ['Control data sharing preferences', 'Manage video processing history', 'Export your data', 'Delete account and data']
              }
            ]
          }
        },
        { 
          id: 'subscription-management',
          title: 'Billing and subscription management', 
          views: '9.1K', 
          helpful: '94%',
          content: {
            overview: 'Manage your VlogClip AI subscription, billing information, and payment methods with ease.',
            topics: [
              {
                title: 'Upgrading Your Plan',
                steps: ['Go to Dashboard > Account Settings', 'Click "Upgrade Plan"', 'Select your desired plan', 'Enter payment information', 'Confirm upgrade']
              },
              {
                title: 'Billing Cycle Management',
                info: 'Choose between monthly and annual billing. Annual billing provides 17% savings and is billed upfront.'
              },
              {
                title: 'Payment Methods',
                accepted: ['Visa, Mastercard, American Express', 'PayPal', 'Bank transfers (Business plan only)', 'Cryptocurrency (Bitcoin, Ethereum)']
              }
            ]
          }
        }
      ]
    },
    technical: {
      title: '🔧 Technical Issues',
      description: 'Technical problems and troubleshooting',
      articles: [
        { 
          id: 'video-upload-issues',
          title: 'Video upload fails or gets stuck', 
          views: '15.6K', 
          helpful: '88%',
          content: {
            overview: 'Video upload issues are among the most common technical problems. This guide covers solutions for various upload-related errors.',
            commonCauses: [
              'Unsupported video format or codec',
              'File size exceeding platform limits',
              'Poor internet connection',
              'Browser compatibility issues',
              'Corrupted video files'
            ],
            solutions: [
              {
                issue: 'Upload Stuck at 0% or Low Percentage',
                fixes: ['Check your internet connection speed', 'Try uploading during off-peak hours', 'Clear browser cache and cookies', 'Disable browser extensions', 'Switch to a different browser']
              },
              {
                issue: 'Unsupported Format Error',
                fixes: ['Convert video to MP4 format', 'Ensure video uses H.264 codec', 'Check video resolution is supported', 'Verify audio codec compatibility']
              },
              {
                issue: 'File Too Large Error',
                fixes: ['Compress video file size', 'Use shorter video clips', 'Reduce video resolution if necessary', 'Upgrade to Pro plan for higher limits']
              }
            ],
            prevention: ['Use supported formats (MP4, MOV, AVI)', 'Maintain stable internet connection', 'Keep videos under recommended size limits', 'Use modern browsers with latest updates']
          }
        },
        { 
          id: 'processing-delays',
          title: 'Processing takes longer than expected', 
          views: '11.2K', 
          helpful: '85%',
          content: {
            overview: 'Video processing time can vary based on several factors. Understanding these can help set proper expectations and identify potential issues.',
            typicalTimes: [
              'Short videos (1-3 min): 2-5 minutes processing',
              'Medium videos (3-10 min): 5-15 minutes processing', 
              'Long videos (10+ min): 15-30 minutes processing',
              'Batch processing: Additional 2-3 minutes per video'
            ],
            factorsAffecting: [
              'Video length and complexity',
              'Selected output quality',
              'Current system load',
              'Number of clips requested',
              'Audio quality and clarity'
            ],
            troubleshooting: [
              'Check processing status indicator',
              'Ensure stable internet connection',
              'Avoid closing browser tab during processing',
              'Contact support if processing exceeds 60 minutes',
              'Consider processing smaller segments for very long videos'
            ],
            tips: ['Business plan users get priority processing queue', 'Processing times are typically faster during off-peak hours', 'Videos with clear audio process faster']
          }
        },
        { 
          id: 'audio-detection-issues',
          title: 'Audio not detected in uploaded videos', 
          views: '7.8K', 
          helpful: '91%',
          content: {
            overview: 'Audio detection is crucial for AI analysis and clip generation. When audio is not detected, it can significantly impact the quality of generated clips.',
            commonCauses: [
              'Muted or very low audio levels',
              'Unsupported audio codec',
              'Corrupted audio track',
              'Background noise overwhelming speech',
              'Non-standard audio sampling rates'
            ],
            diagnostics: [
              'Play video in media player to confirm audio exists',
              'Check audio levels and normalize if necessary',
              'Verify audio codec is supported (AAC, MP3)',
              'Test with different video editing software'
            ],
            solutions: [
              'Increase audio volume before uploading',
              'Use noise reduction tools to clean audio',
              'Convert audio to supported format',
              'Re-export video with proper audio settings',
              'Contact support for advanced audio processing'
            ]
          }
        },
        { 
          id: 'browser-compatibility',
          title: 'Browser compatibility issues', 
          views: '5.4K', 
          helpful: '87%',
          content: {
            overview: 'VlogClip AI works best with modern browsers that support the latest web technologies. Compatibility issues can affect upload, processing, and playback.',
            supportedBrowsers: [
              'Chrome 100+ (Recommended)',
              'Firefox 95+',
              'Safari 15+',
              'Edge 100+',
              'Opera 85+'
            ],
            requiredFeatures: [
              'JavaScript enabled',
              'WebGL support',
              'HTML5 video support',
              'Local storage enabled',
              'Cookies enabled'
            ],
            troubleshooting: [
              'Update browser to latest version',
              'Clear cache and cookies',
              'Disable problematic extensions',
              'Enable hardware acceleration',
              'Check if browser supports required features'
            ]
          }
        }
      ]
    },
    api: {
      title: '🔌 API & Integration',
      description: 'API documentation and integration help',
      articles: [
        { 
          id: 'api-getting-started',
          title: 'Getting started with the API', 
          views: '4.2K', 
          helpful: '96%',
          content: {
            overview: 'The VlogClip AI Business API allows you to integrate our video processing capabilities directly into your applications. This guide covers the basics of getting started.',
            requirements: ['Business plan subscription', 'Basic understanding of REST APIs', 'Development environment setup', 'API testing tools (Postman, cURL)'],
            quickStart: [
              {
                step: '1. Verify Business Plan Access',
                description: 'Ensure you have an active Business plan subscription to access API features.'
              },
              {
                step: '2. Understanding Authentication',
                description: 'Currently using plan-based access. Bearer token authentication coming soon.'
              },
              {
                step: '3. Make Your First API Call',
                description: 'Test the /api/generate endpoint with a sample YouTube URL.'
              },
              {
                step: '4. Handle Responses',
                description: 'Process the returned clip data and implement proper error handling.'
              }
            ],
            example: `curl -X POST http://localhost:3001/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "customDuration": 30,
    "plan": "business"
  }'`,
            nextSteps: ['Explore batch processing endpoint', 'Implement webhook handling', 'Set up error monitoring', 'Review rate limiting guidelines']
          }
        },
        { 
          id: 'authentication-keys',
          title: 'Authentication and API keys', 
          views: '3.8K', 
          helpful: '93%',
          content: {
            overview: 'API authentication ensures secure access to VlogClip AI services while preventing unauthorized usage.',
            currentAuth: {
              method: 'Plan-based authentication',
              implementation: 'Include "plan": "business" in request body',
              security: 'Requests validated against active Business plan subscription'
            },
            futureAuth: {
              method: 'Bearer Token Authentication',
              status: 'Coming Soon',
              features: ['Individual API keys per user', 'Token-based request validation', 'Enhanced security controls', 'Usage tracking per API key']
            },
            bestPractices: [
              'Never expose API credentials in client-side code',
              'Use environment variables for API configuration',
              'Implement proper error handling for authentication failures',
              'Rotate API keys regularly (when available)',
              'Monitor API usage for unexpected activity'
            ],
            troubleshooting: [
              'Verify Business plan is active and current',
              'Check request format matches documentation',
              'Ensure proper Content-Type headers',
              'Validate JSON payload structure'
            ]
          }
        },
        { 
          id: 'rate-limits-quotas',
          title: 'Rate limits and usage quotas', 
          views: '2.9K', 
          helpful: '90%',
          content: {
            overview: 'Rate limits ensure fair usage and optimal performance for all API users. Understanding these limits is crucial for successful integration.',
            businessPlanLimits: {
              'Requests per Minute': '100',
              'Videos per Day': '1000', 
              'Max Batch Size': '6 videos',
              'Concurrent Processing': '3 videos'
            },
            rateLimitHeaders: [
              'X-RateLimit-Limit: Maximum requests allowed',
              'X-RateLimit-Remaining: Requests left in current window',
              'X-RateLimit-Reset: Time when rate limit resets',
              'X-RateLimit-Retry-After: Seconds to wait before retry'
            ],
            handlingLimits: [
              'Implement exponential backoff for 429 responses',
              'Monitor rate limit headers in responses',
              'Queue requests to stay within limits',
              'Cache results when possible to reduce API calls',
              'Use batch processing to maximize efficiency'
            ],
            bestPractices: [
              'Spread requests evenly across time windows',
              'Implement client-side rate limiting',
              'Use webhooks for async processing updates',
              'Monitor usage patterns and optimize accordingly'
            ]
          }
        },
        { 
          id: 'webhook-setup',
          title: 'Webhook setup and configuration', 
          views: '2.1K', 
          helpful: '94%',
          content: {
            overview: 'Webhooks provide real-time notifications about processing status, enabling better user experiences and system integration.',
            supportedEvents: [
              'video.processing.started',
              'video.processing.completed', 
              'video.processing.failed',
              'batch.processing.completed',
              'subscription.updated'
            ],
            setup: [
              {
                step: '1. Endpoint Preparation',
                details: ['Create HTTPS endpoint to receive webhooks', 'Implement proper request validation', 'Set up response handling (200 OK)', 'Configure error logging']
              },
              {
                step: '2. Webhook Registration',
                details: ['Contact support to register webhook URL', 'Specify which events to receive', 'Provide authentication details if required', 'Test endpoint connectivity']
              },
              {
                step: '3. Security Implementation',
                details: ['Validate webhook signatures', 'Implement request source verification', 'Use HTTPS only', 'Handle replay attacks']
              }
            ],
            payloadExample: `{
  "event": "video.processing.completed",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "clips": [...],
    "processingTime": 180,
    "status": "completed"
  }
}`,
            troubleshooting: [
              'Verify endpoint returns 200 status',
              'Check firewall allows inbound HTTPS',
              'Validate webhook signature verification',
              'Monitor webhook delivery logs'
            ]
          }
        }
      ]
    },
    billing: {
      title: '💳 Billing & Plans',
      description: 'Payment, billing, and subscription questions',
      articles: [
        { 
          id: 'plan-management',
          title: 'How to upgrade or downgrade your plan', 
          views: '6.7K', 
          helpful: '97%',
          content: {
            overview: 'VlogClip AI offers flexible plan management allowing you to scale your subscription based on your needs. Changes take effect immediately.',
            upgrading: {
              steps: [
                'Go to Account Settings in your dashboard',
                'Click "Upgrade Plan" button',
                'Select your desired plan (Pro or Business)',
                'Choose billing cycle (monthly/annual)',
                'Enter payment information',
                'Review and confirm upgrade'
              ],
              immediate: ['Access to new plan features', 'Increased usage limits', 'Priority support (Business)', 'API access (Business)'],
              billing: 'Prorated charges apply - you pay the difference for current billing period'
            },
            downgrading: {
              steps: [
                'Contact support at vlogclipai@gmail.com',
                'Request plan downgrade',
                'Changes effective at next billing cycle',
                'Existing features remain until cycle end'
              ],
              considerations: ['Loss of premium features', 'Reduced usage limits', 'No prorated refunds', 'Data retention policies apply']
            },
            planComparison: [
              {
                plan: 'Free Tier',
                price: '$0/month',
                features: ['1 video per month', '3 clips per processing', 'Standard quality', 'Watermarked exports']
              },
              {
                plan: 'Pro Plan',
                price: '$7/month',
                features: ['Unlimited videos', 'High quality export', 'No watermarks', 'Bulk processing']
              },
              {
                plan: 'Business Plan', 
                price: '$23/month',
                features: ['Everything in Pro', 'Advanced analytics', 'API access', 'Priority support']
              }
            ]
          }
        },
        { 
          id: 'invoice-understanding',
          title: 'Understanding your invoice', 
          views: '4.3K', 
          helpful: '91%',
          content: {
            overview: 'VlogClip AI invoices provide detailed breakdowns of charges, usage, and billing information to ensure transparency.',
            invoiceComponents: [
              {
                section: 'Account Information',
                includes: ['Customer name and email', 'Billing address', 'Invoice date and number', 'Payment due date']
              },
              {
                section: 'Subscription Details',
                includes: ['Plan name and billing cycle', 'Service period covered', 'Base subscription fee', 'Any plan changes or prorations']
              },
              {
                section: 'Usage Summary',
                includes: ['Videos processed during period', 'API calls made (Business plan)', 'Storage usage', 'Bandwidth consumption']
              },
              {
                section: 'Payment Summary',
                includes: ['Subtotal before taxes', 'Applicable taxes by jurisdiction', 'Total amount due', 'Payment method used']
              }
            ],
            commonCharges: [
              'Monthly/Annual subscription fee',
              'Plan upgrade prorations',
              'Overage charges (if applicable)',
              'Sales tax based on billing address',
              'Payment processing fees (some regions)'
            ],
            downloadingInvoices: [
              'Login to your VlogClip AI account',
              'Go to Account Settings > Billing',
              'Click "Download Invoice" for any billing period',
              'Invoices available in PDF format',
              'Historical invoices retained for 7 years'
            ]
          }
        },
        { 
          id: 'refund-policy',
          title: 'Refund and cancellation policy', 
          views: '3.5K', 
          helpful: '89%',
          content: {
            overview: 'VlogClip AI offers a fair refund and cancellation policy designed to provide flexibility while ensuring service sustainability.',
            refundPolicy: {
              eligibility: [
                'Service not working as advertised',
                'Technical issues preventing usage',
                'Billing errors or duplicate charges',
                'Requests within 30 days of charge'
              ],
              process: [
                'Contact support at vlogclipai@gmail.com',
                'Provide account details and reason',
                'Include relevant documentation',
                'Await review within 3-5 business days'
              ],
              exclusions: [
                'Change of mind after using service',
                'Exceeding usage limits on Free tier',
                'Violations of terms of service',
                'Requests after 30-day window'
              ]
            },
            cancellationProcess: {
              immediate: [
                'Login to your account',
                'Go to Account Settings > Subscription',
                'Click "Cancel Subscription"',
                'Confirm cancellation',
                'Service continues until billing period end'
              ],
              effects: [
                'No new charges after current period',
                'Access maintained until period expires',
                'Data retained for 90 days after cancellation',
                'Can reactivate any time during retention period'
              ]
            },
            partialRefunds: [
              'Annual subscriptions: Prorated refund for unused months',
              'Billing errors: Full refund of incorrect charges',
              'Service outages: Credit for affected service time',
              'Plan downgrades: No refund, credit towards next bill'
            ]
          }
        },
        { 
          id: 'payment-methods',
          title: 'Payment methods and security', 
          views: '2.8K', 
          helpful: '95%',
          content: {
            overview: 'VlogClip AI accepts various payment methods and implements industry-standard security measures to protect your financial information.',
            acceptedMethods: {
              creditCards: ['Visa', 'Mastercard', 'American Express', 'Discover'],
              digitalWallets: ['PayPal', 'Apple Pay', 'Google Pay'],
              bankTransfers: ['ACH transfers (US)', 'SEPA transfers (EU)', 'Wire transfers (Business plan)'],
              cryptocurrency: ['Bitcoin', 'Ethereum', 'USD Coin']
            },
            securityMeasures: [
              'PCI DSS Level 1 compliance',
              'End-to-end encryption of payment data',
              'Tokenization of stored payment information',
              'Regular security audits and monitoring',
              '3D Secure authentication for card payments'
            ],
            billingCycles: {
              monthly: {
                description: 'Billed every month on the same date',
                benefits: ['Lower initial commitment', 'Easy to cancel', 'No long-term contract'],
                billing: 'Charged on the same date each month'
              },
              annual: {
                description: 'Billed once per year with 17% savings',
                benefits: ['Significant cost savings', 'Uninterrupted service', 'Priority support'],
                billing: 'Single charge for full year upfront'
              }
            },
            troubleshooting: [
              'Declined payments: Check card details and limits',
              'Failed charges: Verify billing address matches',
              'Currency issues: Contact support for assistance',
              'Subscription errors: Clear browser cache and retry'
            ]
          }
        }
      ]
    }
  };

  const generateTicketId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ticketId = generateTicketId();
      
      // Create ticket data
      const newTicket = {
        id: ticketId,
        subject: ticketForm.subject,
        message: ticketForm.message,
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: 'open',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        messages: 1,
        userEmail: user.email || user.userId
      };

      // Send email via API
      try {
        const response = await fetch('http://localhost:3001/api/send-support-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId: ticketId,
            userEmail: user.email || user.userId,
            replyToEmail: ticketForm.userEmail,
            firstName: ticketForm.firstName,
            lastName: ticketForm.lastName,
            userName: user.username || user.displayName || user.email?.split('@')[0] || 'Unknown User',
            userPlan: user.plan || 'Free',
            category: ticketForm.category,
            priority: ticketForm.priority,
            subject: ticketForm.subject,
            message: ticketForm.message,
            device: navigator.userAgent.split(')')[0] + ')' || 'Unknown'
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          // Update tickets state
          const updatedTickets = [newTicket, ...tickets];
          setTickets(updatedTickets);
          
          // Save to localStorage
          localStorage.setItem(`support_tickets_${user.email || user.userId}`, JSON.stringify(updatedTickets));
          
          // Reset form
          setTicketForm({ firstName: '', lastName: '', subject: '', message: '', priority: 'normal', category: 'general', userEmail: '' });
          setIsSubmitting(false);
          
          // Show success message
          alert(`Support ticket ${ticketId} submitted successfully! Your message has been sent to our support team at vlogclipai@gmail.com.`);
        } else {
          throw new Error(result.message || 'Failed to send email');
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // Fallback to mailto link
        const emailContent = `
Support Ticket: ${ticketId}

User Information:
Account Name: ${ticketForm.firstName && ticketForm.lastName ? `${ticketForm.firstName} ${ticketForm.lastName}` : user.username || user.displayName || user.email?.split('@')[0] || 'Unknown User'}
First Name: ${ticketForm.firstName || 'Not provided'}
Last Name: ${ticketForm.lastName || 'Not provided'}
Dashboard Email: ${user.email || user.userId || 'Unknown'}
Reply-To Email: ${ticketForm.userEmail}
Plan: ${user.plan || 'Free'}
Device: ${navigator.userAgent.split(')')[0] + ')' || 'Unknown'}

Ticket Details:
Category: ${ticketForm.category}
Priority: ${ticketForm.priority}
Subject: ${ticketForm.subject}

Message:
${ticketForm.message}

---
Submitted: ${new Date().toLocaleString()}
Dashboard: ${window.location.origin}
User ID: ${user.userId || user.email || 'N/A'}

IMPORTANT: Please reply to ${ticketForm.userEmail} when responding to this support ticket.
        `;

        const mailtoLink = `mailto:vlogclipai@gmail.com?subject=Support Ticket - ${user.username || user.displayName || ticketForm.userEmail.split('@')[0]} (${user.plan || 'Free'} Plan) - ${ticketForm.subject}&body=${encodeURIComponent(emailContent)}`;
        
        // Update tickets state even if email fails
        const updatedTickets = [newTicket, ...tickets];
        setTickets(updatedTickets);
        localStorage.setItem(`support_tickets_${user.email || user.userId}`, JSON.stringify(updatedTickets));
        
        // Reset form
        setTicketForm({ firstName: '', lastName: '', subject: '', message: '', priority: 'normal', category: 'general', userEmail: '' });
        setIsSubmitting(false);
        
        // Open email client as fallback
        window.open(mailtoLink, '_blank');
        
        alert(`Support ticket ${ticketId} created! Email sending failed, but we've opened your email client. Please send the email manually.`);
      }
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setIsSubmitting(false);
      alert('There was an error submitting your ticket. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' };
      case 'in-progress': return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' };
      case 'answered': return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' };
      case 'closed': return { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)', text: '#6b7280' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', text: '#ffffff' };
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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Show AI Insights if requested
  if (showAIInsights) {
    return <AIInsights onBack={() => setShowAIInsights(false)} />;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>💬 Support Center</h1>
          <p className="user-email">Get help from our expert team</p>
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
            🟢 Support Online
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        {/* Quick Stats */}
        <div className="dashboard-card">
          <h2>📊 Support Stats</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat-item">
              <span className="stat-number">&lt; 4h</span>
              <span className="stat-label">Avg Response</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">97%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{tickets.length}</span>
              <span className="stat-label">Your Tickets</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Availability</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2>⚡ Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setShowAIInsights(true)}
              className="action-btn primary"
              style={{ 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <span className="btn-icon">🧠</span>
              <span className="btn-title">Act on Insight</span>
            </button>
            <button
              onClick={() => window.open('mailto:vlogclipai@gmail.com', '_blank')}
              className="action-btn primary"
              style={{ 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <span className="btn-icon">📧</span>
              <span className="btn-title">Email Support</span>
            </button>
            <div style={{ 
              textAlign: 'center', 
              color: '#94a3b8', 
              fontSize: '14px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>📧 vlogclipai@gmail.com</p>
              <p style={{ margin: '0', fontSize: '12px' }}>Average response time: 4-6 hours</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', position: 'relative', zIndex: 1 }}>
        {/* Categories Sidebar */}
        <div className="dashboard-card">
          <h2>📋 Categories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(supportCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '12px 16px',
                  background: selectedCategory === key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: selectedCategory === key ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: selectedCategory === key ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: selectedCategory === key ? '600' : '500'
                }}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Knowledge Base */}
          <div className="dashboard-card">
            {!selectedArticle ? (
              <>
                <h2>{supportCategories[selectedCategory].title}</h2>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                  {supportCategories[selectedCategory].description}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {supportCategories[selectedCategory].articles.map((article, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedArticle(article)}
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ color: '#ffffff', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                            {article.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                            <span>👁️ {article.views} views</span>
                            <span>👍 {article.helpful} helpful</span>
                          </div>
                        </div>
                        <span style={{ color: '#6366f1', fontSize: '18px' }}>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ minHeight: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    ← Back to {supportCategories[selectedCategory].title}
                  </button>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    <span>👁️ {selectedArticle.views} views</span>
                    <span>👍 {selectedArticle.helpful} helpful</span>
                  </div>
                </div>
                
                <h2 style={{ marginBottom: '16px' }}>{selectedArticle.title}</h2>
                
                <div style={{ color: '#e2e8f0', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '24px', fontSize: '16px', color: '#94a3b8' }}>
                    {selectedArticle.content.overview}
                  </p>
                  
                  {/* Render content based on article structure */}
                  {selectedArticle.content.steps && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>Getting Started</h3>
                      {selectedArticle.content.steps.map((step, index) => (
                        <div key={index} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                          <h4 style={{ color: '#6366f1', marginBottom: '8px' }}>{step.title}</h4>
                          <p style={{ marginBottom: '12px', color: '#94a3b8' }}>{step.description}</p>
                          <ul style={{ paddingLeft: '20px', color: '#e2e8f0' }}>
                            {step.details.map((detail, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedArticle.content.tips && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>💡 Pro Tips</h3>
                      <ul style={{ paddingLeft: '20px', color: '#e2e8f0' }}>
                        {selectedArticle.content.tips.map((tip, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add more content rendering logic based on the article structure */}
                </div>
              </div>
            )}
          </div>

          {/* Submit Ticket */}
          <div className="dashboard-card">
            <h2>🎫 Submit New Ticket</h2>
            <form onSubmit={handleTicketSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                  Your Email Address (for replies)
                </label>
                <input
                  type="email"
                  value={ticketForm.userEmail}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, userEmail: e.target.value }))}
                  placeholder="Enter your email address where you want to receive replies"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.firstName}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
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
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.lastName}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                    Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
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
                    <option value="general">General Support</option>
                    <option value="technical">Technical Issues</option>
                    <option value="api">API & Integration</option>
                    <option value="billing">Billing & Plans</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                    Priority
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '600' }}>
                  Message
                </label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide detailed information about your issue..."
                  required
                  rows={5}
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

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  background: isSubmitting ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? '🔄 Submitting...' : '📤 Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Your Tickets */}
          <div className="dashboard-card">
            <h2>🎫 Your Support Tickets</h2>
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                <p>No support tickets yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tickets.map((ticket) => {
                  const statusColors = getStatusColor(ticket.status);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '14px' }}>
                              #{ticket.id}
                            </span>
                            <span
                              style={{
                                padding: '4px 8px',
                                background: statusColors.bg,
                                border: `1px solid ${statusColors.border}`,
                                borderRadius: '12px',
                                color: statusColors.text,
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}
                            >
                              {ticket.status.replace('-', ' ')}
                            </span>
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                background: getPriorityColor(ticket.priority),
                                borderRadius: '50%'
                              }}
                              title={`${ticket.priority} priority`}
                            />
                          </div>
                          <h4 style={{ color: '#ffffff', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                            {ticket.subject}
                          </h4>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                            <span>Created: {formatTimeAgo(ticket.created)}</span>
                            <span>Updated: {formatTimeAgo(ticket.updated)}</span>
                            <span>{ticket.messages} messages</span>
                          </div>
                        </div>
                        <span style={{ color: '#6366f1', fontSize: '18px' }}>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
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
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: '700' }}>
                    Support Ticket #{selectedTicket.id}
                  </h2>
                  <span
                    style={{
                      padding: '4px 12px',
                      background: getStatusColor(selectedTicket.status).bg,
                      border: `1px solid ${getStatusColor(selectedTicket.status).border}`,
                      borderRadius: '16px',
                      color: getStatusColor(selectedTicket.status).text,
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}
                  >
                    {selectedTicket.status.replace('-', ' ')}
                  </span>
                </div>
                <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#94a3b8';
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '24px',
              maxHeight: 'calc(80vh - 120px)',
              overflowY: 'auto'
            }}>
              {/* Ticket Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Category
                  </label>
                  <p style={{ color: '#ffffff', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600' }}>
                    {selectedTicket.category.charAt(0).toUpperCase() + selectedTicket.category.slice(1)}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Priority
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        background: getPriorityColor(selectedTicket.priority),
                        borderRadius: '50%'
                      }}
                    />
                    <p style={{ color: '#ffffff', margin: 0, fontSize: '14px', fontWeight: '600' }}>
                      {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                    </p>
                  </div>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Created
                  </label>
                  <p style={{ color: '#ffffff', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600' }}>
                    {new Date(selectedTicket.created).toLocaleDateString()} at {new Date(selectedTicket.created).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Last Updated
                  </label>
                  <p style={{ color: '#ffffff', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600' }}>
                    {formatTimeAgo(selectedTicket.updated)}
                  </p>
                </div>
              </div>

              {/* Original Message */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    👤
                  </div>
                  <div>
                    <p style={{ color: '#ffffff', margin: 0, fontSize: '14px', fontWeight: '600' }}>
                      {user.username || user.displayName || user.email || 'You'}
                    </p>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px' }}>
                      {new Date(selectedTicket.created).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{
                  color: '#e2e8f0',
                  lineHeight: '1.6',
                  fontSize: '15px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedTicket.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={async () => {
                    // Prompt user for their personal email address
                    const userPersonalEmail = prompt(
                      'Please enter your personal email address where you want to receive follow-up responses:',
                      ''
                    );
                    
                    if (!userPersonalEmail || !userPersonalEmail.includes('@')) {
                      alert('Please enter a valid email address to receive follow-up responses.');
                      return;
                    }

                    // Prompt for follow-up message
                    const followUpMessage = prompt(
                      'Please enter your follow-up message:',
                      'I have additional information regarding this ticket...'
                    );

                    if (!followUpMessage) {
                      alert('Please enter a follow-up message.');
                      return;
                    }

                    // Generate new follow-up ticket ID
                    const followUpTicketId = `FOLLOWUP-${selectedTicket.id}-${Date.now().toString().slice(-6)}`;

                    // Create comprehensive email with all original ticket details
                    const ticketData = {
                      ticketId: followUpTicketId,
                      userEmail: user.email || user.userId,
                      replyToEmail: userPersonalEmail,
                      userName: user.username || user.displayName || user.email?.split('@')[0] || 'Unknown User',
                      userPlan: user.plan || 'Free',
                      category: selectedTicket.category || 'follow-up',
                      priority: selectedTicket.priority || 'normal',
                      subject: `Follow-up: ${selectedTicket.subject}`,
                      message: `${followUpMessage}

---
ORIGINAL TICKET DETAILS:
Ticket ID: ${selectedTicket.id}
Original Subject: ${selectedTicket.subject}
Original Category: ${selectedTicket.category}
Original Priority: ${selectedTicket.priority}
Created: ${new Date(selectedTicket.created).toLocaleString()}
Original Message:
${selectedTicket.message}

Status: Follow-up submitted
Dashboard Account: ${user.username || user.email || 'Unknown'}`,
                      device: navigator.userAgent.split(')')[0] + ')' || 'Unknown'
                    };

                    try {
                      // Send via API to ensure both emails are sent
                      const response = await fetch('/api/send-support-email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(ticketData)
                      });

                      const result = await response.json();

                      if (result.success) {
                        alert(`Follow-up ticket ${followUpTicketId} submitted successfully!\n\nConfirmation email sent to: ${userPersonalEmail}\nSupport team notified at: vlogclipai@gmail.com`);
                        
                        // Add follow-up to local tickets list
                        const newFollowUp = {
                          id: followUpTicketId,
                          subject: ticketData.subject,
                          message: followUpMessage,
                          category: ticketData.category,
                          priority: ticketData.priority,
                          created: Date.now(),
                          status: 'submitted',
                          replyToEmail: userPersonalEmail,
                          originalTicket: selectedTicket.id
                        };
                        
                        const updatedTickets = [...tickets, newFollowUp];
                        setTickets(updatedTickets);
                        localStorage.setItem(`support_tickets_${user.email || user.userId}`, JSON.stringify(updatedTickets));
                      } else {
                        throw new Error(result.message || 'Failed to send follow-up');
                      }
                    } catch (error) {
                      console.error('Follow-up submission failed:', error);
                      
                      // Fallback to mailto link with full details
                      const fallbackEmailContent = `Follow-up Message:
${followUpMessage}

---
ORIGINAL TICKET DETAILS:
Ticket ID: ${selectedTicket.id}
Original Subject: ${selectedTicket.subject}
Original Category: ${selectedTicket.category}
Original Priority: ${selectedTicket.priority}
Created: ${new Date(selectedTicket.created).toLocaleString()}
Original Message:
${selectedTicket.message}

Personal Email for Reply: ${userPersonalEmail}
Account: ${user.username || user.email || 'Unknown'}

IMPORTANT: Please reply to ${userPersonalEmail} when responding to this follow-up.`;

                      const mailtoLink = `mailto:vlogclipai@gmail.com?subject=Follow-up: ${selectedTicket.subject}&body=${encodeURIComponent(fallbackEmailContent)}`;
                      window.open(mailtoLink, '_blank');
                      
                      alert('API submission failed - opened email client as fallback. Please send the email manually.');
                    }
                  }}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📧 Follow Up
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPanel;