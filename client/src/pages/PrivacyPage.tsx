import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-fortress-blue" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>
          
          <div className="mt-6 prose prose-blue max-w-none">
            <p className="text-sm text-gray-500">Last Updated: April 12, 2025</p>
            
            <h2>Introduction</h2>
            <p>
              At KubeFortress, we are committed to protecting your privacy and the security of your data. 
              This Privacy Policy outlines how the KubeFortress Rules Checker handles your information.
            </p>
            
            <h2>Summary of Key Points</h2>
            <ul>
              <li><strong>We do not store your files.</strong> All file processing is done in your browser when possible.</li>
              <li><strong>No personal information</strong> is collected during the scanning process.</li>
              <li>Any temporary server-side processing is immediately deleted after analysis.</li>
              <li>We use minimal analytics only to improve the service functionality.</li>
            </ul>
            
            <h2>Information Collection and Usage</h2>
            
            <h3>File Processing</h3>
            <p>
              <strong>No Storage Policy:</strong> KubeFortress Rules Checker is designed with a "no storage" policy for your files:
            </p>
            <ul>
              <li>
                <strong>Client-Side Processing:</strong> Whenever possible, all file analysis is performed directly in your 
                browser. Your files never leave your computer during this process.
              </li>
              <li>
                <strong>Server-Side Processing:</strong> In cases where server-side processing is required for more complex analysis, 
                files are temporarily processed in memory and deleted immediately after the analysis is completed. We do not retain, 
                store, or log the contents of your uploaded files.
              </li>
              <li>
                <strong>Temporary Storage:</strong> In the rare case of server processing, any temporary files are stored only 
                for the duration of processing (typically seconds) and are immediately deleted afterward.
              </li>
            </ul>
            
            <h3>Technical Information</h3>
            <p>
              We collect minimal technical information necessary to provide and improve our service:
            </p>
            <ul>
              <li>Browser type and version</li>
              <li>General file metadata (file size, file type)</li>
              <li>Error reports</li>
              <li>Usage patterns (features used, processing time)</li>
            </ul>
            <p>
              This information is anonymized and used only for service improvement purposes.
            </p>
            
            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect against unauthorized access to or unauthorized alteration, 
              disclosure, or destruction of data:
            </p>
            <ul>
              <li>All data in transit is encrypted using HTTPS/TLS</li>
              <li>Service infrastructure uses industry-standard security practices</li>
              <li>Regular security audits and updates</li>
              <li>Minimal data retention policies</li>
            </ul>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
              Policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <a href="mailto:privacy@kubefortress.io" className="text-fortress-blue hover:underline">
                privacy@kubefortress.io
              </a>
            </p>
            
            <div className="mt-8 p-4 bg-fortress-light rounded-lg border border-fortress-blue">
              <h3 className="text-fortress-blue font-medium">Our Commitment to Your Privacy</h3>
              <p className="mt-2">
                KubeFortress Rules Checker is designed with privacy in mind. We believe security tools should not 
                compromise your data privacy, which is why we've implemented a strict no-storage policy for all scanned files.
              </p>
              <div className="mt-4">
                <Link
                  to="/scan"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fortress-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fortress-accent"
                >
                  Start Using Rules Checker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
