import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { FileInfo } from '../types';
import { useFileScanner } from '../hooks/useFileScanner';
import { 
  DocumentMagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ScanPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [deepAnalysis, setDeepAnalysis] = useState(true);
  const navigate = useNavigate();
  
  const { 
    scanFiles, 
    isScanning, 
    scanResults, 
    error 
  } = useFileScanner();
  
  // Handle file selection
  const handleFilesSelected = (selectedFiles: FileInfo[]) => {
    setFiles(selectedFiles);
  };
  
  // Start the scan
  const handleScanClick = async () => {
    if (files.length === 0) {
      return;
    }
    
    await scanFiles(files, { deepAnalysis });
  };
  
  // Navigate to results page when scan completes
  useEffect(() => {
    const resultKeys = Object.keys(scanResults);
    if (resultKeys.length > 0 && !isScanning) {
      // Store results in session storage for results page
      sessionStorage.setItem('scanResults', JSON.stringify(scanResults));
      navigate('/results');
    }
  }, [scanResults, isScanning, navigate]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2 text-fortress-blue" />
            Upload Files to Scan
          </h2>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Upload your AI assistant rule files to scan for potential backdoors. 
              Files are analyzed locally in your browser for privacy.
            </p>
          </div>
          <div className="mt-5">
            <FileUpload onFilesSelected={handleFilesSelected} />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-fortress-blue" />
            Scan Options
          </h2>
          <div className="mt-5">
            <div className="flex items-center">
              <input
                id="deep-analysis"
                name="deep-analysis"
                type="checkbox"
                checked={deepAnalysis}
                onChange={(e) => setDeepAnalysis(e.target.checked)}
                className="h-4 w-4 text-fortress-blue focus:ring-fortress-accent border-gray-300 rounded"
              />
              <label htmlFor="deep-analysis" className="ml-2 block text-sm text-gray-900">
                Deep Analysis
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Performs more thorough analysis to detect subtler backdoor attempts. 
              May take longer for large files.
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error scanning files</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleScanClick}
          disabled={files.length === 0 || isScanning}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            files.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-fortress-blue hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent`}
        >
          {isScanning ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              Scanning...
            </>
          ) : (
            'Scan Files'
          )}
        </button>
      </div>
    </div>
  );
};

export default ScanPage;
