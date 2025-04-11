import { useState, useCallback } from 'react';
import { FileInfo } from '../types';
import { analyzeContent, ScanResult, ScanOptions } from 'shared';

interface UseScannerResult {
  scanResults: Record<string, ScanResult>;
  isScanning: boolean;
  error: string | null;
  scanFiles: (files: FileInfo[], options?: ScanOptions) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook for scanning files client-side
 */
export const useFileScanner = (): UseScannerResult => {
  const [scanResults, setScanResults] = useState<Record<string, ScanResult>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Scans an array of files for suspicious content
   */
  const scanFiles = useCallback(async (files: FileInfo[], options?: ScanOptions) => {
    if (files.length === 0) {
      setError('No files selected for scanning.');
      return;
    }

    setIsScanning(true);
    setError(null);
    
    try {
      // Process files one by one
      const results: Record<string, ScanResult> = {};
      
      for (const file of files) {
        if (!file.content) {
          throw new Error(`File ${file.name} has no content.`);
        }
        
        // Use Web Worker for better performance if available
        if (window.Worker) {
          // For this implementation, we'll directly use the analyze function
          // In a production app, you'd want to offload this to a Web Worker
          const result = analyzeContent(file.content, file.name, options);
          results[file.id] = result;
        } else {
          // Fallback for browsers without Web Worker support
          const result = analyzeContent(file.content, file.name, options);
          results[file.id] = result;
        }
      }
      
      setScanResults(results);
    } catch (err) {
      console.error('Error during file scanning:', err);
      setError('Failed to scan files. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * Clears all scan results
   */
  const clearResults = useCallback(() => {
    setScanResults({});
    setError(null);
  }, []);

  return {
    scanResults,
    isScanning,
    error,
    scanFiles,
    clearResults
  };
};

export default useFileScanner;
