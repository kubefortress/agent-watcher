import GraphemeSplitter from 'grapheme-splitter';
import { SUSPICIOUS_UNICODE_RANGES, UNICODE_CHARACTER_MAP } from '../constants';
import { SuspiciousCharacter } from '../types';

/**
 * Detects suspicious Unicode characters in a string
 * @param text The text to analyze
 * @returns Array of suspicious characters found
 */
export function detectSuspiciousUnicode(text: string): SuspiciousCharacter[] {
  const result: SuspiciousCharacter[] = [];
  const splitter = new GraphemeSplitter();
  const graphemes = splitter.splitGraphemes(text);
  
  let position = 0;
  
  for (const grapheme of graphemes) {
    // Analyze each code point in the grapheme
    for (let i = 0; i < grapheme.length; i++) {
      const char = grapheme.charAt(i);
      const codePoint = grapheme.codePointAt(i) || 0;
      
      // Skip normal ASCII printable characters (for efficiency)
      if (codePoint >= 32 && codePoint <= 126) {
        continue;
      }
      
      // Check if this code point is in our suspicious ranges
      const matchingRange = SUSPICIOUS_UNICODE_RANGES.find(
        range => codePoint >= range.start && codePoint <= range.end
      );
      
      if (matchingRange) {
        // Get character details from our map or create a default
        const details = UNICODE_CHARACTER_MAP[codePoint] || {
          name: `Unknown Character (U+${codePoint.toString(16).toUpperCase().padStart(4, '0')})`,
          severity: matchingRange.category === 'zero-width' ? 5 : 3,
          description: `Suspicious character in the ${matchingRange.category} category`
        };
        
        result.push({
          codePoint,
          name: details.name,
          position: position + i,
          severity: details.severity,
          category: matchingRange.category,
          description: details.description
        });
      }
    }
    
    position += grapheme.length;
  }
  
  return result;
}

/**
 * Creates a visual representation of a string with invisible characters made visible
 * @param text Text to visualize
 * @returns HTML-safe string with invisible characters highlighted
 */
export function visualizeInvisibleCharacters(text: string): string {
  let result = '';
  const splitter = new GraphemeSplitter();
  const graphemes = splitter.splitGraphemes(text);
  
  for (const grapheme of graphemes) {
    for (let i = 0; i < grapheme.length; i++) {
      const codePoint = grapheme.codePointAt(i) || 0;
      
      // Replace invisible characters with visible representations
      if (
        (codePoint >= 0x200B && codePoint <= 0x200D) || // Zero-width chars
        codePoint === 0x2060 || // Word joiner
        codePoint === 0xFEFF    // Zero-width no-break space
      ) {
        const hexCode = codePoint.toString(16).toUpperCase().padStart(4, '0');
        result += `[U+${hexCode}]`;
      } else if (codePoint < 32 || (codePoint >= 0x7F && codePoint <= 0x9F)) {
        // Control characters
        const hexCode = codePoint.toString(16).toUpperCase().padStart(2, '0');
        result += `[CTRL-${hexCode}]`;
      } else {
        // Normal visible character
        result += grapheme.charAt(i);
      }
    }
  }
  
  return result;
}

/**
 * Calculates the overall severity score for a collection of suspicious characters
 * @param characters Array of suspicious characters
 * @returns Severity score from 1-5
 */
export function calculateSeverityScore(characters: SuspiciousCharacter[]): number {
  if (characters.length === 0) {
    return 0;
  }
  
  // Weight by both severity and count
  const totalSeverity = characters.reduce((sum, char) => sum + char.severity, 0);
  const averageSeverity = totalSeverity / characters.length;
  
  // Adjust based on quantity
  let quantityFactor = 1.0;
  if (characters.length > 10) quantityFactor = 1.5;
  if (characters.length > 50) quantityFactor = 2.0;
  
  // Calculate final score, capped at 5
  const score = Math.min(Math.round(averageSeverity * quantityFactor), 5);
  
  return score;
}

/**
 * Creates a sanitized version of text with suspicious characters removed
 * @param text Original text
 * @param characters Suspicious characters to remove
 * @returns Sanitized text
 */
export function sanitizeText(text: string, characters: SuspiciousCharacter[]): string {
  if (characters.length === 0) {
    return text;
  }
  
  // Sort positions in descending order to avoid index shifting
  const positions = characters
    .map(char => char.position)
    .sort((a, b) => b - a);
  
  // Create a mutable array of characters
  const chars = [...text];
  
  // Remove suspicious characters
  for (const position of positions) {
    chars.splice(position, 1);
  }
  
  return chars.join('');
}
