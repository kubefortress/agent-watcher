import React from 'react';

function SimpleApp() {
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
          <button style={{
            backgroundColor: '#0c4a6e',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Start Scanning
          </button>
        </div>
      </main>
    </div>
  );
}

export default SimpleApp;
