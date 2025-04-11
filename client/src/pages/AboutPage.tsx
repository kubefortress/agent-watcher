import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <ShieldExclamationIcon className="h-8 w-8 text-fortress-blue" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              The Rules File Backdoor Vulnerability
            </h1>
          </div>
          
          <div className="mt-6 prose prose-blue max-w-none">
            <h2>Executive Summary</h2>
            <p>
              Security researchers have uncovered a dangerous new supply chain attack vector named "Rules File Backdoor." 
              This technique enables hackers to silently compromise AI-generated code by injecting hidden malicious 
              instructions into seemingly innocent configuration files used by AI-powered code editors like Cursor and GitHub Copilot.
            </p>
            <p>
              By exploiting hidden unicode characters and sophisticated evasion techniques in the model-facing instruction payload, 
              threat actors can manipulate the AI to insert malicious code that bypasses typical code reviews. This attack remains 
              virtually invisible to developers and security teams, allowing malicious code to silently propagate through projects.
            </p>
            
            <h2>The Attack Mechanism</h2>
            <p>
              The attack exploits the AI's contextual understanding by embedding carefully crafted prompts within seemingly benign rule files. 
              When developers initiate code generation, the poisoned rules subtly influence the AI to produce code containing security 
              vulnerabilities or backdoors.
            </p>
            
            <h3>The attack leverages several technical mechanisms:</h3>
            <ul>
              <li>
                <strong>Contextual Manipulation:</strong> Embedding instructions that appear legitimate but direct the AI to modify 
                code generation behavior
              </li>
              <li>
                <strong>Unicode Obfuscation:</strong> Using zero-width joiners, bidirectional text markers, and other invisible 
                characters to hide malicious instructions
              </li>
              <li>
                <strong>Semantic Hijacking:</strong> Exploiting the AI's natural language understanding with subtle linguistic 
                patterns that redirect code generation toward vulnerable implementations
              </li>
              <li>
                <strong>Cross-Agent Vulnerability:</strong> The attack works across different AI coding assistants, suggesting a 
                systemic vulnerability
              </li>
            </ul>
            
            <p>
              What makes "Rules Files Backdoor" particularly dangerous is its persistent nature. Once a poisoned rule file is 
              incorporated into a project repository, it affects all future code-generation sessions by team members. Furthermore, 
              the malicious instructions often survive project forking, creating a vector for supply chain attacks that can affect 
              downstream dependencies and end users.
            </p>
            
            <h2>Wide-Ranging Implications</h2>
            <p>
              The "Rules File Backdoor" attack can manifest in several dangerous ways:
            </p>
            
            <h3>Overriding Security Controls</h3>
            <p>
              Injected malicious directives can override safe defaults, causing the AI to generate code that bypasses security 
              checks or includes vulnerable constructs.
            </p>
            
            <h3>Generating Vulnerable Code</h3>
            <p>
              By instructing the AI to incorporate backdoors or insecure practices, attackers can cause the AI to output code 
              with embedded vulnerabilities. For example, a malicious rule might direct the AI to:
            </p>
            <ul>
              <li>Prefer insecure cryptographic algorithms</li>
              <li>Implement authentication checks with subtle bypasses</li>
              <li>Disable input validation in specific contexts</li>
            </ul>
            
            <h3>Data Exfiltration</h3>
            <p>
              A well-crafted malicious rule could direct the AI to add code that leaks sensitive information. For instance, 
              rules that instruct the AI to "follow best practices for debugging" might secretly direct it to add code that exfiltrates:
            </p>
            <ul>
              <li>Environment variables</li>
              <li>Database credentials</li>
              <li>API keys</li>
              <li>User data</li>
            </ul>
            
            <h2>Mitigation Strategies</h2>
            <p>
              To mitigate this risk, we recommend the following technical countermeasures:
            </p>
            <ul>
              <li>
                <strong>Audit Existing Rules:</strong> Review all rule files in your repositories for potential malicious 
                instructions, focusing on invisible Unicode characters and unusual formatting.
              </li>
              <li>
                <strong>Implement Validation Processes:</strong> Establish review procedures specifically for AI configuration 
                files, treating them with the same scrutiny as executable code.
              </li>
              <li>
                <strong>Deploy Detection Tools:</strong> Implement tools that can identify suspicious patterns in rule files 
                and monitor AI-generated code for indicators of compromise.
              </li>
              <li>
                <strong>Review AI-Generated Code:</strong> Pay special attention to unexpected additions like external resource 
                references, unusual imports, or complex expressions.
              </li>
            </ul>
            
            <div className="mt-8 p-4 bg-fortress-light rounded-lg border border-fortress-blue">
              <h3 className="text-fortress-blue font-medium">How Our Scanner Helps</h3>
              <p className="mt-2">
                The KubeFortress Rules Checker is designed specifically to detect the techniques used in the "Rules File Backdoor" attack. 
                Our scanner:
              </p>
              <ul>
                <li>Identifies invisible Unicode characters used to hide malicious instructions</li>
                <li>Detects suspicious language patterns that could indicate backdoor attempts</li>
                <li>Provides clear visualizations of hidden content</li>
                <li>Offers remediation recommendations based on findings</li>
              </ul>
              <div className="mt-4">
                <Link
                  to="/scan"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fortress-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent"
                >
                  Start Scanning Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
