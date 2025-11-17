---
id: meta-log-db-readme
title: "Meta-Log Database Package"
level: foundational
type: documentation
tags: [meta-log-db, readme, package-overview, installation, usage]
keywords: [meta-log-db, prolog, datalog, r5rs, sparql, shacl, canvasl, npm-package]
prerequisites: []
enables: [meta-log-db-installation, meta-log-db-usage]
related: [meta-log-db-rfc2119-specification, glossary, canvasl-metaverse-browser-api]
readingTime: 15
difficulty: 1
version: "1.2.0"
gitTag: "v1.2.0"
blackboard:
  status: active
  assignedAgent: "meta-log-db-documentation-agent"
  lastUpdate: "2025-01-17"
  dependencies: []
  watchers: []
---

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

## Extensions (v1.2.0)

The following extensions are available as optional modules. All extensions are disabled by default for backward compatibility.

### Chain Complex & Homology

Algebraic topology validation with ∂² = 0 property checking:

```typescript
const db = new MetaLogDb({
  enableHomology: true
});

const complex: ChainComplex = {
  C0: [{ id: 'v1', dim: 0, boundary: [], data: {} }],
  C1: [{ id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} }],
  C2: [],
  C3: [],
  C4: [],
  ∂: new Map([['e1', ['v1', 'v2']]])
};

const result = db.validateHomology(complex);
console.log(`Valid: ${result.valid}, Betti numbers: ${result.betti}`);
```

### MetaLogNode

Atemporal DAG node structure with cryptographic identity:

```typescript
import { MetaLogNodeManager } from 'meta-log-db/extensions/metalog-node';

const manager = new MetaLogNodeManager();
const node = await manager.createNode({
  content: {
    topo: { type: 'Topology', objects: {}, arcs: [] },
    geo: { type: 'FeatureCollection', features: [] }
  },
  parent: 'genesis'
});

const isValid = await manager.verifyNode(node);
```

### Projective/Affine Geometry

Coordinate system transformations:

```typescript
import { ProjectiveAffineConverter } from 'meta-log-db/extensions/geometry';

const converter = new ProjectiveAffineConverter();
const projective = converter.affineToProjective({ x: 1, y: 2 });
const affine = converter.projectiveToAffine({ x: 1, y: 2, z: 0, w: 1 });
```

### DAG Operations

Directed Acyclic Graph management:

```typescript
import { DAGManager } from 'meta-log-db/extensions/dag';

const manager = new DAGManager(dag);
const lca = manager.findLCA('cid1', 'cid2');
const children = manager.getChildren('cid1');
const ancestors = manager.getAncestors('cid1');
```

### Org Mode R5RS Functions

Org Mode document parsing:

```typescript
const db = new MetaLogDb({
  enableOrgMode: true
});

// Via R5RS functions
const ast = await db.executeR5RS('r5rs:parse-org-document', [orgContent]);
const headings = await db.executeR5RS('r5rs:extract-headings', [orgContent]);
const blocks = await db.executeR5RS('r5rs:extract-source-blocks', [orgContent]);
```

## Installation

### From npm

```bash
npm install meta-log-db
```

### From Source

```bash
git clone https://github.com/bthornemail/meta-log-db.git
cd meta-log-db
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
  enableShacl: true,
  // Extensions (optional)
  enableHomology: true,
  enableMetaLogNode: true,
  enableProjectiveAffine: true,
  enableDAG: true,
  enableOrgMode: true
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

## Documentation

### Specification

- [RFC2119 Specification](./docs/01-Specification/META-LOG-DB-RFC2119.md) - Complete package specification with MUST/SHOULD/MAY requirements
- [Glossary](./docs/01-Specification/GLOSSARY.md) - Key terms and concepts

### Guides

- [CanvasL Metaverse Browser API](./docs/03-Guides/CANVASL_METAVERSE_BROWSER_API.md) - Complete browser API documentation
- [Migration Guide](./docs/03-Guides/MIGRATION_GUIDE.md) - Migrating from MetaLogBrowserAdapter

### Examples

- [Real-World Examples](./docs/04-Examples/EXAMPLES.md) - Practical usage examples
- [R5RS Examples](./docs/04-Examples/R5RS_EXAMPLES.md) - R5RS Scheme parser examples
- [SHACL Examples](./docs/04-Examples/SHACL_EXAMPLES.md) - SHACL validation examples
- [SPARQL Examples](./docs/04-Examples/SPARQL_EXAMPLES.md) - SPARQL query examples

### Reference

- [Frontmatter Validation Setup](./docs/02-Reference/FRONTMATTER_VALIDATION_SETUP.md) - TypeScript configuration for frontmatter validation
- [Linking Setup](./docs/02-Reference/LINKING_SETUP.md) - npm link setup guide
- [Testing Guide](./docs/02-Reference/TESTING.md) - Testing guide for CanvasL Metaverse Browser

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
  indexedDBName: 'meta-log-db',
  // Extensions (optional)
  enableHomology: true,
  enableMetaLogNode: true,
  enableProjectiveAffine: true,
  enableDAG: true,
  enableOrgMode: true
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

## Package Information

- **Package Name**: `meta-log-db`
- **Version**: 1.2.0
- **License**: MIT
- **Node Version**: >=18.0.0
- **Repository**: https://github.com/bthornemail/meta-log-db

## License

MIT
