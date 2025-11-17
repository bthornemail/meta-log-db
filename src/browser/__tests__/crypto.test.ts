/**
 * Browser Crypto Tests
 * 
 * Tests for BIP32/39/44 cryptographic implementation and storage encryption.
 * 
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/27-Meta-Log-Browser-Db/BIP32-39-44-INTEGRATION.md BIP32/39/44 Integration Guide}
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/27-Meta-Log-Browser-Db/README.md Meta-Log Browser Database Documentation}
 * 
 * Related Documentation:
 * - meta-log-browser-db-bip32-39-44-guide: Complete BIP32/39/44 guide
 * - meta-log-browser-db-readme: Browser database overview
 * - meta-log-browser-db-indexeddb-guide: Storage encryption usage
 * 
 * Test Coverage:
 * - BIP39 mnemonic generation and validation
 * - BIP32 HD key derivation
 * - BIP44 standard derivation paths
 * - Storage encryption/decryption
 * - Key derivation from mnemonics
 */

import { generateMnemonic, validateMnemonic, mnemonicToSeed } from '../crypto/bip39';
import { deriveKey } from '../crypto/bip32';
import { deriveStorageKey, StorageDerivationPaths } from '../crypto/bip44';
import { encryptData, decryptData, encryptDataWithMnemonic, decryptDataWithMnemonic } from '../crypto/storage-encryption';

describe('BIP39', () => {
  describe('generateMnemonic', () => {
    it('should generate mnemonic with 256-bit strength', async () => {
      const mnemonic = await generateMnemonic(256);
      expect(mnemonic).toBeDefined();
      expect(typeof mnemonic).toBe('string');
      expect(mnemonic.split(' ').length).toBeGreaterThan(0);
    });

    it('should generate mnemonic with 128-bit strength', async () => {
      const mnemonic = await generateMnemonic(128);
      expect(mnemonic).toBeDefined();
      expect(typeof mnemonic).toBe('string');
    });
  });

  describe('validateMnemonic', () => {
    it('should validate valid mnemonic', async () => {
      const mnemonic = await generateMnemonic(256);
      const isValid = validateMnemonic(mnemonic);
      expect(isValid).toBe(true);
    });

    it('should reject invalid mnemonic', () => {
      const isValid = validateMnemonic('invalid mnemonic phrase');
      expect(isValid).toBe(false);
    });
  });

  describe('mnemonicToSeed', () => {
    it('should convert mnemonic to seed', async () => {
      const mnemonic = await generateMnemonic(256);
      const seed = await mnemonicToSeed(mnemonic);
      
      expect(seed).toBeInstanceOf(Uint8Array);
      expect(seed.length).toBe(64); // 512 bits = 64 bytes
    });

    it('should convert mnemonic to seed with passphrase', async () => {
      const mnemonic = await generateMnemonic(256);
      const seed1 = await mnemonicToSeed(mnemonic);
      const seed2 = await mnemonicToSeed(mnemonic, 'passphrase');
      
      // Seeds should be different with different passphrases
      expect(seed1).not.toEqual(seed2);
    });
  });
});

describe('BIP32', () => {
  describe('deriveKey', () => {
    it('should derive key from seed', async () => {
      const mnemonic = await generateMnemonic(256);
      const seed = await mnemonicToSeed(mnemonic);
      const key = await deriveKey(seed, "m/44'/60'/0'/0/0");
      
      expect(key).toBeDefined();
      expect(key.algorithm.name).toBe('AES-GCM');
    });
  });
});

describe('BIP44', () => {
  describe('deriveStorageKey', () => {
    it('should derive storage key for local purpose', async () => {
      const mnemonic = await generateMnemonic(256);
      const key = await deriveStorageKey(mnemonic, 'local');
      
      expect(key).toBeDefined();
      expect(key.algorithm.name).toBe('AES-GCM');
    });

    it('should derive different keys for different purposes', async () => {
      const mnemonic = await generateMnemonic(256);
      const key1 = await deriveStorageKey(mnemonic, 'local');
      const key2 = await deriveStorageKey(mnemonic, 'published');
      
      // Keys should be different
      const key1Raw = await crypto.subtle.exportKey('raw', key1);
      const key2Raw = await crypto.subtle.exportKey('raw', key2);
      
      expect(key1Raw).not.toEqual(key2Raw);
    });
  });

  describe('StorageDerivationPaths', () => {
    it('should provide standard paths', () => {
      expect(StorageDerivationPaths.LOCAL_PRIVATE).toBeDefined();
      expect(StorageDerivationPaths.PUBLISHED_ROOT).toBeDefined();
      expect(StorageDerivationPaths.CONTRIBUTOR_SIGNING).toBeDefined();
      expect(StorageDerivationPaths.EPHEMERAL_SHARING).toBeDefined();
    });

    it('should generate helper paths', () => {
      const manifestPath = StorageDerivationPaths.publishedManifest(0, 1);
      expect(manifestPath).toContain("m/44'/999'/1'");

      const contributorPath = StorageDerivationPaths.contributorKey(0);
      expect(contributorPath).toContain("m/44'/999'/2'");
    });
  });
});

describe('Storage Encryption', () => {
  describe('encryptData / decryptData', () => {
    it('should encrypt and decrypt data', async () => {
      const mnemonic = await generateMnemonic(256);
      const key = await deriveStorageKey(mnemonic, 'local');
      
      const data = 'sensitive data';
      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);
      
      expect(decrypted).toBe(data);
    });

    it('should produce different encrypted data for same input', async () => {
      const mnemonic = await generateMnemonic(256);
      const key = await deriveStorageKey(mnemonic, 'local');
      
      const data = 'sensitive data';
      const encrypted1 = await encryptData(data, key);
      const encrypted2 = await encryptData(data, key);
      
      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to same data
      const decrypted1 = await decryptData(encrypted1, key);
      const decrypted2 = await decryptData(encrypted2, key);
      expect(decrypted1).toBe(data);
      expect(decrypted2).toBe(data);
    });
  });

  describe('encryptDataWithMnemonic / decryptDataWithMnemonic', () => {
    it('should encrypt and decrypt with mnemonic', async () => {
      const mnemonic = await generateMnemonic(256);
      const data = 'sensitive data';
      
      const encrypted = await encryptDataWithMnemonic(data, mnemonic, 'local');
      const decrypted = await decryptDataWithMnemonic(encrypted, mnemonic, 'local');
      
      expect(decrypted).toBe(data);
    });
  });
});

