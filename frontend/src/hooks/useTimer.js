import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for countdown timer
 * @param {number} durationInMinutes - Total duration in minutes
 * @param {function} onTimeUp - Callback when timer reaches zero
 * @returns {Object} Timer state and controls
 */
export const useTimer = (durationInMinutes, onTimeUp) => {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          if (onTimeUp) onTimeUp();
          toast.error('Time is up! Submitting your assessment...', { autoClose: 5000 });
          return 0;
        }

        // Warnings
        if (prev === 300) { // 5 minutes
          toast.warning('⏰ 5 minutes remaining!', { autoClose: 5000 });
        } else if (prev === 60) { // 1 minute
          toast.error('⚠️ 1 minute remaining!', { autoClose: 5000 });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, onTimeUp]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(durationInMinutes * 60);
    setIsRunning(false);
    setIsPaused(false);
  }, [durationInMinutes]);

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    isWarning: timeLeft <= 300 && timeLeft > 60,
    isCritical: timeLeft <= 60
  };
};
