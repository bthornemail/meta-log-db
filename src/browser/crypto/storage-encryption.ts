/**
 * Storage Encryption Utilities
 * 
 * Provides encryption/decryption for IndexedDB storage using BIP32/39/44 derived keys
 */

import { deriveStorageKey } from './bip44.js';

/**
 * Encrypt data using AES-GCM
 * 
 * @param data - Data to encrypt (string)
 * @param key - CryptoKey for encryption
 * @returns Encrypted data as base64 string (includes IV)
 */
export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);

  // Generate random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    dataBytes
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM
 * 
 * @param encrypted - Encrypted data as base64 string (includes IV)
 * @param key - CryptoKey for decryption
 * @returns Decrypted data as string
 */
export async function decryptData(encrypted: string, key: CryptoKey): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  // Extract IV (first 12 bytes)
  const iv = combined.slice(0, 12);
  
  // Extract encrypted data (remaining bytes)
  const encryptedData = combined.slice(12);

  // Decrypt data
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encryptedData
  );

  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt data using mnemonic-derived key
 * 
 * @param data - Data to encrypt
 * @param mnemonic - BIP39 mnemonic phrase
 * @param purpose - Storage purpose for key derivation
 * @returns Encrypted data as base64 string
 */
export async function encryptDataWithMnemonic(
  data: string,
  mnemonic: string,
  purpose: 'local' | 'published' | 'contributor' | 'ephemeral' = 'local'
): Promise<string> {
  const key = await deriveStorageKey(mnemonic, purpose);
  return await encryptData(data, key);
}

/**
 * Decrypt data using mnemonic-derived key
 * 
 * @param encrypted - Encrypted data as base64 string
 * @param mnemonic - BIP39 mnemonic phrase
 * @param purpose - Storage purpose for key derivation
 * @returns Decrypted data as string
 */
export async function decryptDataWithMnemonic(
  encrypted: string,
  mnemonic: string,
  purpose: 'local' | 'published' | 'contributor' | 'ephemeral' = 'local'
): Promise<string> {
  const key = await deriveStorageKey(mnemonic, purpose);
  return await decryptData(encrypted, key);
}

/**
 * Encrypt file content for storage
 * 
 * @param content - File content to encrypt
 * @param mnemonic - BIP39 mnemonic phrase
 * @param purpose - Storage purpose
 * @returns Encrypted content
 */
export async function encryptFileContent(
  content: string,
  mnemonic: string,
  purpose: 'local' | 'published' | 'contributor' | 'ephemeral' = 'local'
): Promise<string> {
  return await encryptDataWithMnemonic(content, mnemonic, purpose);
}

/**
 * Decrypt file content from storage
 * 
 * @param encrypted - Encrypted file content
 * @param mnemonic - BIP39 mnemonic phrase
 * @param purpose - Storage purpose
 * @returns Decrypted content
 */
export async function decryptFileContent(
  encrypted: string,
  mnemonic: string,
  purpose: 'local' | 'published' | 'contributor' | 'ephemeral' = 'local'
): Promise<string> {
  return await decryptDataWithMnemonic(encrypted, mnemonic, purpose);
}

