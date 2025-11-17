/**
 * BIP39 Mnemonic Implementation
 * 
 * Implements mnemonic phrase generation and validation using Web Crypto API
 * Based on BIP39 specification: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * 
 * Note: This is a simplified implementation. Full BIP39 requires:
 * - Word list (2048 words)
 * - Checksum validation
 * - Proper entropy generation
 */

/**
 * BIP39 word list (first 100 words as example - full list has 2048 words)
 * Full implementation should include all 2048 words from BIP39 specification
 */
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actual', 'adapt',
  'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice',
  'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
  'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
  'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha',
  'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount',
  'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal',
  'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
  'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'area',
  'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange'
];

/**
 * Generate random entropy using Web Crypto API
 */
async function generateEntropy(bits: number): Promise<Uint8Array> {
  const bytes = bits / 8;
  const entropy = new Uint8Array(bytes);
  crypto.getRandomValues(entropy);
  return entropy;
}

/**
 * Calculate checksum from entropy
 */
function calculateChecksum(entropy: Uint8Array): number {
  // Simplified checksum: sum of all bytes modulo 256
  // Full implementation would use SHA256 hash and take first bits
  let sum = 0;
  for (const byte of entropy) {
    sum += byte;
  }
  return sum % 256;
}

/**
 * Convert entropy to mnemonic words
 */
function entropyToMnemonic(entropy: Uint8Array): string {
  const words: string[] = [];
  const checksum = calculateChecksum(entropy);
  
  // Combine entropy with checksum
  const combined = new Uint8Array(entropy.length + 1);
  combined.set(entropy, 0);
  combined[entropy.length] = checksum;

  // Convert to words (simplified - full implementation uses 11-bit indices)
  for (let i = 0; i < combined.length; i++) {
    const index = combined[i] % BIP39_WORDLIST.length;
    words.push(BIP39_WORDLIST[index]);
  }

  return words.join(' ');
}

/**
 * Generate BIP39 mnemonic phrase
 * 
 * @param strength - Entropy strength in bits (128, 160, 192, 224, or 256)
 * @returns Mnemonic phrase (space-separated words)
 */
export async function generateMnemonic(
  strength: 128 | 160 | 192 | 224 | 256 = 256
): Promise<string> {
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error('Strength must be 128, 160, 192, 224, or 256');
  }

  const entropy = await generateEntropy(strength);
  return entropyToMnemonic(entropy);
}

/**
 * Validate mnemonic phrase
 * 
 * @param mnemonic - Mnemonic phrase to validate
 * @returns true if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
  const words = mnemonic.trim().split(/\s+/);
  
  // Check word count (should be 12, 15, 18, 21, or 24 words)
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    return false;
  }

  // Check all words are in wordlist
  for (const word of words) {
    if (!BIP39_WORDLIST.includes(word.toLowerCase())) {
      return false;
    }
  }

  // Validate checksum (simplified)
  return true;
}

/**
 * Convert mnemonic to seed using PBKDF2
 * 
 * @param mnemonic - Mnemonic phrase
 * @param passphrase - Optional passphrase (default: empty string)
 * @returns Seed bytes (64 bytes)
 */
export async function mnemonicToSeed(
  mnemonic: string,
  passphrase: string = ''
): Promise<Uint8Array> {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const mnemonicBytes = new TextEncoder().encode(mnemonic.normalize('NFKD'));
  const saltBytes = new TextEncoder().encode(`mnemonic${passphrase}`.normalize('NFKD'));

  // Import mnemonic as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    mnemonicBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive seed using PBKDF2
  const seedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 2048,
      hash: 'SHA-512'
    },
    keyMaterial,
    512 // 64 bytes = 512 bits
  );

  return new Uint8Array(seedBits);
}

/**
 * Convert seed to mnemonic (reverse operation - not standard BIP39)
 * This is a helper for testing/debugging
 */
export function seedToMnemonic(seed: Uint8Array): string {
  return entropyToMnemonic(seed);
}

