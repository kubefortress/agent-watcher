import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#0c4a6e' }}>KubeFortress Rules Checker - Test Page</h1>
      <p>If you can see this text, React is working correctly.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0f2fe', borderRadius: '5px' }}>
        <p>This is a test component to diagnose rendering issues.</p>
      </div>
    </div>
  );
};

export default TestApp;
