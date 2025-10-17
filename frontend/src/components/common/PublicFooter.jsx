import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

/**
 * PublicFooter Component
 * Full-featured footer for Landing Page with 4-column grid layout
 * Includes: Brand, Quick Links, Resources, Contact Info
 */
const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">UA</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Unified Assessment
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A comprehensive platform for conducting and managing assessments efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/features" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/documentation" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <a 
                  href="mailto:support@unifiedassessment.com"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  support@unifiedassessment.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">
                  123 Education Street<br />
                  City, State 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-sm text-gray-600">
              © {currentYear} Unified Assessment. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
