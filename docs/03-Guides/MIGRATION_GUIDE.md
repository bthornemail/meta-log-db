---
id: migration-guide-metabrowser-adapter-to-canvasl-browser
title: "Migration Guide: MetaLogBrowserAdapter → CanvasLMetaverseBrowser"
level: practical
type: migration-guide
tags: [migration, guide, breaking-changes, api-migration]
keywords: [migration-guide, metabrowser-adapter, canvasl-browser-migration, breaking-changes, api-migration]
prerequisites: [canvasl-metaverse-browser-api]
enables: [migration-implementation, api-upgrade]
related: [canvasl-metaverse-browser-api, meta-log-db-rfc2119-specification]
readingTime: 30
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

# Migration Guide: MetaLogBrowserAdapter → CanvasLMetaverseBrowser

**Version**: 1.0.0  
**Last Updated**: 2025-01-17

## Overview

This guide helps you migrate from the deprecated `MetaLogBrowserAdapter` to the unified `CanvasLMetaverseBrowser` module.

## Why Migrate?

- **Unified API**: Single source of truth for CanvasL browser functionality
- **CanvasL Execution**: Built-in support for executing CanvasL objects
- **Better TypeScript Support**: Full type definitions
- **Consistent Parameter Order**: Standardized API across all consumers
- **Active Development**: `MetaLogBrowserAdapter` is deprecated and will be removed

## Quick Migration

### Step 1: Update Imports

```typescript
// Old:
import { MetaLogBrowserAdapter } from './MetaLogBrowserAdapter.js';
// or
import { MetaLogBrowserAdapter } from 'ui/src/services/meta-log-browser-adapter';

// New:
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';
```

### Step 2: Update Instantiation

```typescript
// Old:
const adapter = new MetaLogBrowserAdapter({
  enableProlog: true,
  enableDatalog: true,
  cacheStrategy: 'both'
});

// New:
const browser = new CanvasLMetaverseBrowser({
  enableProlog: true,
  enableDatalog: true,
  cacheStrategy: 'both'
});
```

### Step 3: Update Parameter Order

**Important**: The `loadCanvas()` parameter order has changed!

```typescript
// Old (MetaLogBrowserAdapter):
await adapter.loadCanvas(url, path);

// New (CanvasLMetaverseBrowser):
await browser.loadCanvas(path, url);  // Note: order reversed
```

The new order is: `(path, url?)` where:
- `path` is the file identifier (for caching)
- `url` is the optional fetch location

### Step 4: Update Method Calls

Most methods remain the same, but check initialization:

```typescript
// Old:
if (adapter.initialized) { ... }

// New:
if (browser.isInitialized()) { ... }
```

## Detailed Migration

### Initialization

```typescript
// Old:
const adapter = new MetaLogBrowserAdapter();
await adapter.init();

// New:
const browser = new CanvasLMetaverseBrowser();
await browser.init();
```

### Loading Canvas Files

```typescript
// Old:
await adapter.loadCanvas('/jsonl/file.jsonl', 'file.jsonl');

// New:
await browser.loadCanvas('file.jsonl', '/jsonl/file.jsonl');
```

### Query Execution

Query methods remain the same:

```typescript
// Both work the same:
const prologResult = await browser.prologQuery('(node ?Id ?Type)');
const datalogResult = await browser.datalogQuery('(node ?Id ?Type)');
const sparqlResult = await browser.sparqlQuery('SELECT ?s WHERE { ?s ?p ?o }');
```

### R5RS Functions

R5RS methods remain the same:

```typescript
// Both work the same:
const result = await browser.executeR5RS('r5rs:church-add', [2, 3]);
const functions = await browser.listR5RSFunctions('church');
```

### CanvasL Object Execution (New Feature)

`CanvasLMetaverseBrowser` adds CanvasL object execution:

```typescript
// New feature - not available in MetaLogBrowserAdapter:
const result = await browser.executeCanvasLObject({
  type: 'r5rs-call',
  function: 'r5rs:church-add',
  args: [2, 3]
});

// Batch execution:
const results = await browser.executeCanvasLObjects([
  { type: 'rdf-triple', subject: '...', predicate: '...', object: '...' },
  { type: 'slide', id: 'slide-1', dimension: '0D' }
]);
```

### Accessing Database Instance

```typescript
// Old:
const db = adapter.getDb();

// New:
const db = browser.getDb();
```

## Migration Checklist

- [ ] Update imports to use `CanvasLMetaverseBrowser`
- [ ] Update instantiation code
- [ ] Fix `loadCanvas()` parameter order: `(path, url)` instead of `(url, path)`
- [ ] Update initialization checks: `isInitialized()` instead of `initialized` property
- [ ] Test all query methods (should work the same)
- [ ] Test R5RS functions (should work the same)
- [ ] Consider using new CanvasL execution features
- [ ] Update tests to use new API

## Backward Compatibility

### template-projector

The `MetaLogBridge` class provides backward compatibility:

```typescript
// Both work:
metaLog.browser.loadCanvas(path, url);  // New way
metaLog.adapter.loadCanvas(path, url);  // Old way (via getter)
```

The `adapter` property is a getter that returns `browser`, so existing code continues to work.

### ui Package

The `MetaLogBrowserAdapter` in the `ui` package now wraps `CanvasLMetaverseBrowser` internally, so existing code continues to work without changes.

## Breaking Changes

1. **Parameter Order**: `loadCanvas(url, path)` → `loadCanvas(path, url)`
2. **Initialization Check**: `adapter.initialized` → `browser.isInitialized()`
3. **Config Access**: `adapter.config` → `browser.getDb().getConfig()`

## Examples

### Complete Migration Example

```typescript
// Before:
import { MetaLogBrowserAdapter } from './MetaLogBrowserAdapter.js';

const adapter = new MetaLogBrowserAdapter({
  indexedDBName: 'my-app',
  cacheStrategy: 'both'
});

await adapter.init();
await adapter.loadCanvas('/jsonl/file.jsonl', 'file.jsonl');

if (adapter.initialized) {
  const facts = adapter.extractFacts();
  const results = await adapter.prologQuery('(node ?Id ?Type)');
}

// After:
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  indexedDBName: 'my-app',
  cacheStrategy: 'both'
});

await browser.init();
await browser.loadCanvas('file.jsonl', '/jsonl/file.jsonl');

if (browser.isInitialized()) {
  const facts = browser.extractFacts();
  const results = await browser.prologQuery('(node ?Id ?Type)');
  
  // New: CanvasL object execution
  const canvaslResult = await browser.executeCanvasLObject({
    type: 'r5rs-call',
    function: 'r5rs:church-add',
    args: [2, 3]
  });
}
```

## Troubleshooting

### Import Errors

If you get import errors, ensure `meta-log-db` is properly linked:

```bash
cd meta-log-db
npm link

cd your-project
npm link meta-log-db
```

### Parameter Order Confusion

Remember: **path first, url second** in the new API:

```typescript
// Correct:
await browser.loadCanvas('file.jsonl', '/url/file.jsonl');

// Wrong (old order):
await browser.loadCanvas('/url/file.jsonl', 'file.jsonl');
```

### Initialization Issues

Use the method, not the property:

```typescript
// Correct:
if (browser.isInitialized()) { ... }

// Wrong:
if (browser.initialized) { ... }
```

## Support

For issues or questions:
- See [API Reference](./CANVASL_METAVERSE_BROWSER_API.md)
- Check [Meta-Log Database README](../README.md)
- Review [Browser Database Documentation](../../docs/27-Meta-Log-Browser-Db/README.md)

