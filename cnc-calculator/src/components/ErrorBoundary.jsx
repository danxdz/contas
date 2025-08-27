import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          background: '#1a1e2a',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          color: '#ffffff'
        }}>
          <h2 style={{ color: '#ff4444' }}>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', color: '#00d4ff' }}>Error Details</summary>
            <div style={{ marginTop: '10px', padding: '10px', background: '#0a0e1a', borderRadius: '4px' }}>
              <p style={{ color: '#ff6666' }}>{this.state.error && this.state.error.toString()}</p>
              <pre style={{ color: '#888888', fontSize: '12px', overflow: 'auto' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#00d4ff',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;