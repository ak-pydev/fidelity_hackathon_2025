import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Fantasy Options League
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/leagues" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Leagues
              </Link>
              <Link 
                to="/analysis" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Options Analyzer
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};