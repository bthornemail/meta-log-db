/**
 * IndexedDB Storage Layer for Meta-Log Database
 * 
 * Provides persistent storage for files, triples, and facts in the browser
 */

export interface IndexedDBStorageConfig {
  dbName?: string;
  version?: number;
}

/**
 * IndexedDB Storage Manager
 */
export class IndexedDBStorage {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(config: IndexedDBStorageConfig = {}) {
    this.dbName = config.dbName || 'meta-log-db';
    this.version = config.version || 1;
  }

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('triples')) {
          db.createObjectStore('triples', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('facts')) {
          db.createObjectStore('facts', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Get value from object store
   */
  async get(storeName: string, key: string): Promise<any | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => {
        reject(new Error(`Failed to get from ${storeName}: ${request.error}`));
      };

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  /**
   * Set value in object store
   */
  async set(storeName: string, key: string, value: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, value });

      request.onerror = () => {
        reject(new Error(`Failed to set in ${storeName}: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Delete value from object store
   */
  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => {
        reject(new Error(`Failed to delete from ${storeName}: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Clear all values from object store
   */
  async clear(storeName: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Get all keys from object store
   */
  async keys(storeName: string): Promise<string[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();

      request.onerror = () => {
        reject(new Error(`Failed to get keys from ${storeName}: ${request.error}`));
      };

      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve(keys);
      };
    });
  }

  /**
   * Check if key exists in object store
   */
  async has(storeName: string, key: string): Promise<boolean> {
    const value = await this.get(storeName, key);
    return value !== null;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

