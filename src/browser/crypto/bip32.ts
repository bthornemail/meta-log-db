/**
 * BIP32 HD Key Derivation Implementation
 * 
 * Implements Hierarchical Deterministic (HD) wallet key derivation using Web Crypto API
 * Based on BIP32 specification: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 */

/**
 * Parse derivation path (e.g., "m/44'/60'/0'/0/0")
 */
function parsePath(path: string): number[] {
  const parts = path.split('/');
  if (parts[0] !== 'm') {
    throw new Error('Path must start with "m"');
  }

  return parts.slice(1).map(part => {
    const hardened = part.endsWith("'") || part.endsWith('h');
    const index = parseInt(part.replace(/['h]/g, ''), 10);
    
    if (isNaN(index)) {
      throw new Error(`Invalid path segment: ${part}`);
    }

    // Hardened keys use index >= 2^31
    return hardened ? index + 0x80000000 : index;
  });
}

/**
 * HMAC-SHA512 using Web Crypto API
 */
async function hmacSha512(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  // Ensure we have proper ArrayBuffer views
  const keyBuffer = key.buffer instanceof ArrayBuffer ? key : new Uint8Array(key).buffer;
  const dataBuffer = data.buffer instanceof ArrayBuffer ? data : new Uint8Array(data).buffer;
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer as ArrayBuffer);
  return new Uint8Array(signature);
}

/**
 * Derive child key from parent key using BIP32
 */
async function deriveChildKey(
  parentKey: Uint8Array,
  parentChainCode: Uint8Array,
  index: number
): Promise<{ key: Uint8Array; chainCode: Uint8Array }> {
  const isHardened = index >= 0x80000000;
  const indexBuffer = new ArrayBuffer(4);
  const indexView = new DataView(indexBuffer);
  indexView.setUint32(0, index, false);

  const data = new Uint8Array(37);
  
  if (isHardened) {
    // Hardened: 0x00 || parentKey || index
    data[0] = 0x00;
    data.set(parentKey, 1);
    data.set(new Uint8Array(indexBuffer), 33);
  } else {
    // Non-hardened: parentPublicKey || index
    // For non-hardened, we need the public key
    // This is a simplified version - full implementation would derive public key
    throw new Error('Non-hardened derivation requires public key derivation (not implemented)');
  }

  const hmac = await hmacSha512(parentChainCode, data);
  
  const childKey = hmac.slice(0, 32);
  const chainCode = hmac.slice(32, 64);

  // Add parent key to child key (modulo curve order)
  // Simplified: XOR for demonstration (full implementation would use secp256k1 arithmetic)
  const derivedKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    derivedKey[i] = (parentKey[i] + childKey[i]) % 256;
  }

  return { key: derivedKey, chainCode };
}

/**
 * Derive key from seed using BIP32 derivation path
 */
export async function deriveKey(seed: Uint8Array, path: string): Promise<CryptoKey> {
  // Master key derivation: HMAC-SHA512(Key = "Bitcoin seed", Data = seed)
  const keyMaterial = new TextEncoder().encode('Bitcoin seed');
  const masterHmac = await hmacSha512(keyMaterial, seed);
  
  const masterKey = masterHmac.slice(0, 32);
  const masterChainCode = masterHmac.slice(32, 64);

  // Parse derivation path
  const indices = parsePath(path);

  // Derive through each level
  let currentKey: Uint8Array = masterKey;
  let currentChainCode: Uint8Array = masterChainCode;

  for (const index of indices) {
    const result = await deriveChildKey(currentKey, currentChainCode, index);
    currentKey = new Uint8Array(result.key);
    currentChainCode = new Uint8Array(result.chainCode);
  }

  // Import as AES-GCM key for encryption
  // Ensure we have a proper ArrayBuffer
  const keyBuffer = currentKey.buffer instanceof ArrayBuffer 
    ? currentKey.buffer 
    : new Uint8Array(currentKey).buffer;
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive public key from private key (simplified)
 * 
 * Note: Full implementation would use secp256k1 elliptic curve operations
 * This is a placeholder that derives a key suitable for encryption
 */
export async function derivePublicKey(privateKey: CryptoKey): Promise<CryptoKey> {
  // Export private key material
  const keyData = await crypto.subtle.exportKey('raw', privateKey);
  const keyBytes = new Uint8Array(keyData);

  // Simplified public key derivation (XOR with constant)
  // Full implementation would use secp256k1 point multiplication
  const publicKeyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    publicKeyBytes[i] = keyBytes[i] ^ 0xFF;
  }

  return await crypto.subtle.importKey(
    'raw',
    publicKeyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
}

/**
 * Derive key from extended key format
 * 
 * Extended key format: base58 encoded (version || depth || fingerprint || index || chaincode || key)
 * This is a simplified version - full implementation would decode base58
 */
export async function deriveFromExtendedKey(extendedKey: string, path: string): Promise<CryptoKey> {
  // For now, decode as hex (full implementation would use base58)
  // Browser-compatible hex decoding
  const hexMatch = extendedKey.match(/.{1,2}/g);
  if (!hexMatch) {
    throw new Error('Invalid hex string');
  }
  const keyBytes = new Uint8Array(hexMatch.map(byte => parseInt(byte, 16)));
  
  if (keyBytes.length < 78) {
    throw new Error('Invalid extended key length');
  }

  const chainCode = keyBytes.slice(13, 45);
  const key = keyBytes.slice(45, 77);

  // Parse derivation path (remove 'm' prefix if present)
  const indices = parsePath(path.startsWith('m/') ? path : `m/${path}`);

  // Derive through each level
  let currentKey: Uint8Array = new Uint8Array(key);
  let currentChainCode: Uint8Array = new Uint8Array(chainCode);

  for (const index of indices) {
    const result = await deriveChildKey(currentKey, currentChainCode, index);
    currentKey = new Uint8Array(result.key);
    currentChainCode = new Uint8Array(result.chainCode);
  }

  // Ensure we have a proper ArrayBuffer
  const keyBuffer = currentKey.buffer instanceof ArrayBuffer 
    ? currentKey.buffer 
    : new Uint8Array(currentKey).buffer;
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

