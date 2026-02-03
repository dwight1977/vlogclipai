import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import './ApiAccess.css';

const ApiAccess = () => {
  const { user, getPlanFeatures } = useUser();
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedEndpoint, setCopiedEndpoint] = useState('');

  const planFeatures = getPlanFeatures();

  const fetchApiAccess = useCallback(async () => {
    if (user.plan !== 'business') {
      setError('API access is only available for Business plan users');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/access?plan=${user.plan}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setApiData(data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('API Access fetch error:', err);
      
      // Provide user-friendly error messages
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        setError('Connection timeout. Please check if the server is running and try again.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setError('Cannot connect to server. Please ensure the backend is running on port 3001.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user.plan]);

  useEffect(() => {
    if (planFeatures.apiAccess) {
      fetchApiAccess();
    }
  }, [user.plan, planFeatures.apiAccess, fetchApiAccess]);

  // Auto-retry mechanism for failed requests
  useEffect(() => {
    if (error && planFeatures.apiAccess && !isLoading) {
      const retryTimer = setTimeout(() => {
        console.log('Auto-retrying API access fetch...');
        fetchApiAccess();
      }, 5000); // Retry after 5 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [error, planFeatures.apiAccess, isLoading, fetchApiAccess]);

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(''), 2000);
    });
  };

  const generateCurlExample = (endpoint, method, example) => {
    const baseUrl = '';
    
    if (method === 'POST') {
      return `curl -X POST ${baseUrl}${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(example, null, 2)}'`;
    } else {
      return `curl -X GET ${baseUrl}${endpoint}`;
    }
  };

  if (!planFeatures.apiAccess) {
    return (
      <div className="api-access">
        <div className="api-upgrade-notice">
          <h3>🔌 API Access</h3>
          <p>Integrate VlogClip AI directly into your applications!</p>
          <div className="api-features">
            <div className="api-feature">
              <span className="feature-icon">⚡</span>
              <span>Direct API Integration</span>
            </div>
            <div className="api-feature">
              <span className="feature-icon">🔄</span>
              <span>Batch Processing</span>
            </div>
            <div className="api-feature">
              <span className="feature-icon">📊</span>
              <span>Real-time Progress</span>
            </div>
            <div className="api-feature">
              <span className="feature-icon">🚀</span>
              <span>Unlimited Requests</span>
            </div>
          </div>
          <p className="upgrade-text">
            <strong>Business Plan Only</strong> - Unlock powerful API capabilities
          </p>
          <button className="upgrade-btn" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
            Upgrade to Business
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="api-access">
        <div className="api-loading">
          <div className="loading-spinner"></div>
          <p>Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-access">
        <div className="api-error">
          <h3>❌ API Access Error</h3>
          <p>{error}</p>
          <button onClick={fetchApiAccess} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!apiData) {
    return null;
  }

  return (
    <div className="api-access">
      <div className="api-header">
        <h3>🔌 VlogClip AI Business API</h3>
        <p>{apiData.message}</p>
        <div className="api-status">
          <span className="status-badge active">✓ Active</span>
          <span className="plan-badge">Business Plan</span>
        </div>
      </div>

      <div className="api-overview">
        <div className="rate-limits">
          <h4>📊 Rate Limits</h4>
          <div className="limits-grid">
            <div className="limit-item">
              <span className="limit-label">Requests/Min</span>
              <span className="limit-value">{apiData.rate_limits.requests_per_minute}</span>
            </div>
            <div className="limit-item">
              <span className="limit-label">Videos/Day</span>
              <span className="limit-value">{apiData.rate_limits.videos_per_day}</span>
            </div>
            <div className="limit-item">
              <span className="limit-label">Batch Size</span>
              <span className="limit-value">{apiData.rate_limits.batch_size_limit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="api-endpoints">
        <h4>🛠️ Available Endpoints</h4>
        
        {Object.entries(apiData.endpoints).map(([endpoint, details]) => {
          const method = endpoint.startsWith('POST') ? 'POST' : 'GET';
          const path = endpoint.split(' ')[1];
          const curlExample = generateCurlExample(path, method, details.example);
          
          return (
            <div key={endpoint} className="endpoint-card">
              <div className="endpoint-header">
                <div className="endpoint-title">
                  <span className={`method-badge ${method.toLowerCase()}`}>{method}</span>
                  <span className="endpoint-path">{path}</span>
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(curlExample, endpoint)}
                >
                  {copiedEndpoint === endpoint ? '✓ Copied' : '📋 Copy cURL'}
                </button>
              </div>
              
              <p className="endpoint-description">{details.description}</p>
              
              {details.parameters && (
                <div className="endpoint-params">
                  <strong>Parameters:</strong>
                  <ul>
                    {details.parameters.map((param, index) => (
                      <li key={index}><code>{param}</code></li>
                    ))}
                  </ul>
                </div>
              )}
              
              {details.example && (
                <div className="endpoint-example">
                  <strong>Example Request:</strong>
                  <pre className="code-block">
                    <code>{curlExample}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="api-authentication">
        <h4>🔐 Authentication</h4>
        <div className="auth-info">
          <p><strong>Current Method:</strong> {apiData.authentication.current}</p>
          <p><strong>Future Method:</strong> {apiData.authentication.method}</p>
          <p className="auth-note">
            For now, include your plan in the request body. Bearer token authentication coming soon!
          </p>
        </div>
      </div>

      <div className="api-testing">
        <h4>🧪 Quick Test</h4>
        <p>Test the API directly from your browser's developer console:</p>
        <pre className="code-block">
          <code>{`fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    customDuration: 15
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</code>
        </pre>
      </div>

      <div className="api-support">
        <h4>📞 Need Help?</h4>
        <p>Having trouble with the API? We're here to help!</p>
        <div className="support-links">
          <button 
            onClick={() => window.open('/api-documentation.html', '_blank')} 
            className="support-link"
          >
            📖 Full Documentation
          </button>
          <button 
            onClick={() => window.open('/developer-support.html', '_blank')} 
            className="support-link"
          >
            💬 Developer Support
          </button>
          <button 
            onClick={() => window.open('/report-issues.html', '_blank')} 
            className="support-link"
          >
            🐛 Report Issues
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiAccess;