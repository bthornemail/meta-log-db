---
id: testing-guide-canvasl-metaverse-browser
title: "Testing Guide for CanvasL Metaverse Browser"
level: practical
type: guide
tags: [testing, jest, browser-tests, node-tests, test-coverage]
keywords: [testing-guide, jest-configuration, browser-testing, test-coverage, canvasl-browser-tests]
prerequisites: [meta-log-db-rfc2119-specification]
enables: [test-implementation, ci-cd-integration]
related: [canvasl-metaverse-browser-api, meta-log-db-rfc2119-specification]
readingTime: 25
difficulty: 3
version: "1.0.0"
gitTag: "v1.0.0"
blackboard:
  status: active
  assignedAgent: "meta-log-db-documentation-agent"
  lastUpdate: "2025-01-17"
  dependencies: []
  watchers: []
---

# Testing Guide for CanvasL Metaverse Browser

**Version**: 1.0.0  
**Last Updated**: 2025-01-17

## Overview

This guide explains how to run tests for the `CanvasLMetaverseBrowser` module and the meta-log-db package.

## Test Structure

The test suite is organized into two environments:

1. **Node.js Tests**: Tests for Node.js-specific functionality
2. **Browser Tests**: Tests for browser-specific functionality (using jsdom)

## Running Tests

### Run All Tests

```bash
cd meta-log-db
npm test
```

This runs both Node.js and browser tests using Jest projects configuration.

### Run Node.js Tests Only

```bash
npm test -- --selectProjects node
```

### Run Browser Tests Only

```bash
npm test -- --selectProjects browser
```

### Run Specific Test File

```bash
npm test -- canvasl-browser.test.ts
```

### Watch Mode

```bash
npm test -- --watch
```

## Test Configuration

### Jest Configuration

The Jest configuration (`jest.config.js`) uses projects to separate Node.js and browser test environments:

- **Node.js Project**: Tests in `src/**/__tests__/` (excluding browser)
- **Browser Project**: Tests in `src/browser/**/__tests__/` using jsdom environment

### Browser Test Setup

Browser tests use a setup file (`src/browser/__tests__/setup.js`) that mocks:

- **IndexedDB**: Mocked IndexedDB API for storage operations
- **Fetch API**: Mocked fetch for file loading
- **Window Object**: Mocked window for browser globals

## Test Coverage

### CanvasL Metaverse Browser Tests

**File**: `src/browser/__tests__/canvasl-browser.test.ts`

Coverage includes:

- ✅ Initialization (success, idempotent, state checks)
- ✅ Canvas loading (path loading, JSONL/CanvasL parsing, parameter order)
- ✅ Query execution (ProLog, DataLog, SPARQL with options)
- ✅ R5RS functions (execution, error handling, listing)
- ✅ CanvasL object execution (all types, batch execution, error handling)
- ✅ Utility methods (fact extraction, RDF conversion, database access)

### Running Coverage

```bash
npm test -- --coverage
```

Coverage reports are generated in:
- `coverage/node/` - Node.js test coverage
- `coverage/browser/` - Browser test coverage

## Browser Test Environment

### jsdom Setup

Browser tests run in a jsdom environment which provides:

- DOM APIs (document, window, etc.)
- Browser globals (fetch, indexedDB, etc.)
- Event handling

### Mocking Browser APIs

The setup file (`src/browser/__tests__/setup.js`) provides mocks for:

```javascript
// IndexedDB mock
global.indexedDB = { /* ... */ };

// Fetch API mock
global.fetch = jest.fn(() => Promise.resolve({ /* ... */ }));

// Window object
global.window = { indexedDB, fetch };
```

## Writing Tests

### Example Test Structure

```typescript
import { CanvasLMetaverseBrowser } from '../canvasl-browser.js';

describe('CanvasLMetaverseBrowser', () => {
  let browser: CanvasLMetaverseBrowser;

  beforeEach(() => {
    browser = new CanvasLMetaverseBrowser({
      indexedDBName: 'test-db'
    });
  });

  afterEach(async () => {
    if (browser.isInitialized()) {
      await browser.clear();
    }
  });

  it('should initialize successfully', async () => {
    await browser.init();
    expect(browser.isInitialized()).toBe(true);
  });
});
```

### Testing Async Operations

```typescript
it('should load canvas asynchronously', async () => {
  await browser.init();
  await browser.loadCanvas('file.jsonl', '/url/file.jsonl');
  const facts = browser.extractFacts();
  expect(facts.length).toBeGreaterThan(0);
});
```

### Testing Error Cases

```typescript
it('should handle errors gracefully', async () => {
  await browser.init();
  
  // Test error handling
  try {
    await browser.loadCanvas('nonexistent.jsonl', '/url/nonexistent.jsonl');
    fail('Should have thrown an error');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});
```

## Troubleshooting

### Tests Fail with "indexedDB is not defined"

**Solution**: Ensure the browser test setup file is being loaded. Check that `setupFilesAfterEnv` is configured in Jest config.

### Tests Fail with "fetch is not defined"

**Solution**: The setup file mocks fetch, but if tests still fail, ensure jsdom environment is being used for browser tests.

### Import Errors

**Solution**: Check that module paths are correct. Browser tests should import from `'../canvasl-browser.js'` (with `.js` extension for TypeScript).

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm test -- --coverage
```

## Related Documentation

- [CanvasL Metaverse Browser API Reference](./docs/CANVASL_METAVERSE_BROWSER_API.md)
- [Real-World Examples](./docs/EXAMPLES.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

