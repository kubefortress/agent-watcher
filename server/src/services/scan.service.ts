import { analyzeContent, ScanResult, ScanOptions } from 'shared';

/**
 * Analyzes a file for malicious content
 * @param content The file content to analyze
 * @param filename Original filename
 * @param options Scan options
 * @returns Scan result with details
 */
export async function analyzeFile(
  content: string, 
  filename: string, 
  options: { deepAnalysis: boolean }
): Promise<ScanResult> {
  try {
    // Use the shared analysis module to scan the content
    const result = analyzeContent(content, filename, {
      deepAnalysis: options.deepAnalysis
    });
    
    return result;
  } catch (error) {
    console.error(`Error analyzing file ${filename}:`, error);
    throw new Error(`Failed to analyze file ${filename}`);
  }
}

/**
 * Generates a sanitized version of the file content
 * @param content Original file content
 * @param result Scan result with suspicious characters
 * @returns Sanitized content
 */
export function getSanitizedContent(content: string, result: ScanResult): string {
  if (!result.hasSuspiciousContent || result.suspiciousCharacterCount === 0) {
    return content;
  }
  
  // Create a list of all character positions that need to be removed
  const positions: number[] = [];
  
  result.suspiciousSections.forEach(section => {
    section.characters.forEach(char => {
      positions.push(char.position);
    });
  });
  
  // Sort positions in descending order to avoid index shifting
  positions.sort((a, b) => b - a);
  
  // Create a mutable array of characters
  const chars = [...content];
  
  // Remove suspicious characters
  positions.forEach(position => {
    if (position >= 0 && position < chars.length) {
      chars.splice(position, 1);
    }
  });
  
  return chars.join('');
}
