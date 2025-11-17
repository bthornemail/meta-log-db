/**
 * BIP44 Wallet Derivation Paths
 * 
 * Implements BIP44 standard derivation paths for deterministic wallet generation
 * Based on BIP44 specification: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 */

/**
 * BIP44 derivation path format: m / purpose' / coin_type' / account' / change / address_index
 * 
 * @param purpose - Purpose (44 for BIP44)
 * @param coin - Coin type (0 for Bitcoin, 60 for Ethereum)
 * @param account - Account index
 * @param change - Change chain (0 for external, 1 for internal)
 * @param address - Address index
 * @returns Derivation path string
 */
export function getDerivationPath(
  purpose: number = 44,
  coin: number = 0,
  account: number = 0,
  change: number = 0,
  address: number = 0
): string {
  return `m/${purpose}'/${coin}'/${account}'/${change}/${address}`;
}

/**
 * Standard BIP44 derivation paths for common cryptocurrencies
 */
export const StandardPaths = {
  // Bitcoin
  bitcoin: (account: number = 0, change: number = 0, address: number = 0) =>
    getDerivationPath(44, 0, account, change, address),
  
  // Ethereum
  ethereum: (account: number = 0, change: number = 0, address: number = 0) =>
    getDerivationPath(44, 60, account, change, address),
  
  // Litecoin
  litecoin: (account: number = 0, change: number = 0, address: number = 0) =>
    getDerivationPath(44, 2, account, change, address),
  
  // Custom coin type
  custom: (coinType: number, account: number = 0, change: number = 0, address: number = 0) =>
    getDerivationPath(44, coinType, account, change, address),
};

/**
 * Storage key derivation paths for Meta-Log Database
 * 
 * These are custom derivation paths for different storage purposes:
 * - Local/private workspace keys
 * - Published content root keys
 * - Contributor signing keys
 * - Ephemeral sharing keys
 */
export const StorageDerivationPaths = {
  /**
   * Local/private workspace keys
   * Path: m/44'/999'/0'/0/0
   */
  LOCAL_PRIVATE: "m/44'/999'/0'/0/0",
  
  /**
   * Published content root keys
   * Path: m/44'/999'/1'/0/0
   */
  PUBLISHED_ROOT: "m/44'/999'/1'/0/0",
  
  /**
   * Contributor signing keys
   * Path: m/44'/999'/2'/0/0
   */
  CONTRIBUTOR_SIGNING: "m/44'/999'/2'/0/0",
  
  /**
   * Ephemeral sharing keys
   * Path: m/44'/999'/3'/0/0
   */
  EPHEMERAL_SHARING: "m/44'/999'/3'/0/0",
  
  /**
   * Helper: Published manifest key
   * Path: m/44'/999'/1'/{topicIndex}'/{nodeIndex}'
   */
  publishedManifest: (topicIndex: number, nodeIndex: number) =>
    `m/44'/999'/1'/${topicIndex}'/${nodeIndex}'`,
  
  /**
   * Helper: Contributor key
   * Path: m/44'/999'/2'/{contributorIndex}'
   */
  contributorKey: (contributorIndex: number) =>
    `m/44'/999'/2'/${contributorIndex}'`,
  
  /**
   * Helper: Sharing key
   * Path: m/44'/999'/3'/{shareIndex}'/{sessionIndex}'
   */
  sharingKey: (shareIndex: number, sessionIndex: number) =>
    `m/44'/999'/3'/${shareIndex}'/${sessionIndex}'`,
};

/**
 * Derive storage key from mnemonic and purpose
 * 
 * @param mnemonic - BIP39 mnemonic phrase
 * @param purpose - Storage purpose ('local' | 'published' | 'contributor' | 'ephemeral')
 * @returns CryptoKey for encryption/decryption
 */
export async function deriveStorageKey(
  mnemonic: string,
  purpose: 'local' | 'published' | 'contributor' | 'ephemeral'
): Promise<CryptoKey> {
  const { mnemonicToSeed } = await import('./bip39.js');
  const { deriveKey } = await import('./bip32.js');
  
  // Convert mnemonic to seed
  const seed = await mnemonicToSeed(mnemonic);
  
  // Get derivation path based on purpose
  let path: string;
  switch (purpose) {
    case 'local':
      path = StorageDerivationPaths.LOCAL_PRIVATE;
      break;
    case 'published':
      path = StorageDerivationPaths.PUBLISHED_ROOT;
      break;
    case 'contributor':
      path = StorageDerivationPaths.CONTRIBUTOR_SIGNING;
      break;
    case 'ephemeral':
      path = StorageDerivationPaths.EPHEMERAL_SHARING;
      break;
    default:
      throw new Error(`Unknown purpose: ${purpose}`);
  }
  
  // Derive key from seed and path
  return await deriveKey(seed, path);
}

/**
 * Derive storage key with custom path
 * 
 * @param mnemonic - BIP39 mnemonic phrase
 * @param path - Custom derivation path
 * @returns CryptoKey for encryption/decryption
 */
export async function deriveStorageKeyFromPath(
  mnemonic: string,
  path: string
): Promise<CryptoKey> {
  const { mnemonicToSeed } = await import('./bip39.js');
  const { deriveKey } = await import('./bip32.js');
  
  const seed = await mnemonicToSeed(mnemonic);
  return await deriveKey(seed, path);
}

