import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for timer functionality
 * @param {number} initialTime - Initial time in seconds
 * @param {Function} onExpire - Callback when timer expires
 * @returns {Object} Timer state and controls
 */
export const useTimer = (initialTime, onExpire) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset timer
  const reset = useCallback((newTime) => {
    setTimeRemaining(newTime || initialTime);
    setIsRunning(false);
  }, [initialTime]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onExpire) {
              onExpire();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onExpire]);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning,
    start,
    pause,
    reset,
    isExpired: timeRemaining === 0,
  };
};

/**
 * Custom hook for auto-save functionality
 * @param {Function} saveFunction - Function to call for saving
 * @param {any} data - Data to save
 * @param {number} interval - Auto-save interval in milliseconds (default: 30000)
 * @returns {Object} Auto-save state and controls
 */
export const useAutoSave = (saveFunction, data, interval = 30000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState(null);
  
  const timeoutRef = useRef(null);
  const previousDataRef = useRef(data);

  // Debounced save function
  const debouncedSave = useCallback(async () => {
    if (!saveFunction || !hasUnsavedChanges) return;

    try {
      setIsSaving(true);
      setError(null);
      await saveFunction(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      previousDataRef.current = data;
    } catch (err) {
      setError(err.message || 'Failed to save');
      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction, data, hasUnsavedChanges]);

  // Manual save function
  const forceSave = useCallback(async () => {
    if (!saveFunction) return;

    try {
      setIsSaving(true);
      setError(null);
      await saveFunction(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      previousDataRef.current = data;
      return true;
    } catch (err) {
      setError(err.message || 'Failed to save');
      console.error('Force save error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction, data]);

  // Detect changes in data
  useEffect(() => {
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    if (hasChanged) {
      setHasUnsavedChanges(true);
    }
  }, [data]);

  // Auto-save interval
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      timeoutRef.current = setTimeout(() => {
        debouncedSave();
      }, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isSaving, interval, debouncedSave]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error,
    forceSave,
  };
};
