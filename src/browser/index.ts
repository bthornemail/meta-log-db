/**
 * Browser-Native Meta-Log Database - Main Export
 * 
 * Browser entry point for Meta-Log Database package
 */

export { MetaLogDbBrowser } from './database.js';
export type { BrowserConfig } from './database.js';
export { BrowserFileIO } from './io.js';
export { IndexedDBStorage } from './indexeddb-storage.js';
export { BrowserJsonlParser } from './jsonl/browser-parser.js';
export { BrowserR5RSRegistry } from './r5rs/browser-registry.js';

// Export crypto utilities
export * from './crypto/bip32.js';
export * from './crypto/bip39.js';
export * from './crypto/bip44.js';
export * from './crypto/storage-encryption.js';

// Re-export types
export * from '../types/index.js';

// Re-export validation utilities
export * from '../validation/frontmatter-validator.js';

// Export CanvasL Metaverse Browser
export { CanvasLMetaverseBrowser } from './canvasl-browser.js';
export type { CanvasLBrowserConfig, CanvasLQueryOptions, CanvasLExecutionResult } from './canvasl-browser.js';

// Re-export types for convenience
export type { Fact, Canvas } from '../types/index.js';

