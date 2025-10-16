import React from 'react';
import { useSidebar } from '../../context/SidebarContext';

/**
 * Sidebar Overlay Component
 * Semi-transparent backdrop that appears when sidebar is open on mobile
 * Clicking the overlay closes the sidebar
 */
const SidebarOverlay = () => {
  const { isSidebarOpen, isMobile, closeSidebar } = useSidebar();

  // Only show overlay on mobile when sidebar is open
  if (!isMobile || !isSidebarOpen) return null;

  return (
    <div
      onClick={closeSidebar}
      className={`
        fixed inset-0 z-[1001]
        bg-black/50 backdrop-blur-sm
        transition-opacity duration-300 ease-in-out
        ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      aria-hidden="true"
      role="button"
      tabIndex={-1}
    />
  );
};

export default SidebarOverlay;
