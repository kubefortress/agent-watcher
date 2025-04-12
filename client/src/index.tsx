import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Inline component definition to avoid module resolution issues
function App() {
  const [showScan, setShowScan] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResults, setScanResults] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [enableServerProcessing, setEnableServerProcessing] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [scanSettings, setScanSettings] = useState({
    detectUnicode: true,
    detectPatterns: true,
    minSeverity: 2,
    deepAnalysis: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartScan = () => {
    setShowScan(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setScanResults(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setScanResults(null);
    }
  };

  // Helper function to analyze text for potential security issues
  const analyzeText = (text: string) => {
    const lines = text.split('\n');
    const issues: Array<{
      type: string;
      severity: number;
      line: number;
      description: string;
      context: string;
    }> = [];
    
    // Patterns to detect
    const hiddenUnicodeRegex = /[\u200b-\u200f\u2060-\u2064\uFEFF]/;
    
    // Legitimate patterns often found in rule files that should be ignored
    const legitimatePatterns = [
      /\[MODE:\s*[A-Z_]+\]/i,
      /^#+\s*MODE\s*\d/i,
      /\*\*Purpose:\*\*/i,
      /\*\*Permitted:\*\*/i,
      /\*\*Forbidden:\*\*/i,
      /\*\*Requirement:\*\*/i,
      /\*\*Duration:\*\*/i,
      /YOU MUST/i,
      /CRITICAL PROTOCOL/i,
      /META-INSTRUCTION/i
    ];
    
    // Suspicious patterns that could indicate backdoor attempts
    const suspiciousPatterns = [
      {
        regex: /ignore( all)? (security|safety) (checks|measures)/i,
        type: 'Suspicious Instruction',
        description: 'Instructions to bypass security mechanisms'
      },
      {
        regex: /do not (mention|acknowledge|reference|disclose)/i,
        type: 'Hidden Instruction',
        description: 'Instructions to hide actions from users',
        // Legitimate if it's about not mentioning the rules themselves
        contextChecker: (lineText: string, surroundingLines: string[]) => {
          const combinedText = surroundingLines.join('\n').toLowerCase();
          return !combinedText.includes('instruction') && !combinedText.includes('message') && !combinedText.includes('ephemeral');
        }
      },
      {
        regex: /disregard(.*)previous(.*)instructions/i,
        type: 'Instruction Override',
        description: 'Attempt to override previous security instructions'
      }
    ];
    
    // Check each line for issues
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const surroundingLines = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 3));
      
      // Check for hidden Unicode characters
      if (hiddenUnicodeRegex.test(line)) {
        // Verify it's not a false positive by checking if it's in a legitimate context
        const isLegitimateContext = legitimatePatterns.some(pattern => {
          return surroundingLines.some(l => pattern.test(l));
        });
        
        if (!isLegitimateContext) {
          issues.push({
            type: 'Hidden Unicode',
            severity: 4,
            line: lineNum,
            description: 'Invisible Unicode character detected',
            context: line
          });
        }
      }
      
      // Check for suspicious patterns
      suspiciousPatterns.forEach(pattern => {
        if (pattern.regex.test(line)) {
          // Skip if there's a context checker and it returns true (indicating it's legitimate)
          if (pattern.contextChecker && pattern.contextChecker(line, surroundingLines)) {
            return;
          }
          
          // Check if it appears in a legitimate context
          const isLegitimateContext = legitimatePatterns.some(legitPattern => {
            return surroundingLines.some(l => legitPattern.test(l));
          });
          
          if (!isLegitimateContext) {
            issues.push({
              type: pattern.type,
              severity: 3,
              line: lineNum,
              description: pattern.description,
              context: line
            });
          }
        }
      });
    });
    
    return issues;
  };
  
  const handleScan = async () => {
    if (activeTab === 'upload' && !selectedFile) return;
    if (activeTab === 'paste' && !pastedText.trim()) return;
    
    setScanning(true);
    
    // Get text content to analyze
    let textToAnalyze = '';
    if (activeTab === 'upload' && selectedFile) {
      // Read file content
      try {
        textToAnalyze = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = reject;
          reader.readAsText(selectedFile);
        });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    } else if (activeTab === 'paste') {
      textToAnalyze = pastedText;
    }
    
    try {
      // Determine if we should use server-side processing
      const isLargeFile = textToAnalyze.length > 100000; // Over 100KB
      const hasComplexPatterns = textToAnalyze.includes('```') && textToAnalyze.length > 20000;
      const needsServerProcessing = enableServerProcessing && (isLargeFile || hasComplexPatterns);
      
      let issues = [];
      
      if (needsServerProcessing) {
        // Use server-side processing for large or complex files
        const formData = new FormData();
        
        if (activeTab === 'upload' && selectedFile) {
          formData.append('file', selectedFile);
        } else {
          // Create a text file from pasted content
          const textFile = new File([textToAnalyze], 'pasted-rules.txt', { type: 'text/plain' });
          formData.append('file', textFile);
        }
        
        // Add scan settings to the request
        formData.append('deepAnalysis', scanSettings.deepAnalysis.toString());
        formData.append('detectUnicode', scanSettings.detectUnicode.toString());
        formData.append('detectPatterns', scanSettings.detectPatterns.toString());
        formData.append('minSeverity', scanSettings.minSeverity.toString());
        
        // Send to server for processing
        const response = await fetch('http://localhost:8080/api/scan/files', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        const scanId = data.scanId;
        
        // Poll for results
        let scanComplete = false;
        let attempts = 0;
        let serverResults;
        
        while (!scanComplete && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          
          const statusResponse = await fetch(`http://localhost:8080/api/scan/status/${scanId}`);
          if (!statusResponse.ok) {
            throw new Error(`Failed to get scan status: ${statusResponse.status}`);
          }
          
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            scanComplete = true;
            serverResults = statusData.results[0]; // Get the first file result
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'Server scan failed');
          }
          
          attempts++;
        }
        
        if (!scanComplete) {
          throw new Error('Scan timed out');
        }
        
        // Convert server results to client format
        issues = serverResults.suspiciousSections.map((section: any) => ({
          type: section.reason,
          severity: section.severity,
          line: textToAnalyze.substring(0, section.start).split('\n').length,
          description: section.characters.length > 0 
            ? `${section.characters.length} suspicious characters detected` 
            : section.reason,
          context: section.content
        }));
      } else {
        // Use client-side processing for smaller files
        issues = analyzeText(textToAnalyze)
          // Filter issues based on user settings
          .filter(issue => {
            if (!scanSettings.detectUnicode && issue.type.includes('Unicode')) {
              return false;
            }
            if (!scanSettings.detectPatterns && 
                (issue.type.includes('Instruction') || 
                 issue.type.includes('Pattern'))) {
              return false;
            }
            return issue.severity >= scanSettings.minSeverity;
          });
      }
      
      // Create results object
      const results = {
        fileName: activeTab === 'upload' ? selectedFile?.name : 'Pasted Rules',
        scanTime: new Date().toLocaleString(),
        issues: issues
      };
      
      setScanResults(results);
    } catch (error) {
      console.error('Scan error:', error);
      // Show error in UI
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setScanResults({
        fileName: activeTab === 'upload' ? selectedFile?.name : 'Pasted Rules',
        scanTime: new Date().toLocaleString(),
        issues: [{
          type: 'Error',
          severity: 5,
          line: 0,
          description: `Error during scan: ${errorMessage}`,
          context: 'Please try again or use client-side scanning for smaller files'
        }]
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#0c4a6e', fontSize: '2rem', fontWeight: 'bold' }}>
          KubeFortress Rules Checker
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>
          Detect malicious content in AI coding assistant rule files
        </p>
      </header>
      
      <main>
        {!showScan ? (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#0c4a6e', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Welcome to KubeFortress Rules Checker
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              This tool helps you identify potentially dangerous instructions hidden in rule files 
              using invisible Unicode characters and other obfuscation techniques.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Protect your development workflow from the "Rules File Backdoor" vulnerability 
              affecting AI coding assistants.
            </p>
            <button 
              onClick={handleStartScan}
              style={{
                backgroundColor: '#0c4a6e',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Start Scanning
            </button>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#0c4a6e', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Scan Rules
            </h2>
            
            {!scanResults ? (
              <>
                {/* Tab Navigation */}
                <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setActiveTab('upload')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: activeTab === 'upload' ? '#f0f9ff' : 'transparent',
                      borderBottom: activeTab === 'upload' ? '2px solid #0c4a6e' : 'none',
                      color: activeTab === 'upload' ? '#0c4a6e' : '#64748b',
                      fontWeight: activeTab === 'upload' ? 'bold' : 'normal',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setActiveTab('paste')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: activeTab === 'paste' ? '#f0f9ff' : 'transparent',
                      borderBottom: activeTab === 'paste' ? '2px solid #0c4a6e' : 'none',
                      color: activeTab === 'paste' ? '#0c4a6e' : '#64748b',
                      fontWeight: activeTab === 'paste' ? 'bold' : 'normal',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Paste Rules
                  </button>
                </div>
                
                {/* Server processing toggle */}
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'medium', marginBottom: '0.25rem' }}>
                      Advanced Server Processing
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Use server-side analysis for larger files and more advanced detection
                    </div>
                  </div>
                  <div 
                    onClick={() => setEnableServerProcessing(!enableServerProcessing)}
                    className="scanner-toggle-switch"
                    style={{
                      width: '3rem',
                      height: '1.5rem',
                      backgroundColor: enableServerProcessing ? '#0c4a6e' : '#cbd5e1',
                      borderRadius: '9999px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      className="scanner-toggle-knob"
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        backgroundColor: 'white',
                        borderRadius: '9999px',
                        position: 'absolute',
                        top: '0.125rem',
                        left: enableServerProcessing ? '1.625rem' : '0.125rem'
                      }}
                    />
                  </div>
                </div>
                
                {/* Advanced Settings Toggle */}
                <div
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: showAdvancedSettings ? '#f0f9ff' : '#f8fafc',
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 'medium', 
                      color: showAdvancedSettings ? '#0c4a6e' : '#475569',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      Advanced Detection Settings
                      <svg 
                        style={{
                          width: '1rem',
                          height: '1rem',
                          marginLeft: '0.5rem',
                          transform: showAdvancedSettings ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Advanced Settings Panel */}
                {showAdvancedSettings && (
                  <div 
                    style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ marginBottom: '0.5rem', fontWeight: 'medium' }}>Detection Options</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          id="detectUnicode" 
                          checked={scanSettings.detectUnicode}
                          onChange={(e) => setScanSettings({...scanSettings, detectUnicode: e.target.checked})}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <label htmlFor="detectUnicode">Detect hidden Unicode characters</label>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          id="detectPatterns" 
                          checked={scanSettings.detectPatterns}
                          onChange={(e) => setScanSettings({...scanSettings, detectPatterns: e.target.checked})}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <label htmlFor="detectPatterns">Detect suspicious language patterns</label>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          id="deepAnalysis" 
                          checked={scanSettings.deepAnalysis}
                          onChange={(e) => setScanSettings({...scanSettings, deepAnalysis: e.target.checked})}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <label htmlFor="deepAnalysis">Enable deep contextual analysis</label>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ marginBottom: '0.5rem', fontWeight: 'medium' }}>Minimum Severity to Report</div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={scanSettings.minSeverity}
                          onChange={(e) => setScanSettings({...scanSettings, minSeverity: parseInt(e.target.value)})}
                          style={{ flex: 1, marginRight: '0.75rem' }}
                        />
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          backgroundColor: scanSettings.minSeverity >= 4 ? '#fee2e2' : 
                                           scanSettings.minSeverity >= 3 ? '#fef3c7' : 
                                           '#f0fdf4',
                          color: scanSettings.minSeverity >= 4 ? '#b91c1c' : 
                                 scanSettings.minSeverity >= 3 ? '#b45309' : 
                                 '#166534',
                          borderRadius: '0.25rem',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}>
                          {scanSettings.minSeverity}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        <span>Low (Show All)</span>
                        <span>High (Critical Only)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* File Upload Tab Content */}
                {activeTab === 'upload' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: '1.5rem',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept=".txt,.json,.md,.rules"
                    />
                    {selectedFile ? (
                      <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          Selected file: {selectedFile.name}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Drop your rules file here</p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>or click to browse</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Paste Rules Tab Content */}
                {activeTab === 'paste' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ marginBottom: '0.5rem', color: '#475569' }}>
                      Paste your AI assistant rules content below:
                    </p>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your rules here (e.g., user_rules, system_prompt, etc.)"
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        resize: 'vertical',
                        backgroundColor: '#f8fafc'
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                      We analyze the text client-side for privacy. Your data doesn't leave your browser.
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setShowScan(false)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #cbd5e1',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleScan}
                    disabled={(activeTab === 'upload' && !selectedFile) || 
                             (activeTab === 'paste' && !pastedText.trim()) || 
                             scanning}
                    style={{
                      backgroundColor: (activeTab === 'upload' && selectedFile) || 
                                      (activeTab === 'paste' && pastedText.trim()) ? 
                                      '#0c4a6e' : '#94a3b8',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: (activeTab === 'upload' && selectedFile) || 
                              (activeTab === 'paste' && pastedText.trim()) ? 
                              'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {scanning ? (
                      <span className="processing-indicator">
                        <svg className="processing-spinner" style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="8" />
                        </svg>
                        {enableServerProcessing ? 'Processing on Server...' : 'Scanning...'}
                      </span>
                    ) : (
                      'Analyze Rules'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ color: '#0c4a6e', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    Scan Results
                  </h3>
                  <p><strong>File:</strong> {scanResults.fileName}</p>
                  <p><strong>Scan time:</strong> {scanResults.scanTime}</p>
                  <p><strong>Issues found:</strong> {scanResults.issues.length}</p>
                </div>
                
                {scanResults.issues.map((issue: any, index: number) => (
                  <div key={index} style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }} className={issue.severity >= 4 ? 'scan-result-error' : issue.severity >= 3 ? 'scan-result-warning' : 'scan-result-success'}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>{issue.type}</span>
                      <span style={{
                        backgroundColor: issue.severity >= 4 ? '#fee2e2' : '#fef3c7',
                        color: issue.severity >= 4 ? '#b91c1c' : '#b45309',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        Severity: {issue.severity}/5
                      </span>
                    </div>
                    <p><strong>Line {issue.line}:</strong> {issue.description}</p>
                    <pre style={{ 
                      backgroundColor: '#f1f5f9',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      overflowX: 'auto',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem'
                    }}>
                      {issue.context}
                    </pre>
                  </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => {
                      setScanResults(null);
                      setSelectedFile(null);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #cbd5e1',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Scan Another File
                  </button>
                  
                  <button
                    onClick={() => setShowScan(false)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#0c4a6e',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #0c4a6e',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);