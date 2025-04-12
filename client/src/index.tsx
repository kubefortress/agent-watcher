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
    
    // Analyze the text
    const issues = analyzeText(textToAnalyze);
    
    // Create results object
    const results = {
      fileName: activeTab === 'upload' ? selectedFile?.name : 'Pasted Rules',
      scanTime: new Date().toLocaleString(),
      issues: issues
    };
    
    setScanResults(results);
    setScanning(false);
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
                      alignItems: 'center'
                    }}
                  >
                    {scanning ? 'Scanning...' : 'Analyze Rules'}
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
                  }}>
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
