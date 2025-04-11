import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-white overflow-hidden shadow-lg rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex">
            <div className="sm:flex-1">
              <h1 className="text-3xl font-bold text-fortress-blue">
                Rules File Backdoor Scanner
              </h1>
              <p className="mt-3 text-xl text-gray-500">
                Detect hidden malicious content in AI coding assistant rule files
              </p>
              <p className="mt-4 text-gray-600 max-w-3xl">
                This tool helps you identify potentially dangerous instructions hidden in rule files 
                using invisible Unicode characters and other obfuscation techniques. Protect your 
                development workflow from the "Rules File Backdoor" vulnerability affecting AI coding assistants.
              </p>
              <div className="mt-6">
                <Link
                  to="/scan"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-fortress-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent"
                >
                  Scan Your Files
                  <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-5 flex-shrink-0">
              <ShieldCheckIcon className="h-32 w-32 text-fortress-accent opacity-75" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">How It Works</h2>
            <div className="mt-4 space-y-4 text-sm text-gray-500">
              <p>
                Our tool analyzes rules files to detect:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Invisible Unicode Characters</strong> - Zero-width joiners, 
                  spaces, and other hidden characters used to conceal malicious instructions
                </li>
                <li>
                  <strong>Bidirectional Text Controls</strong> - Characters that can 
                  manipulate text display direction to hide content
                </li>
                <li>
                  <strong>Suspicious Instructions</strong> - Language patterns that may 
                  indicate backdoor attempts
                </li>
              </ul>
              <p>
                The scanner provides detailed reports with visualizations of hidden 
                content, severity ratings, and recommendations for remediation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
              <h2 className="ml-2 text-lg font-medium text-gray-900">About the Vulnerability</h2>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>
                The "Rules File Backdoor" vulnerability enables hackers to silently compromise 
                AI-generated code by injecting hidden malicious instructions into configuration 
                files used by AI coding assistants like GitHub Copilot and Cursor.
              </p>
              <p className="mt-2">
                Unlike traditional code injection attacks, this technique weaponizes the AI 
                assistant itself as an attack vector, turning the developer's trusted tool into 
                an unwitting accomplice.
              </p>
              <div className="mt-4">
                <Link
                  to="/about"
                  className="text-fortress-accent hover:text-fortress-blue font-medium"
                >
                  Learn more about the vulnerability <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Features</h2>
          <div className="mt-5 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-fortress-light rounded-lg px-4 py-5">
              <h3 className="text-fortress-blue font-medium">Client-Side Analysis</h3>
              <p className="mt-2 text-sm text-gray-600">
                Files are analyzed locally in your browser, ensuring your sensitive code never leaves your machine.
              </p>
            </div>
            <div className="bg-fortress-light rounded-lg px-4 py-5">
              <h3 className="text-fortress-blue font-medium">Detailed Reporting</h3>
              <p className="mt-2 text-sm text-gray-600">
                Comprehensive results with visualizations of hidden characters, severity ratings, and remediation advice.
              </p>
            </div>
            <div className="bg-fortress-light rounded-lg px-4 py-5">
              <h3 className="text-fortress-blue font-medium">Multiple File Support</h3>
              <p className="mt-2 text-sm text-gray-600">
                Scan multiple files simultaneously to check entire projects for potential vulnerabilities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
