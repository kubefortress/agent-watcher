import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-fortress-blue text-white' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  className="h-10 w-auto"
                  src="/kubefortress.png"
                  alt="KubeFortress"
                />
                <span className="ml-2 text-xl font-semibold text-fortress-blue">
                  KubeFortress <span className="font-normal">Rules Checker</span>
                </span>
              </Link>
              <nav className="ml-10 flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                >
                  Home
                </Link>
                <Link
                  to="/scan"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/scan')}`}
                >
                  Scan
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/about')}`}
                >
                  About
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <a
                href="https://github.com/kubefortress/agent-watcher"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-fortress-blue" />
              <p className="ml-2 text-sm text-gray-500">
                &copy; {new Date().getFullYear()} KubeFortress Security. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-gray-500 hover:text-fortress-blue text-sm"
              >
                Privacy Policy
              </Link>
              <a
                href="https://kubefortress.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fortress-accent hover:text-fortress-blue text-sm"
              >
                kubefortress.io
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
