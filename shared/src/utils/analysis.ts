import { 
  SUSPICIOUS_PATTERNS, 
  DEFAULT_SCANNER_CONFIG 
} from '../constants';
import { 
  ScanResult, 
  SuspiciousSection,
  SuspiciousCharacter,
  ScanOptions 
} from '../types';
import { 
  detectSuspiciousUnicode, 
  calculateSeverityScore,
  visualizeInvisibleCharacters 
} from './unicode';

/**
 * Analyzes a string for potentially malicious content in AI rules files
 * @param content The file content to analyze
 * @param filename Original filename
 * @param options Scan options
 * @returns Scan result with details of suspicious content
 */
export function analyzeContent(
  content: string, 
  filename: string, 
  options: ScanOptions = {}
): ScanResult {
  // Apply default options
  const config = { ...DEFAULT_SCANNER_CONFIG, ...options };
  
  // Initialize result
  const result: ScanResult = {
    filename,
    hasSuspiciousContent: false,
    severityScore: 0,
    suspiciousSections: [],
    suspiciousCharacterCount: 0,
    timestamp: Date.now(),
    summary: '',
    recommendations: []
  };
  
  // Step 1: Detect suspicious Unicode characters
  const suspiciousCharacters = detectSuspiciousUnicode(content);
  result.suspiciousCharacterCount = suspiciousCharacters.length;
  
  // Step 2: Identify suspicious patterns
  const patternMatches = findSuspiciousPatterns(content);
  
  // Step 3: Create suspicious sections by grouping nearby findings
  result.suspiciousSections = createSuspiciousSections(
    content, 
    suspiciousCharacters, 
    patternMatches,
    config.maxSections
  );
  
  // Step 4: Calculate overall severity score
  result.hasSuspiciousContent = result.suspiciousSections.length > 0;
  result.severityScore = result.hasSuspiciousContent 
    ? calculateOverallSeverity(result.suspiciousSections, suspiciousCharacters) 
    : 0;
  
  // Step 5: Generate summary and recommendations
  result.summary = generateSummary(result);
  result.recommendations = generateRecommendations(result);
  
  return result;
}

/**
 * Finds suspicious language patterns in content
 * @param content Text content to analyze
 * @returns Array of matches with position information
 */
function findSuspiciousPatterns(content: string): Array<{
  pattern: RegExp;
  match: string;
  start: number;
  end: number;
}> {
  const results = [];
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    // Use a loop to find all matches of this pattern
    const regex = new RegExp(pattern, 'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      results.push({
        pattern,
        match: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }
  
  return results;
}

/**
 * Groups nearby suspicious elements into sections
 * @param content Original text content
 * @param characters Suspicious Unicode characters
 * @param patternMatches Suspicious pattern matches
 * @param maxSections Maximum number of sections to return
 * @returns Array of suspicious sections
 */
function createSuspiciousSections(
  content: string,
  characters: SuspiciousCharacter[],
  patternMatches: Array<{ pattern: RegExp; match: string; start: number; end: number }>,
  maxSections: number
): SuspiciousSection[] {
  // If no suspicious elements, return empty array
  if (characters.length === 0 && patternMatches.length === 0) {
    return [];
  }
  
  // Create initial sections from character clusters (group characters that are close together)
  const characterSections: SuspiciousSection[] = [];
  let currentChars: SuspiciousCharacter[] = [];
  let currentStart = -1;
  let currentEnd = -1;
  
  // Sort characters by position
  const sortedChars = [...characters].sort((a, b) => a.position - b.position);
  
  // Group characters that are within 20 positions of each other
  for (const char of sortedChars) {
    if (currentStart === -1 || char.position - currentEnd > 20) {
      // Start a new section
      if (currentChars.length > 0) {
        characterSections.push({
          start: currentStart,
          end: currentEnd,
          content: content.substring(currentStart, currentEnd + 1),
          characters: currentChars,
          severity: calculateSeverityScore(currentChars),
          reason: `Contains ${currentChars.length} suspicious Unicode character(s)`
        });
      }
      
      currentChars = [char];
      currentStart = Math.max(0, char.position - 10);
      currentEnd = Math.min(content.length - 1, char.position + 10);
    } else {
      // Add to current section
      currentChars.push(char);
      currentEnd = Math.min(content.length - 1, char.position + 10);
    }
  }
  
  // Add the last section
  if (currentChars.length > 0) {
    characterSections.push({
      start: currentStart,
      end: currentEnd,
      content: content.substring(currentStart, currentEnd + 1),
      characters: currentChars,
      severity: calculateSeverityScore(currentChars),
      reason: `Contains ${currentChars.length} suspicious Unicode character(s)`
    });
  }
  
  // Create sections from pattern matches
  const patternSections: SuspiciousSection[] = patternMatches.map(match => {
    const start = Math.max(0, match.start - 10);
    const end = Math.min(content.length - 1, match.end + 10);
    
    return {
      start,
      end,
      content: content.substring(start, end),
      characters: characters.filter(char => char.position >= start && char.position <= end),
      severity: 3, // Default severity for pattern matches
      reason: `Suspicious pattern: "${match.match}"`
    };
  });
  
  // Merge sections that overlap
  const allSections = [...characterSections, ...patternSections];
  const mergedSections = mergeSections(allSections);
  
  // Sort by severity (descending) and limit to maxSections
  return mergedSections
    .sort((a, b) => b.severity - a.severity)
    .slice(0, maxSections);
}

