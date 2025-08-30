import React from 'react';

const LoadingState = ({ message = 'Loading...', progress = null }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: '#00d4ff',
      zIndex: 1000
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '3px solid rgba(0, 212, 255, 0.2)',
        borderTop: '3px solid #00d4ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }} />
      
      <div style={{ fontSize: '16px', marginBottom: '10px' }}>
        {message}
      </div>
      
      {progress !== null && (
        <div style={{
          width: '200px',
          height: '4px',
          background: 'rgba(0, 212, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          margin: '0 auto'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#00d4ff',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;