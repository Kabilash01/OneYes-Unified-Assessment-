import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Footer Component
 * Simple, modern footer for all pages
 */
const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} Unified Assessment Platform. All rights reserved.
          </div>

          {/* Center: Made with love */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by the OneYes Team</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/student/help"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
