import { useState, useEffect } from 'react';

/**
 * Custom hook to manage back-to-top button visibility and functionality
 * Shows button after scrolling down 300px
 * @returns {Object} - showBackToTop state and scrollToTop function
 */
const useBackToTop = (threshold = 300) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  /**
   * Scroll smoothly to the top of the page
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return {
    showBackToTop,
    scrollToTop
  };
};

export default useBackToTop;
