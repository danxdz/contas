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
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
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
      // Custom error UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          background: 'rgba(255, 0, 0, 0.1)',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          color: '#ffffff',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#ff4444', marginBottom: '10px' }}>
            ⚠️ Application Error
          </h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
          </div>
          
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', marginBottom: '15px' }}>
              <summary style={{ cursor: 'pointer', color: '#00d4ff' }}>
                View Stack Trace
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
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
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reset Application
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                background: '#ff9800',
                border: 'none',
                borderRadius: '4px',
                color: '#000',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reload Page
            </button>
          </div>
          
          <div style={{ 
            marginTop: '15px', 
            fontSize: '12px', 
            color: '#888' 
          }}>
            Error Count: {this.state.errorCount}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;