import React from 'react';
import { useSidebar } from '../../context/SidebarContext';

/**
 * Hamburger Button Component
 * Floating button that toggles sidebar on mobile
 * Animates from 3 lines to X when active
 */
const HamburgerButton = () => {
  const { isSidebarOpen, isMobile, toggleSidebar } = useSidebar();

  // Hide on desktop
  if (!isMobile) return null;

  return (
    <button
      onClick={toggleSidebar}
      className={`
        fixed z-[1001] 
        w-12 h-12 rounded-full
        flex flex-col items-center justify-center gap-1.5
        border shadow-lg
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        ${isSidebarOpen 
          ? 'bg-[#5B5FEF] border-[#5B5FEF]' 
          : 'bg-white border-gray-200 hover:border-[#5B5FEF]'
        }
        top-20 left-4
        md:top-20 md:left-4
      `}
      aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isSidebarOpen}
    >
      {/* Top Line */}
      <span 
        className={`
          block w-6 h-0.5 rounded-full
          transition-all duration-300 ease-in-out
          ${isSidebarOpen 
            ? 'bg-white rotate-45 translate-y-2' 
            : 'bg-gray-800 group-hover:bg-[#5B5FEF]'
          }
        `}
      />
      
      {/* Middle Line */}
      <span 
        className={`
          block w-6 h-0.5 rounded-full
          transition-all duration-300 ease-in-out
          ${isSidebarOpen 
            ? 'bg-white opacity-0' 
            : 'bg-gray-800 group-hover:bg-[#5B5FEF]'
          }
        `}
      />
      
      {/* Bottom Line */}
      <span 
        className={`
          block w-6 h-0.5 rounded-full
          transition-all duration-300 ease-in-out
          ${isSidebarOpen 
            ? 'bg-white -rotate-45 -translate-y-2' 
            : 'bg-gray-800 group-hover:bg-[#5B5FEF]'
          }
        `}
      />
    </button>
  );
};

export default HamburgerButton;
