/**
 * Jest setup file for browser tests
 * 
 * Sets up browser environment mocks for IndexedDB, fetch, and other browser APIs
 */

// Mock IndexedDB if not available
if (typeof indexedDB === 'undefined') {
  global.indexedDB = {
    open: jest.fn(() => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        createObjectStore: jest.fn(),
        transaction: jest.fn(() => ({
          objectStore: jest.fn(() => ({
            get: jest.fn(() => ({
              onsuccess: null,
              onerror: null,
              result: null
            })),
            put: jest.fn(() => ({
              onsuccess: null,
              onerror: null
            })),
            delete: jest.fn(() => ({
              onsuccess: null,
              onerror: null
            }))
          }))
        }))
      }
    }))
  };
}

// Mock fetch API if not available
if (typeof fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve(''),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })
  );
}

// Mock window object
if (typeof window === 'undefined') {
  global.window = {
    indexedDB: global.indexedDB,
    fetch: global.fetch,
  };
}

