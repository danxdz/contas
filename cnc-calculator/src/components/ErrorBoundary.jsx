import React from 'react';

/**
 * Error Boundary component to catch React errors
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
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Report to error tracking service if available
    if (window.errorReporter) {
      window.errorReporter.logError(error, errorInfo);
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
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'linear-gradient(135deg, #1a1f2e, #2a2f3e)',
          color: '#fff'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '30px',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '2px solid #ff4444',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.2)'
          }}>
            <h2 style={{ 
              color: '#ff6666', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⚠️ Application Error
            </h2>
            
            <p style={{ marginBottom: '15px', color: '#ddd' }}>
              An unexpected error occurred in the application. 
              {this.state.errorCount > 1 && (
                <span style={{ color: '#ffaa00' }}>
                  {' '}(Error #{this.state.errorCount})
                </span>
              )}
            </p>
            
            {this.state.error && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid #444'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: '#ff9999',
                  marginBottom: '10px' 
                }}>
                  Error Message:
                </div>
                <code style={{ 
                  display: 'block',
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflowX: 'auto'
                }}>
                  {this.state.error.toString()}
                </code>
              </div>
            )}
            
            {this.state.errorInfo && process.env.NODE_ENV === 'development' && (
              <details style={{ 
                marginBottom: '20px',
                cursor: 'pointer'
              }}>
                <summary style={{ 
                  color: '#00d4ff',
                  marginBottom: '10px',
                  userSelect: 'none'
                }}>
                  Show Technical Details
                </summary>
                <pre style={{
                  padding: '15px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  overflowX: 'auto',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              justifyContent: 'center' 
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.target.style.transform = 'scale(1)'}
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '6px',
                  color: '#aaa',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseOver={e => e.target.style.borderColor = '#999'}
                onMouseOut={e => e.target.style.borderColor = '#666'}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;