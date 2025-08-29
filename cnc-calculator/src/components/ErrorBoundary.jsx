import React from 'react';

/**
 * Error boundary component to catch and display errors gracefully
 * @class ErrorBoundary
 * @extends {React.Component}
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          background: '#1a1f2e',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          margin: '20px',
          color: '#fff',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#ff4444', marginBottom: '15px' }}>
            ⚠️ Application Error
          </h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Something went wrong.</strong>
            {this.state.errorCount > 1 && (
              <span style={{ color: '#ffa500', marginLeft: '10px' }}>
                (Error #{this.state.errorCount})
              </span>
            )}
          </div>
          
          {this.state.error && (
            <div style={{
              background: '#0d1117',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '12px',
              overflowX: 'auto'
            }}>
              <div style={{ color: '#ff6666', marginBottom: '5px' }}>
                {this.state.error.toString()}
              </div>
              {this.state.errorInfo && (
                <pre style={{ color: '#888', marginTop: '10px', fontSize: '11px' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                background: '#00d4ff',
                border: 'none',
                borderRadius: '4px',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                background: '#444',
                border: '1px solid #666',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
              <summary style={{ cursor: 'pointer' }}>Developer Info</summary>
              <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  url: window.location.href
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;