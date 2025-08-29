import React from 'react';

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
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Report to error tracking service if available
    if (window.errorReporter) {
      window.errorReporter.log({ error, errorInfo });
    }
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
      return (
        <div style={{
          padding: '40px',
          background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)',
          minHeight: '100vh',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(26, 31, 46, 0.8)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h1 style={{
              color: '#ff6b6b',
              fontSize: '28px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⚠️ Application Error
            </h1>
            
            <div style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#ffa94d', marginBottom: '10px' }}>
                Error Details:
              </h3>
              <pre style={{
                color: '#e0e0e0',
                fontSize: '14px',
                overflow: 'auto',
                maxHeight: '200px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '10px',
                borderRadius: '4px'
              }}>
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>
                  Component Stack:
                </h3>
                <pre style={{
                  color: '#888',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                🔄 Reset Application
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                🔃 Reload Page
              </button>
            </div>

            <div style={{
              marginTop: '30px',
              padding: '15px',
              background: 'rgba(0, 212, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                💡 <strong>Tip:</strong> If this error persists, try clearing your browser cache 
                or contact support with the error details above.
              </p>
            </div>

            <div style={{
              marginTop: '15px',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center'
            }}>
              Error Count: {this.state.errorCount} | 
              Time: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;