/**
 * Meta-Log Database - Main Export (Node.js)
 */

export { MetaLogDb, MetaLogDbConfig } from './database.js';
export { PrologEngine } from './prolog/engine.js';
export { DatalogEngine } from './datalog/engine.js';
export { R5RSRegistry } from './r5rs/registry.js';
export { JsonlParser } from './jsonl/parser.js';
export { TripleStore } from './rdf/triple-store.js';
export { ShaclValidator } from './shacl/validator.js';

// Export browser classes (for conditional imports)
export { MetaLogDbBrowser, BrowserConfig } from './browser/database.js';
export { BrowserFileIO } from './browser/io.js';
export { IndexedDBStorage } from './browser/indexeddb-storage.js';

// Export types
export * from './types/index.js';

// Export validation utilities
export * from './validation/frontmatter-validator.js';