/**
 * Merges overlapping sections
 * @param sections Array of sections to merge
 * @returns Merged sections array
 */
function mergeSections(sections: SuspiciousSection[]): SuspiciousSection[] {
  if (sections.length <= 1) {
    return sections;
  }
  
  // Sort by start position
  const sorted = [...sections].sort((a, b) => a.start - b.start);
  const result: SuspiciousSection[] = [];
  let current = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // Check for overlap
    if (next.start <= current.end) {
      // Merge sections
      current = {
        start: current.start,
        end: Math.max(current.end, next.end),
        content: '', // Will be updated after merging
        characters: [...current.characters, ...next.characters].filter(
          // Remove duplicates
          (char, index, self) => index === self.findIndex(c => c.position === char.position)
        ),
        severity: Math.max(current.severity, next.severity),
        reason: `${current.reason}; ${next.reason}`
      };
    } else {
      // No overlap, add current to result and move to next
      current.content = current.content || ''; // Ensure content is not undefined
      result.push(current);
      current = next;
    }
  }
  
  // Add the last section
  result.push(current);
  
  // Update content for all sections
  return result;
}

/**
 * Calculates overall severity based on all findings
 * @param sections Suspicious sections
 * @param characters All suspicious characters
 * @returns Severity score from 1-5
 */
function calculateOverallSeverity(
  sections: SuspiciousSection[], 
  characters: SuspiciousCharacter[]
): number {
  if (sections.length === 0) {
    return 0;
  }
  
  // Get max section severity
  const maxSectionSeverity = Math.max(...sections.map(s => s.severity));
  
  // Calculate character severity
  const characterSeverity = calculateSeverityScore(characters);
  
  // Weight by number of sections
  let sectionFactor = 1.0;
  if (sections.length > 3) sectionFactor = 1.2;
  if (sections.length > 10) sectionFactor = 1.5;
  
  // Final score is weighted average, rounded to nearest integer, capped at 5
  const weightedScore = (maxSectionSeverity * 0.7 + characterSeverity * 0.3) * sectionFactor;
  return Math.min(Math.round(weightedScore), 5);
}

/**
 * Generates a human-readable summary of scan results
 * @param result Scan result
 * @returns Summary string
 */
function generateSummary(result: ScanResult): string {
  if (!result.hasSuspiciousContent) {
    return 'No suspicious content detected in this file.';
  }
  
  const severityText = getSeverityText(result.severityScore);
  
  return `Detected ${result.suspiciousCharacterCount} suspicious Unicode characters and ${
    result.suspiciousSections.length
  } suspicious sections. Overall severity: ${result.severityScore}/5 (${severityText}).`;
}

/**
 * Converts a severity score to descriptive text
 * @param score Severity score (1-5)
 * @returns Description of severity
 */
function getSeverityText(score: number): string {
  switch (score) {
    case 1: return 'Low Risk';
    case 2: return 'Moderate Risk';
    case 3: return 'Concerning';
    case 4: return 'High Risk';
    case 5: return 'Critical Risk';
    default: return 'Unknown';
  }
}

/**
 * Generates recommendations based on scan results
 * @param result Scan result
 * @returns Array of recommendation strings
 */
function generateRecommendations(result: ScanResult): string[] {
  if (!result.hasSuspiciousContent) {
    return ['No action needed. File appears safe.'];
  }
  
  const recommendations: string[] = [];
  
  // Add recommendations based on severity
  if (result.severityScore >= 4) {
    recommendations.push('CRITICAL: This file likely contains malicious hidden content. Do not use in production!');
    recommendations.push('Immediately isolate this file and review its source.');
  } else if (result.severityScore >= 3) {
    recommendations.push('WARNING: This file contains highly suspicious elements that may be malicious.');
    recommendations.push('Thoroughly review all flagged sections before using this file.');
  } else {
    recommendations.push('CAUTION: This file contains some suspicious elements that should be reviewed.');
  }
  
  // Add specific recommendations based on content
  if (result.suspiciousCharacterCount > 0) {
    recommendations.push('Remove all invisible Unicode characters and review the sanitized content.');
  }
  
  if (result.suspiciousSections.some(s => s.reason.includes('pattern'))) {
    recommendations.push('Review all flagged language patterns for potential backdoor instructions.');
  }
  
  return recommendations;
}

/**
 * Creates a sanitized version of the file content
 * @param content Original file content
 * @param suspiciousCharacters Array of suspicious characters
 * @returns Sanitized content with suspicious characters removed
 */
export function sanitizeContent(content: string, suspiciousCharacters: SuspiciousCharacter[]): string {
  if (suspiciousCharacters.length === 0) {
    return content;
  }
  
  // Sort positions in descending order to avoid index shifting
  const positions = suspiciousCharacters
    .map(char => char.position)
    .sort((a, b) => b - a);
  
  // Create a mutable array of characters
  const chars = [...content];
  
  // Remove suspicious characters
  for (const position of positions) {
    if (position >= 0 && position < chars.length) {
      chars.splice(position, 1);
    }
  }
  
  return chars.join('');
}
