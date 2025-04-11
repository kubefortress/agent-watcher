/**
 * File information used in the UI
 */
export interface FileInfo {
  /** File name with extension */
  name: string;
  /** File size in bytes */
  size: number;
  /** File type/MIME type */
  type: string;
  /** File content as text */
  content?: string;
  /** Unique identifier */
  id: string;
}

/**
 * State for the file upload component
 */
export interface FileUploadState {
  /** List of files selected by the user */
  files: FileInfo[];
  /** Whether files are currently being processed */
  isProcessing: boolean;
  /** Any error that occurred during upload */
  error: string | null;
}

/**
 * Scan results stored in application state
 */
export interface ScanState {
  /** Whether scanning is in progress */
  isScanning: boolean;
  /** Results for each file */
  results: Record<string, any>;
  /** Any error that occurred during scanning */
  error: string | null;
}

/**
 * UI state for the scan options
 */
export interface ScanOptionsState {
  /** Whether to perform deep analysis */
  deepAnalysis: boolean;
  /** File types to include in scans */
  fileTypes: string[];
  /** Maximum file size to analyze */
  maxFileSize: number;
}
