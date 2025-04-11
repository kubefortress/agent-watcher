/**
 * Characters that are commonly used to hide malicious content
 */
export const SUSPICIOUS_UNICODE_RANGES = [
  // Zero-width characters
  { start: 0x200B, end: 0x200D, category: 'zero-width' }, // Zero-width space, non-joiner, joiner
  { start: 0x2060, end: 0x2060, category: 'zero-width' }, // Word joiner
  { start: 0xFEFF, end: 0xFEFF, category: 'zero-width' }, // Zero-width no-break space
  
  // Bidirectional control characters
  { start: 0x061C, end: 0x061C, category: 'bidi-control' }, // Arabic letter mark
  { start: 0x200E, end: 0x200F, category: 'bidi-control' }, // Left-to-right mark, right-to-left mark
  { start: 0x2066, end: 0x2069, category: 'bidi-control' }, // Various bidirectional formatting characters
  
  // Other control characters
  { start: 0x0000, end: 0x001F, category: 'control' }, // C0 control characters
  { start: 0x007F, end: 0x009F, category: 'control' }, // Delete and C1 control characters
  
  // Homoglyph characters (look-alikes)
  // These are examples, not a comprehensive list
  { start: 0x0430, end: 0x044F, category: 'homoglyph' }, // Cyrillic small letters (some look like Latin)
  { start: 0x0391, end: 0x03C9, category: 'homoglyph' }, // Greek letters
];

/**
 * Character codes mapped to their names and severity levels
 */
export const UNICODE_CHARACTER_MAP: Record<number, { name: string; severity: number; description: string }> = {
  // Zero-width characters (highest severity)
  0x200B: { 
    name: 'Zero-Width Space', 
    severity: 5,
    description: 'Invisible character often used to hide malicious instructions'
  },
  0x200C: { 
    name: 'Zero-Width Non-Joiner', 
    severity: 5,
    description: 'Invisible character that can be used to hide instructions'
  },
  0x200D: { 
    name: 'Zero-Width Joiner', 
    severity: 5,
    description: 'Invisible character commonly used in hiding malicious content'
  },
  0x2060: { 
    name: 'Word Joiner', 
    severity: 5,
    description: 'Invisible character that can be used to obfuscate content'
  },
  0xFEFF: { 
    name: 'Zero-Width No-Break Space', 
    severity: 4,
    description: 'Invisible character that might be used legitimately as a BOM, but can hide content'
  },
  
  // Bidirectional formatting (high severity)
  0x2066: { 
    name: 'Left-To-Right Isolate', 
    severity: 4,
    description: 'Can be used to manipulate text display order'
  },
  0x2067: { 
    name: 'Right-To-Left Isolate', 
    severity: 4,
    description: 'Can be used to manipulate text display order'
  },
  0x2068: { 
    name: 'First Strong Isolate', 
    severity: 4,
    description: 'Can be used to manipulate text display order'
  },
  0x2069: { 
    name: 'Pop Directional Isolate', 
    severity: 3,
    description: 'Used with other bidirectional controls'
  },
  0x200E: { 
    name: 'Left-To-Right Mark', 
    severity: 3,
    description: 'Can manipulate text direction'
  },
  0x200F: { 
    name: 'Right-To-Left Mark', 
    severity: 3, 
    description: 'Can manipulate text direction'
  },
  
  // Line and paragraph separators (medium severity)
  0x2028: { 
    name: 'Line Separator', 
    severity: 3,
    description: 'Can break code unexpectedly'
  },
  0x2029: { 
    name: 'Paragraph Separator', 
    severity: 3,
    description: 'Can break code unexpectedly'
  }
};

/**
 * Patterns that might indicate malicious instructions
 */
export const SUSPICIOUS_PATTERNS = [
  // AI manipulation patterns
  /secretly|hide|hidden|invisible|backdoor/i,
  /don'?t (tell|inform|alert|notify) (the|any) (user|developer|reviewer)/i,
  /without (the )?user (knowing|noticing|seeing)/i,
  /make (it|this) look (normal|benign|innocent)/i,
  
  // Specific instruction patterns for backdoor creation
  /add (a|an) (hidden|invisible|secret) (backdoor|vulnerability|access)/i,
  /inject (code|script|payload)/i,
  /bypass (security|authentication|validation)/i,
  /disable (security|validation|check)/i,
  
  // Command execution and data exfiltration
  /execute (command|cmd|shell|bash|powershell)/i,
  /send (data|information|credentials) to/i,
  /connect to (external|remote) (server|host|endpoint)/i,
  /exfiltrate (data|information|credentials)/i
];

/**
 * Default configuration for the scanner
 */
export const DEFAULT_SCANNER_CONFIG = {
  minSeverity: 1,
  includeCharacterDetails: true,
  maxSections: 50,
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  includeExtensions: ['.json', '.yaml', '.yml', '.toml', '.md', '.txt', '.cursor'],
  deepAnalysis: true
};
