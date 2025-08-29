// Error handling utilities for CNC Pro Suite

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.listeners = [];
    this.maxErrors = 50;
  }

  // Subscribe to error events
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  notify(error) {
    this.listeners.forEach(listener => listener(error));
  }

  // Log an error
  logError(error, context = {}) {
    const errorEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      type: error.name || 'Error'
    };

    // Add to errors array (maintain max size)
    this.errors.unshift(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('CNC Error:', errorEntry);
    }

    // Notify listeners
    this.notify(errorEntry);

    return errorEntry;
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Clear all errors
  clearErrors() {
    this.errors = [];
  }

  // Get errors by type
  getErrorsByType(type) {
    return this.errors.filter(e => e.type === type);
  }

  // Format error for display
  formatError(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unknown error occurred';
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(new Error(event.reason), {
      type: 'unhandledRejection',
      promise: event.promise
    });
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error || new Error(event.message), {
      type: 'globalError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Make available globally for error boundary
  window.errorReporter = errorHandler;
}

// Error types for CNC operations
export const CNCErrorTypes = {
  GCODE_PARSE: 'GCodeParseError',
  TOOL_ERROR: 'ToolError',
  SIMULATION: 'SimulationError',
  FILE_LOAD: 'FileLoadError',
  COLLISION: 'CollisionError',
  OFFSET: 'OffsetError',
  MACHINE: 'MachineError',
  NETWORK: 'NetworkError'
};

// Helper function to safely execute operations
export const safeExecute = async (operation, context = {}) => {
  try {
    return await operation();
  } catch (error) {
    errorHandler.logError(error, context);
    throw error;
  }
};

// Helper to wrap event handlers
export const safeHandler = (handler, context = {}) => {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      errorHandler.logError(error, { ...context, args });
    }
  };
};

export default errorHandler;