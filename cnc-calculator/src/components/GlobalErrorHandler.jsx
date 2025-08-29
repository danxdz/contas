import React from 'react';
import { ErrorNotification } from '../hooks/useErrorHandler';

const GlobalErrorHandler = ({ error, isLoading, onClearError }) => {
  return (
    <>
      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #00d4ff',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(0, 212, 255, 0.3)',
            borderTop: '3px solid #00d4ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ color: '#00d4ff', fontSize: '14px' }}>
            Processing...
          </div>
        </div>
      )}
      
      {/* Error Notification */}
      <ErrorNotification error={error} onClose={onClearError} />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default GlobalErrorHandler;