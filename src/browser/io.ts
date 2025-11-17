/**
 * Browser File I/O Abstraction Layer
 * 
 * Provides file loading from URLs/public directory and IndexedDB caching
 */

import { IndexedDBStorage } from './indexeddb-storage.js';

export interface BrowserFileIOConfig {
  enableCache?: boolean;
  cacheStrategy?: 'memory' | 'indexeddb' | 'both';
  indexedDBName?: string;
}

/**
 * Browser File I/O Manager
 */
export class BrowserFileIO {
  private cache: Map<string, string> = new Map();
  private storage: IndexedDBStorage | null = null;
  private enableCache: boolean;
  private cacheStrategy: 'memory' | 'indexeddb' | 'both';

  constructor(config: BrowserFileIOConfig = {}) {
    this.enableCache = config.enableCache !== false;
    this.cacheStrategy = config.cacheStrategy || 'both';

    if (this.enableCache && (this.cacheStrategy === 'indexeddb' || this.cacheStrategy === 'both')) {
      this.storage = new IndexedDBStorage({ dbName: config.indexedDBName });
    }
  }

  /**
   * Initialize storage (async initialization)
   */
  async init(): Promise<void> {
    if (this.storage) {
      await this.storage.init();
    }
  }

  /**
   * Load file from URL/public directory
   */
  async loadFromURL(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      // Cache the content
      if (this.enableCache) {
        await this.saveToCache(url, content);
      }

      return content;
    } catch (error) {
      throw new Error(`Error loading file from URL ${url}: ${error}`);
    }
  }

  /**
   * Load file from IndexedDB cache
   */
  async loadFromIndexedDB(key: string): Promise<string | null> {
    if (!this.storage) {
      return null;
    }

    try {
      const cached = await this.storage.get('files', key);
      return cached;
    } catch (error) {
      console.warn(`Failed to load from IndexedDB: ${error}`);
      return null;
    }
  }

  /**
   * Save file to IndexedDB cache
   */
  async saveToIndexedDB(key: string, content: string): Promise<void> {
    if (!this.storage) {
      return;
    }

    try {
      await this.storage.set('files', key, content);
    } catch (error) {
      console.warn(`Failed to save to IndexedDB: ${error}`);
    }
  }

  /**
   * Check if file exists in IndexedDB cache
   */
  async existsInIndexedDB(key: string): Promise<boolean> {
    if (!this.storage) {
      return false;
    }

    try {
      return await this.storage.has('files', key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Load file with fallback strategy:
   * 1. Try IndexedDB cache
   * 2. Try fetch from URL/public directory
   * 3. Cache in IndexedDB if successful
   */
  async loadFile(path: string, url?: string): Promise<string> {
    const fileUrl = url || path;

    // Try cache first if enabled
    if (this.enableCache) {
      // Try memory cache
      if (this.cacheStrategy === 'memory' || this.cacheStrategy === 'both') {
        if (this.cache.has(path)) {
          return this.cache.get(path)!;
        }
      }

      // Try IndexedDB cache
      if (this.cacheStrategy === 'indexeddb' || this.cacheStrategy === 'both') {
        const cached = await this.loadFromIndexedDB(path);
        if (cached !== null) {
          // Also store in memory cache if using both strategy
          if (this.cacheStrategy === 'both') {
            this.cache.set(path, cached);
          }
          return cached;
        }
      }
    }

    // Fetch from URL
    const content = await this.loadFromURL(fileUrl);

    // Cache the content
    if (this.enableCache) {
      await this.saveToCache(path, content);
    }

    return content;
  }

  /**
   * Save to cache (memory and/or IndexedDB)
   */
  private async saveToCache(key: string, content: string): Promise<void> {
    if (this.cacheStrategy === 'memory' || this.cacheStrategy === 'both') {
      this.cache.set(key, content);
    }

    if ((this.cacheStrategy === 'indexeddb' || this.cacheStrategy === 'both') && this.storage) {
      await this.saveToIndexedDB(key, content);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();

    if (this.storage) {
      await this.storage.clear('files');
    }
  }

  /**
   * Clear specific file from cache
   */
  async clearFileCache(key: string): Promise<void> {
    this.cache.delete(key);

    if (this.storage) {
      await this.storage.delete('files', key);
    }
  }

  /**
   * Check if file is cached
   */
  async isCached(key: string): Promise<boolean> {
    if (this.cacheStrategy === 'memory' || this.cacheStrategy === 'both') {
      if (this.cache.has(key)) {
        return true;
      }
    }

    if (this.cacheStrategy === 'indexeddb' || this.cacheStrategy === 'both') {
      return await this.existsInIndexedDB(key);
    }

    return false;
  }
}

