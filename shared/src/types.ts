/**
 * Represents a detected suspicious character in a file
 */
export interface SuspiciousCharacter {
  /** Character code point */
  codePoint: number;
  /** Human-readable name of the character */
  name: string;
  /** Position in the text where the character was found */
  position: number;
  /** Severity level (1-5, with 5 being most severe) */
  severity: number;
  /** Category of the character (e.g., 'zero-width', 'control', etc.) */
  category: string;
  /** Description of why this character might be problematic */
  description: string;
}

/**
 * Represents a section of text with suspicious content
 */
export interface SuspiciousSection {
  /** Start position in the text */
  start: number;
  /** End position in the text */
  end: number;
  /** The problematic text content */
  content: string;
  /** Detected suspicious characters within this section */
  characters: SuspiciousCharacter[];
  /** Overall severity of this section (1-5) */
  severity: number;
  /** Reason why this section is flagged */
  reason: string;
}

/**
 * Results of a rules file scan
 */
export interface ScanResult {
  /** Original filename */
  filename: string;
  /** Whether the file contains suspicious content */
  hasSuspiciousContent: boolean;
  /** Overall severity score (1-5) */
  severityScore: number;
  /** List of suspicious sections found */
  suspiciousSections: SuspiciousSection[];
  /** Total number of suspicious characters detected */
  suspiciousCharacterCount: number;
  /** Timestamp when the scan was performed */
  timestamp: number;
  /** Summary of findings */
  summary: string;
  /** Recommendations based on the scan */
  recommendations: string[];
}

/**
 * Options for the file scanner
 */
export interface ScanOptions {
  /** Whether to perform deep analysis (more thorough but slower) */
  deepAnalysis?: boolean;
  /** Maximum file size to analyze in bytes */
  maxFileSize?: number;
  /** File types to include in directory scans */
  includeExtensions?: string[];
}

/**
 * Configuration for the rules scanner
 */
export interface ScannerConfig {
  /** Minimum severity level to report (1-5) */
  minSeverity: number;
  /** Whether to include character details in results */
  includeCharacterDetails: boolean;
  /** Maximum number of suspicious sections to report */
  maxSections: number;
  /** Custom patterns to search for (regex strings) */
  customPatterns?: string[];
}
