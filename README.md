# Meta-Log Database Package

A native npm package providing core database functionality for ProLog, DataLog, and R5RS integration. This package can be `npm link`ed into both OpenCode and Obsidian plugins to provide a common database interface.

## Overview

The Meta-Log Database package (`meta-log-db`) provides:

- **ProLog Engine** - Logic programming with unification and resolution
- **DataLog Engine** - Fact extraction and bottom-up evaluation
- **R5RS Integration** - Function registry and execution
- **JSONL/CanvasL Parser** - File format parsing and fact extraction
- **RDF/SPARQL Support** - Triple storage and SPARQL queries
- **SHACL Validation** - Shape constraint validation

## Installation

```bash
npm install
npm run build
npm link
```

## Usage

```typescript
import { MetaLogDb } from 'meta-log-db';

const db = new MetaLogDb({
  r5rsEnginePath: './r5rs-canvas-engine.scm',
  enableProlog: true,
  enableDatalog: true,
  enableRdf: true,
  enableShacl: true
});

// Load JSONL canvas
await db.loadCanvas('automaton-kernel.jsonl');

// Extract facts
const facts = db.extractFacts();

// ProLog query
const results = await db.prologQuery('(node ?Id ?Type)');

// DataLog query
const datalogResults = await db.datalogQuery('(missing_implementation ?N)');

// SPARQL query
const sparqlResults = await db.sparqlQuery(`
  SELECT ?id ?type WHERE {
    ?id rdf:type ?type
  }
`);

// SHACL validation
const validation = await db.validateShacl();
```

## API Reference

- [CanvasL Metaverse Browser API](./docs/CANVASL_METAVERSE_BROWSER_API.md) - Complete browser API documentation
- [Real-World Examples](./docs/EXAMPLES.md) - Practical usage examples
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Migrating from MetaLogBrowserAdapter
- [API.md](./API.md) - Node.js API documentation (if available)

## Development

```bash
# Build (Node.js)
npm run build

# Build browser bundle
npm run build:browser

# Build all (Node.js + browser)
npm run build:all

# Verify browser build
npm run verify:browser

# Watch mode
npm run watch

# Test
npm test
```

## Browser Usage

For browser environments, use the unified `CanvasLMetaverseBrowser`:

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableProlog: true,
  enableDatalog: true,
  enableRdf: true,
  enableShacl: true,
  cacheStrategy: 'both', // Use both memory and IndexedDB cache
  indexedDBName: 'meta-log-db'
});

// Initialize (sets up IndexedDB, file I/O, etc.)
await browser.init();

// Load canvas from URL (path is identifier, url is fetch location)
await browser.loadCanvas('automaton-kernel.jsonl', '/jsonl/automaton-kernel.jsonl');

// Use same API as Node.js version
const facts = browser.extractFacts();
const results = await browser.prologQuery('(node ?Id ?Type)');

// Execute CanvasL objects
const canvaslResult = await browser.executeCanvasLObject({
  type: 'r5rs-call',
  function: 'r5rs:church-add',
  args: [2, 3]
});
```

### CanvasL Object Execution

`CanvasLMetaverseBrowser` provides unified CanvasL object execution:

```typescript
// Execute single CanvasL object
const result = await browser.executeCanvasLObject({
  type: 'rdf-triple',
  subject: 'http://example.org/s',
  predicate: 'http://example.org/p',
  object: 'http://example.org/o'
});

// Execute multiple CanvasL objects
const results = await browser.executeCanvasLObjects([
  { type: 'rdf-triple', subject: '...', predicate: '...', object: '...' },
  { type: 'slide', id: 'slide-1', dimension: '0D' },
  { type: 'r5rs-call', function: 'r5rs:church-add', args: [2, 3] }
]);
```

Supported CanvasL object types:
- `rdf-triple` - Add RDF triple to store
- `r5rs-call` - Execute R5RS function
- `sparql-construct` - Execute SPARQL CONSTRUCT query
- `prolog-query` - Execute ProLog query
- `datalog-query` - Execute DataLog query
- `shacl-validate` - Validate with SHACL
- `slide` - Return slide object as-is

### Legacy Browser API

For backward compatibility, `MetaLogDbBrowser` is still available:

```typescript
import { MetaLogDbBrowser } from 'meta-log-db/browser';

const db = new MetaLogDbBrowser({ /* config */ });
await db.init();
await db.loadCanvas('path', 'url');
```

## Linking to Plugins

```bash
# Link meta-log-db
cd meta-log-db
npm link

# Use in OpenCode plugin
cd .opencode
npm link meta-log-db

# Use in Obsidian plugin
cd .obsidian/plugins/universal-life-protocol-plugin
npm link meta-log-db
```

## License

MIT
