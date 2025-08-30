// Performance optimization utilities

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay) {
  let lastCall = 0;
  let timeout = null;
  
  return function throttled(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);
    
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCall = now;
      return func.apply(this, args);
    }
    
    if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeout;
  
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Request animation frame throttle
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF throttled function
 */
export function rafThrottle(func) {
  let rafId = null;
  
  return function rafThrottled(...args) {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}

/**
 * Memoize expensive computations
 * @param {Function} func - Function to memoize
 * @param {Function} keyResolver - Optional function to generate cache key
 * @returns {Function} Memoized function
 */
export function memoize(func, keyResolver) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

/**
 * Cancel stale intervals and timeouts
 */
export class IntervalManager {
  constructor() {
    this.intervals = new Set();
    this.timeouts = new Set();
  }
  
  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  }
  
  setTimeout(callback, delay) {
    const id = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delay);
    this.timeouts.add(id);
    return id;
  }
  
  clearInterval(id) {
    if (this.intervals.has(id)) {
      clearInterval(id);
      this.intervals.delete(id);
    }
  }
  
  clearTimeout(id) {
    if (this.timeouts.has(id)) {
      clearTimeout(id);
      this.timeouts.delete(id);
    }
  }
  
  clearAll() {
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    this.intervals.clear();
    this.timeouts.clear();
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }
  
  start(label) {
    this.metrics[label] = performance.now();
  }
  
  end(label) {
    if (this.metrics[label]) {
      const duration = performance.now() - this.metrics[label];
      delete this.metrics[label];
      return duration;
    }
    return null;
  }
  
  measure(label, callback) {
    this.start(label);
    const result = callback();
    const duration = this.end(label);
    console.log(`${label}: ${duration?.toFixed(2)}ms`);
    return result;
  }
}