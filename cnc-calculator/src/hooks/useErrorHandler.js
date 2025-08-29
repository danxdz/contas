import { useState, useCallback } from 'react';

/**
 * Custom hook for handling errors with user feedback
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Wraps an async operation with error handling
   * @param {Function} operation - Async function to execute
   * @param {string} errorMessage - Custom error message
   * @returns {Promise} Result of the operation
   */
  const handleAsync = useCallback(async (operation, errorMessage = 'Operation failed') => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await operation();
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error(errorMessage, err);
      setError({
        message: errorMessage,
        details: err.message || err.toString(),
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Wraps a synchronous operation with error handling
   * @param {Function} operation - Function to execute
   * @param {string} errorMessage - Custom error message
   * @returns {*} Result of the operation
   */
  const handleSync = useCallback((operation, errorMessage = 'Operation failed') => {
    setError(null);
    
    try {
      return operation();
    } catch (err) {
      console.error(errorMessage, err);
      setError({
        message: errorMessage,
        details: err.message || err.toString(),
        timestamp: new Date().toISOString()
      });
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    handleAsync,
    handleSync,
    clearError,
    setError
  };
};

/**
 * Error notification component
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object
 * @param {Function} props.onClose - Close handler
 */
export const ErrorNotification = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      maxWidth: '400px',
      padding: '15px',
      background: 'linear-gradient(135deg, #ff4444, #cc0000)',
      border: '1px solid #ff6666',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 4px 20px rgba(255, 68, 68, 0.3)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            ⚠️ {error.message}
          </div>
          {error.details && (
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '5px' }}>
              {error.details}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 0 0 10px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Add animation keyframes
if (typeof document !== 'undefined' && !document.getElementById('error-handler-styles')) {
  const style = document.createElement('style');
  style.id = 'error-handler-styles';
  style.textContent = `
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
  `;
  document.head.appendChild(style);
}

export default useErrorHandler;