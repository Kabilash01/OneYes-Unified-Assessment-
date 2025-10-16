import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sidebar_collapsed';

/**
 * Custom hook for managing sidebar collapse state
 * Persists state in localStorage
 * 
 * @returns {Object} Sidebar collapse state and methods
 */
export const useSidebarCollapse = () => {
  // Initialize from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.error('Error reading sidebar state from localStorage:', error);
      return false;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
    } catch (error) {
      console.error('Error saving sidebar state to localStorage:', error);
    }
  }, [isCollapsed]);

  /**
   * Toggle the collapse state
   */
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  /**
   * Set sidebar to collapsed state
   */
  const collapse = () => {
    setIsCollapsed(true);
  };

  /**
   * Set sidebar to expanded state
   */
  const expand = () => {
    setIsCollapsed(false);
  };

  return {
    isCollapsed,
    toggleCollapse,
    collapse,
    expand,
  };
};
