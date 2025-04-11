import React from 'react';
import { ExclamationTriangleIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ScanResult, SuspiciousSection } from 'shared';

interface ScanResultsProps {
  results: ScanResult;
}

const ScanResults: React.FC<ScanResultsProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  const getSeverityBadge = (score: number) => {
    let color, text;
    
    switch (score) {
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Safe
          </span>
        );
      case 1:
        color = 'severity-1';
        text = 'Low Risk';
        break;
      case 2:
        color = 'severity-2';
        text = 'Moderate Risk';
        break;
      case 3:
        color = 'severity-3';
        text = 'Concerning';
        break;
      case 4:
        color = 'severity-4';
        text = 'High Risk';
        break;
      case 5:
        color = 'severity-5';
        text = 'Critical Risk';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 border-gray-300';
        text = 'Unknown';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  const renderSectionContent = (section: SuspiciousSection) => {
    let content = section.content;
    
    // Replace zero-width characters with visible representations
    section.characters.forEach(char => {
      const charCode = char.codePoint.toString(16).toUpperCase().padStart(4, '0');
      // We need to replace at exact positions, so we'll build a new string
      const pre = content.substring(0, char.position - section.start);
      const post = content.substring(char.position - section.start + 1);
      content = pre + `<span class="hidden-char">${charCode}</span>` + post;
    });
    
    return (
      <div 
        className="font-mono text-sm p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Scan Results: {results.filename}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                {results.summary}
              </p>
            </div>
          </div>
          <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
            {getSeverityBadge(results.severityScore)}
          </div>
        </div>
        
        {results.hasSuspiciousContent ? (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon 
                className="h-5 w-5 text-yellow-500" 
                aria-hidden="true" 
              />
              <h4 className="ml-2 text-sm font-medium text-gray-900">
                Suspicious Sections Detected
              </h4>
            </div>
            
            <div className="mt-3 space-y-4">
              {results.suspiciousSections.map((section, idx) => (
                <div key={idx} className="rounded-md border border-gray-200 overflow-hidden">
                  <div className={`px-4 py-2 flex justify-between items-center severity-${section.severity}`}>
                    <span className="font-medium text-sm">
                      {section.reason}
                    </span>
                    {getSeverityBadge(section.severity)}
                  </div>
                  <div className="p-4">
                    {renderSectionContent(section)}
                    
                    {section.characters.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Suspicious Characters:</p>
                        <ul className="mt-1 grid gap-2 grid-cols-1 sm:grid-cols-2">
                          {section.characters.map((char, charIdx) => (
                            <li key={charIdx} className="text-xs border border-gray-200 rounded p-2">
                              <span className="font-medium">U+{char.codePoint.toString(16).toUpperCase().padStart(4, '0')}</span>
                              <span className="ml-2 text-gray-500">{char.name}</span>
                              <p className="mt-1 text-gray-600">{char.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">No suspicious content detected</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>This file appears to be safe and does not contain any hidden Unicode characters or suspicious patterns.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {results.recommendations.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center">
              <ShieldExclamationIcon 
                className="h-5 w-5 text-fortress-blue" 
                aria-hidden="true" 
              />
              <h4 className="ml-2 text-sm font-medium text-gray-900">
                Recommendations
              </h4>
            </div>
            
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <ul className="list-disc pl-5 space-y-1">
                {results.recommendations.map((recommendation, idx) => (
                  <li key={idx}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
