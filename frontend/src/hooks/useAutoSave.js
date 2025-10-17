import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for auto-saving data
 * @param {function} saveFunction - Async function to save data
 * @param {any} data - Data to save
 * @param {number} interval - Auto-save interval in milliseconds (default 30000ms = 30s)
 * @returns {Object} Auto-save state and controls
 */
export const useAutoSave = (saveFunction, data, interval = 30000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);
  const previousDataRef = useRef(data);

  useEffect(() => {
    // Check if data has changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (!dataChanged) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveFunction(data);
        setLastSaved(new Date());
        previousDataRef.current = data;
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Failed to save. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, interval]);

  const saveNow = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    try {
      await saveFunction(data);
      setLastSaved(new Date());
      previousDataRef.current = data;
      toast.success('✓ Saved successfully!', { autoClose: 2000 });
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    lastSaved,
    saveNow
  };
};
