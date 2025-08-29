import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0e1a',
          color: '#e0e0e0',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#1a1f2e',
            padding: '30px',
            borderRadius: '10px',
            border: '2px solid #ff4444',
            maxWidth: '600px'
          }}>
            <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>
              ⚠️ Something went wrong
            </h2>
            <p style={{ marginBottom: '20px' }}>
              The application encountered an error. You can try to recover by clicking the button below.
            </p>
            {this.state.error && (
              <details style={{ 
                textAlign: 'left',
                background: '#0a0e1a',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                <summary style={{ cursor: 'pointer', color: '#00d4ff' }}>
                  Error Details
                </summary>
                <pre style={{ 
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '10px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  background: '#00d4ff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Reset Application
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
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