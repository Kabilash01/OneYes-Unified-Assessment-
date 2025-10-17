import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MinimalFooter Component
 * Minimal footer for Login/Signup pages with copyright and essential links
 * Single row layout for clean, unobtrusive design
 */
const MinimalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © {currentYear} Unified Assessment. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/privacy" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms
            </Link>
            <Link 
              to="/help" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
