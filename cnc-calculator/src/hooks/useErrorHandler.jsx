import { useState, useCallback } from 'react';

// Error notification component
export const ErrorNotification = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      maxWidth: '400px',
      padding: '15px',
      background: 'rgba(255, 0, 0, 0.9)',
      border: '1px solid #ff4444',
      borderRadius: '8px',
      color: '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', marginBottom: '5px' }}>
            ⚠️ Error
          </strong>
          <div style={{ fontSize: '14px' }}>
            {error.message || error.toString()}
          </div>
          {error.details && (
            <div style={{ 
              fontSize: '12px', 
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px'
            }}>
              {error.details}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '10px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Custom hook for error handling
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorHistory, setErrorHistory] = useState([]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Log error to history
  const logError = useCallback((err) => {
    const errorEntry = {
      message: err.message || err.toString(),
      timestamp: new Date().toISOString(),
      stack: err.stack,
      type: err.name || 'Error'
    };
    
    setErrorHistory(prev => [...prev.slice(-9), errorEntry]); // Keep last 10 errors
    console.error('Error logged:', errorEntry);
  }, []);

  // Handle async operations with error catching
  const handleAsync = useCallback(async (asyncFunction, options = {}) => {
    const { 
      showLoading = true, 
      onError = null, 
      onSuccess = null,
      errorMessage = null 
    } = options;

    try {
      if (showLoading) setIsLoading(true);
      clearError();
      
      const result = await asyncFunction();
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorObj = {
        message: errorMessage || err.message,
        details: err.response?.data?.message || err.stack,
        original: err
      };
      
      setError(errorObj);
      logError(err);
      
      if (onError) onError(err);
      throw err;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [clearError, logError]);

  // Handle synchronous operations with error catching
  const handleSync = useCallback((syncFunction, options = {}) => {
    const { onError = null, onSuccess = null, errorMessage = null } = options;

    try {
      clearError();
      const result = syncFunction();
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorObj = {
        message: errorMessage || err.message,
        details: err.stack,
        original: err
      };
      
      setError(errorObj);
      logError(err);
      
      if (onError) onError(err);
      throw err;
    }
  }, [clearError, logError]);

  // Wrapper for event handlers
  const wrapHandler = useCallback((handler) => {
    return (...args) => {
      try {
        return handler(...args);
      } catch (err) {
        setError({
          message: `Event handler error: ${err.message}`,
          details: err.stack,
          original: err
        });
        logError(err);
      }
    };
  }, [logError]);

  return {
    error,
    isLoading,
    errorHistory,
    handleAsync,
    handleSync,
    wrapHandler,
    clearError,
    setError
  };
};

export default useErrorHandler;