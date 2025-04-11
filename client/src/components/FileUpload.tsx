import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, XMarkIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { FileInfo } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: FileInfo[]) => void;
  maxFileSize?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = {
    'text/plain': ['.txt', '.json', '.yaml', '.yml', '.md', '.cursor'],
    'application/json': ['.json'],
    'application/x-yaml': ['.yaml', '.yml'],
  }
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    
    // Process each file to get its content
    const processedFiles: FileInfo[] = [];
    
    for (const file of acceptedFiles) {
      // Check file size
      if (file.size > maxFileSize) {
        setError(`File ${file.name} exceeds the maximum size limit of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB.`);
        continue;
      }
      
      try {
        const content = await readFileContent(file);
        processedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      } catch (err) {
        console.error('Error reading file:', err);
        setError(`Failed to read file ${file.name}. Make sure it's a valid text file.`);
      }
    }
    
    setFiles(prevFiles => [...prevFiles, ...processedFiles]);
    if (processedFiles.length > 0) {
      onFilesSelected(processedFiles);
    }
  }, [maxFileSize, onFilesSelected]);
  
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };
  
  const removeFile = (id: string) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter(file => file.id !== id);
      onFilesSelected(newFiles);
      return newFiles;
    });
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: acceptedFileTypes,
    maxSize: maxFileSize
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center ${
          isDragActive ? 'file-drop-active' : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          {isDragActive ? 'Drop the files here' : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Accepted file types: JSON, YAML, Markdown, Text, and Cursor rules
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">Selected files:</h3>
          <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
            {files.map(file => (
              <li key={file.id} className="flex items-center justify-between py-2 px-4 text-sm">
                <div className="flex items-center">
                  <DocumentCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-900">{file.name}</span>
                  <span className="ml-2 text-gray-500 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
