// src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-4">CareerGuide LS</h3>
            <p className="text-gray-300 text-sm">
              Connecting students with higher education institutions and career opportunities in Lesotho.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/student/apply" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Find Institutions
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Job Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Maseru, Lesotho</li>
              <li>support@careerguide.ls</li>
              <li>+26658353861</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} CareerGuide LS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;