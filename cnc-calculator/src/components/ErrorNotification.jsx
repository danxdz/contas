import React, { useState, useEffect } from 'react';
import errorHandler from '../utils/errorHandler';

const ErrorNotification = () => {
  const [errors, setErrors] = useState([]);
  const [visible, setVisible] = useState({});

  useEffect(() => {
    // Subscribe to error events
    const unsubscribe = errorHandler.subscribe((error) => {
      setErrors(prev => [...prev, error]);
      setVisible(prev => ({ ...prev, [error.id]: true }));
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisible(prev => ({ ...prev, [error.id]: false }));
      }, 5000);
      
      // Remove from list after animation
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== error.id));
      }, 5500);
    });

    return unsubscribe;
  }, []);

  const handleDismiss = (id) => {
    setVisible(prev => ({ ...prev, [id]: false }));
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== id));
    }, 300);
  };

  const getErrorColor = (type) => {
    switch(type) {
      case 'CollisionError': return '#ff6b6b';
      case 'GCodeParseError': return '#ffa94d';
      case 'ToolError': return '#ff922b';
      default: return '#ff6b6b';
    }
  };

  const getErrorIcon = (type) => {
    switch(type) {
      case 'CollisionError': return '💥';
      case 'GCodeParseError': return '📝';
      case 'ToolError': return '🔧';
      case 'FileLoadError': return '📁';
      default: return '⚠️';
    }
  };

  if (errors.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      pointerEvents: 'none'
    }}>
      {errors.map(error => (
        <div
          key={error.id}
          style={{
            background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95) 0%, rgba(15, 20, 25, 0.95) 100%)',
            border: `1px solid ${getErrorColor(error.type)}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '10px',
            minWidth: '300px',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            display: visible[error.id] ? 'block' : 'none',
            animation: visible[error.id] ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-out',
            pointerEvents: 'auto'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>
                  {getErrorIcon(error.type)}
                </span>
                <span style={{
                  color: getErrorColor(error.type),
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {error.type.replace('Error', '')}
                </span>
              </div>
              <div style={{
                color: '#e0e0e0',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                {error.message}
              </div>
              {error.context && Object.keys(error.context).length > 0 && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#888'
                }}>
                  {Object.entries(error.context)
                    .filter(([key]) => key !== 'type')
                    .map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDismiss(error.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0 0 0 10px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#888'}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <style>{`
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
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorNotification;