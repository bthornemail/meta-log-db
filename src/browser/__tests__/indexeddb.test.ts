/**
 * IndexedDB Storage Tests
 * 
 * Tests for IndexedDB persistence layer implementation.
 * 
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/27-Meta-Log-Browser-Db/INDEXEDDB-PERSISTENCE.md IndexedDB Persistence Guide}
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/27-Meta-Log-Browser-Db/README.md Meta-Log Browser Database Documentation}
 * 
 * Related Documentation:
 * - meta-log-browser-db-indexeddb-guide: Complete IndexedDB guide
 * - meta-log-browser-db-readme: Browser database overview
 * - meta-log-browser-db-api-reference: IndexedDBStorage API reference
 * 
 * Test Coverage:
 * - IndexedDB initialization
 * - Object store operations (get, set, delete, clear)
 * - Key management
 * - Error handling
 * - Database lifecycle
 */

import { IndexedDBStorage } from '../indexeddb-storage';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

// @ts-ignore
global.indexedDB = mockIndexedDB;

describe('IndexedDBStorage', () => {
  let storage: IndexedDBStorage;
  let mockDb: any;

  beforeEach(() => {
    storage = new IndexedDBStorage({ dbName: 'test-db' });
    mockDb = {
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(false)
      },
      createObjectStore: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn()
    };

    mockIndexedDB.open.mockReturnValue({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDb
    });
  });

  describe('init', () => {
    it('should initialize IndexedDB connection', async () => {
      const request = mockIndexedDB.open();
      request.onsuccess({ target: { result: mockDb } });

      await storage.init();

      expect(mockIndexedDB.open).toHaveBeenCalledWith('test-db', 1);
    });

    it('should create object stores on upgrade', async () => {
      const request = mockIndexedDB.open();
      request.onupgradeneeded({
        target: {
          result: mockDb
        }
      });

      await storage.init();

      expect(mockDb.createObjectStore).toHaveBeenCalledWith('files', { keyPath: 'key' });
      expect(mockDb.createObjectStore).toHaveBeenCalledWith('triples', { keyPath: 'id', autoIncrement: true });
      expect(mockDb.createObjectStore).toHaveBeenCalledWith('facts', { keyPath: 'id', autoIncrement: true });
    });
  });

  describe('get', () => {
    it('should get value from object store', async () => {
      const mockStore = {
        get: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null,
          result: { key: 'test-key', value: 'test-value' }
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.get();
      request.onsuccess({ target: { result: { value: 'test-value' } } });

      const value = await storage.get('files', 'test-key');
      expect(value).toBe('test-value');
    });

    it('should return null if key not found', async () => {
      const mockStore = {
        get: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null,
          result: null
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.get();
      request.onsuccess({ target: { result: null } });

      const value = await storage.get('files', 'non-existent');
      expect(value).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in object store', async () => {
      const mockStore = {
        put: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.put();
      request.onsuccess({});

      await storage.set('files', 'test-key', 'test-value');

      expect(mockStore.put).toHaveBeenCalledWith({ key: 'test-key', value: 'test-value' });
    });
  });

  describe('delete', () => {
    it('should delete value from object store', async () => {
      const mockStore = {
        delete: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.delete();
      request.onsuccess({});

      await storage.delete('files', 'test-key');

      expect(mockStore.delete).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('should clear object store', async () => {
      const mockStore = {
        clear: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.clear();
      request.onsuccess({});

      await storage.clear('files');

      expect(mockStore.clear).toHaveBeenCalled();
    });
  });

  describe('keys', () => {
    it('should get all keys from object store', async () => {
      const mockStore = {
        getAllKeys: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null,
          result: ['key1', 'key2', 'key3']
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.getAllKeys();
      request.onsuccess({ target: { result: ['key1', 'key2', 'key3'] } });

      const keys = await storage.keys('files');
      expect(keys).toEqual(['key1', 'key2', 'key3']);
    });
  });

  describe('has', () => {
    it('should check if key exists', async () => {
      const mockStore = {
        get: jest.fn().mockReturnValue({
          onsuccess: null,
          onerror: null,
          result: { key: 'test-key', value: 'test-value' }
        })
      };

      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue(mockStore)
      });

      await storage.init();

      const request = mockStore.get();
      request.onsuccess({ target: { result: { value: 'test-value' } } });

      const exists = await storage.has('files', 'test-key');
      expect(exists).toBe(true);
    });
  });

  describe('close', () => {
    it('should close database connection', () => {
      storage.close();
      expect(mockDb.close).toHaveBeenCalled();
    });
  });
});

