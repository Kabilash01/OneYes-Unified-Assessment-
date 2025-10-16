import { useState, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useCallback(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for local storage
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Custom hook for dark mode
 */
export const useDarkMode = () => {
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on mount
  useState(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, [isDark]);

  return [isDark, toggleDarkMode];
};

/**
 * Custom hook for pagination
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const reset = () => {
    setPage(initialPage);
  };

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
};
