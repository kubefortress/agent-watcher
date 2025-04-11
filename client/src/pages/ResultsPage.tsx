import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScanResults from '../components/ScanResults';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ScanResult } from 'shared';

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, ScanResult>>({});
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  
  useEffect(() => {
    // Retrieve results from session storage
    const storedResults = sessionStorage.getItem('scanResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        
        // Select the first result by default
        const resultKeys = Object.keys(parsedResults);
        if (resultKeys.length > 0) {
          setSelectedResult(resultKeys[0]);
        }
      } catch (error) {
        console.error('Failed to parse scan results:', error);
      }
    }
  }, []);
  
  // Get severity class for result tabs
  const getSeverityClass = (result: ScanResult) => {
    if (!result.hasSuspiciousContent) return '';
    
    switch (result.severityScore) {
      case 1: return 'border-l-2 border-green-500';
      case 2: return 'border-l-2 border-blue-500';
      case 3: return 'border-l-2 border-yellow-500';
      case 4: return 'border-l-2 border-orange-500';
      case 5: return 'border-l-2 border-red-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Scan Results</h1>
        <Link
          to="/scan"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent"
        >
          <ArrowLeftIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
          Back to Scanner
        </Link>
      </div>
      
      {Object.keys(results).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No scan results available. Please return to the scanner to analyze files.</p>
          <div className="mt-6">
            <Link
              to="/scan"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fortress-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent"
            >
              Go to Scanner
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {Object.keys(results).length > 1 && (
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {Object.entries(results).map(([id, result]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedResult(id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      selectedResult === id
                        ? 'text-fortress-blue border-b-2 border-fortress-blue'
                        : 'text-gray-500 hover:text-gray-700'
                    } ${getSeverityClass(result)}`}
                  >
                    {result.filename}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="px-4 py-5 sm:p-6">
            {selectedResult && results[selectedResult] && (
              <ScanResults results={results[selectedResult]} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
