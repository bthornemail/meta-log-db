---
id: canvasl-metaverse-browser-api
title: "CanvasL Metaverse Browser API Reference"
level: foundational
type: api-reference
tags: [api-reference, canvasl-browser, browser-api, documentation]
keywords: [canvasl-metaverse-browser, api-reference, browser-api, canvasl-objects, query-api, r5rs-integration]
prerequisites: [meta-log-db-rfc2119-specification]
enables: [canvasl-browser-implementation, browser-integration]
related: [meta-log-db-rfc2119-specification, migration-guide, examples]
readingTime: 60
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

# CanvasL Metaverse Browser API Reference

**Version**: 1.0.0  
**Last Updated**: 2025-01-17

## Overview

`CanvasLMetaverseBrowser` provides a unified browser API for CanvasL operations, consolidating implementations from `template-projector` and `ui` packages. It offers a complete interface for loading, parsing, querying, and executing CanvasL files in browser environments.

## Installation

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';
```

## Configuration

```typescript
interface CanvasLBrowserConfig {
  enableProlog?: boolean;        // Enable ProLog engine (default: true)
  enableDatalog?: boolean;       // Enable DataLog engine (default: true)
  enableRdf?: boolean;           // Enable RDF/SPARQL support (default: true)
  enableShacl?: boolean;         // Enable SHACL validation (default: true)
  enableEncryption?: boolean;     // Enable encryption (default: false)
  mnemonic?: string;             // BIP39 mnemonic for encryption
  indexedDBName?: string;        // IndexedDB database name (default: 'meta-log-db')
  cacheStrategy?: 'memory' | 'indexeddb' | 'both';  // Cache strategy (default: 'both')
  r5rsEngineURL?: string;        // URL to R5RS engine file
}
```

## Basic Usage

```typescript
// Create browser instance
const browser = new CanvasLMetaverseBrowser({
  indexedDBName: 'my-app-db',
  cacheStrategy: 'both'
});

// Initialize (required before use)
await browser.init();

// Load canvas file
await browser.loadCanvas('path/to/file.jsonl', '/url/to/file.jsonl');

// Extract facts
const facts = browser.extractFacts();

// Execute queries
const prologResults = await browser.prologQuery('(node ?Id ?Type)');
const datalogResults = await browser.datalogQuery('(node ?Id ?Type)');
const sparqlResults = await browser.sparqlQuery('SELECT ?s WHERE { ?s ?p ?o }');
```

## API Methods

### Initialization

#### `init(): Promise<void>`

Initialize the browser database. Sets up IndexedDB, file I/O, and engines. Uses lazy initialization with promise-based pattern to prevent race conditions.

```typescript
await browser.init();
```

**Returns**: `Promise<void>`

**Throws**: `Error` if initialization fails

---

### Canvas Loading

#### `loadCanvas(path: string, url?: string): Promise<void>`

Load a CanvasL or JSONL file from URL or path. The file is parsed, facts are extracted, and loaded into ProLog, DataLog, and RDF engines.

```typescript
// Load from URL
await browser.loadCanvas('automaton-kernel.jsonl', '/jsonl/automaton-kernel.jsonl');

// Load from path (uses path as URL)
await browser.loadCanvas('automaton-kernel.jsonl');
```

**Parameters**:
- `path: string` - File path identifier (for caching)
- `url?: string` - Optional URL to fetch file from (uses path if not provided)

**Returns**: `Promise<void>`

**Throws**: `Error` if file loading fails

---

#### `parseJsonlCanvas(path: string, url?: string): Promise<Canvas>`

Parse a JSONL canvas file without loading into database engines.

```typescript
const canvas = await browser.parseJsonlCanvas('file.jsonl', '/url/file.jsonl');
```

**Parameters**:
- `path: string` - File path identifier
- `url?: string` - Optional URL to fetch file from

**Returns**: `Promise<Canvas>` - Parsed canvas object

---

#### `parseCanvasL(path: string, url?: string): Promise<Canvas>`

Parse a CanvasL file without loading into database engines.

```typescript
const canvas = await browser.parseCanvasL('file.canvasl', '/url/file.canvasl');
```

**Parameters**:
- `path: string` - File path identifier
- `url?: string` - Optional URL to fetch file from

**Returns**: `Promise<Canvas>` - Parsed canvas object

---

### Query Execution

#### `prologQuery(query: string, options?: CanvasLQueryOptions): Promise<PrologQueryResult>`

Execute a ProLog query.

```typescript
const result = await browser.prologQuery('(node ?Id ?Type)', {
  facts: [{ predicate: 'node', args: ['id1', 'type1'] }]
});
```

**Parameters**:
- `query: string` - ProLog query string
- `options?: CanvasLQueryOptions` - Optional query options

**Returns**: `Promise<PrologQueryResult>` - Query results with bindings

---

#### `datalogQuery(goal: string, program?: any, options?: CanvasLQueryOptions): Promise<DatalogQueryResult>`

Execute a DataLog query.

```typescript
const result = await browser.datalogQuery('(node ?Id ?Type)', program);
```

**Parameters**:
- `goal: string` - DataLog goal query
- `program?: any` - Optional DataLog program
- `options?: CanvasLQueryOptions` - Optional query options

**Returns**: `Promise<DatalogQueryResult>` - Query results with facts

---

#### `sparqlQuery(query: string, options?: CanvasLQueryOptions): Promise<SparqlQueryResult>`

Execute a SPARQL query.

```typescript
const result = await browser.sparqlQuery(`
  SELECT ?s ?p ?o WHERE {
    ?s ?p ?o
  } LIMIT 10
`);
```

**Parameters**:
- `query: string` - SPARQL query string
- `options?: CanvasLQueryOptions` - Optional query options

**Returns**: `Promise<SparqlQueryResult>` - Query results with bindings

---

#### `validateShacl(shapes?: any, triples?: any[]): Promise<ShaclValidationReport>`

Validate RDF triples against SHACL shapes.

```typescript
const shapes = {
  'NodeShape': {
    targetClass: 'http://example.org/Node',
    properties: [{
      path: 'rdf:type',
      minCount: 1
    }]
  }
};

const result = await browser.validateShacl(shapes, triples);
```

**Parameters**:
- `shapes?: any` - SHACL shapes object
- `triples?: any[]` - Optional RDF triples to validate (uses loaded triples if not provided)

**Returns**: `Promise<ShaclValidationReport>` - Validation report

---

### R5RS Functions

#### `executeR5RS(functionName: string, args: any[]): Promise<any>`

Execute an R5RS function.

```typescript
const result = await browser.executeR5RS('r5rs:church-add', [2, 3]);
```

**Parameters**:
- `functionName: string` - R5RS function name (e.g., 'r5rs:church-add')
- `args: any[]` - Function arguments

**Returns**: `Promise<any>` - Function result

---

#### `getR5RSFunction(name: string): Promise<any>`

Get R5RS function definition if available.

```typescript
const fn = await browser.getR5RSFunction('r5rs:church-add');
```

**Parameters**:
- `name: string` - Function name

**Returns**: `Promise<any>` - Function definition or null

---

#### `listR5RSFunctions(pattern?: string): Promise<string[]>`

List available R5RS functions.

```typescript
// List all functions
const all = await browser.listR5RSFunctions();

// List functions matching pattern
const churchFunctions = await browser.listR5RSFunctions('church');
```

**Parameters**:
- `pattern?: string` - Optional regex pattern to filter functions

**Returns**: `Promise<string[]>` - Array of function names

---

#### `invokeR5RSFunction(name: string, args: any[], context?: any): Promise<any>`

Invoke R5RS function (alias for `executeR5RS`).

```typescript
const result = await browser.invokeR5RSFunction('r5rs:church-add', [2, 3]);
```

---

### CanvasL Object Execution

#### `executeCanvasLObject(obj: any): Promise<CanvasLExecutionResult>`

Execute a single CanvasL object.

```typescript
// Execute RDF triple
const result = await browser.executeCanvasLObject({
  type: 'rdf-triple',
  subject: 'http://example.org/s',
  predicate: 'http://example.org/p',
  object: 'http://example.org/o'
});

// Execute R5RS call
const r5rsResult = await browser.executeCanvasLObject({
  type: 'r5rs-call',
  function: 'r5rs:church-add',
  args: [2, 3]
});

// Execute ProLog query
const prologResult = await browser.executeCanvasLObject({
  type: 'prolog-query',
  query: '(node ?Id ?Type)',
  facts: []
});
```

**Supported object types**:
- `rdf-triple` - Add RDF triple to store
- `r5rs-call` - Execute R5RS function
- `sparql-construct` - Execute SPARQL CONSTRUCT query
- `prolog-query` - Execute ProLog query
- `datalog-query` - Execute DataLog query
- `shacl-validate` - Validate with SHACL
- `slide` - Return slide object as-is

**Parameters**:
- `obj: any` - CanvasL object to execute

**Returns**: `Promise<CanvasLExecutionResult>` - Execution result

---

#### `executeCanvasLObjects(objects: any[]): Promise<ExecutionResults>`

Execute multiple CanvasL objects in batch.

```typescript
const results = await browser.executeCanvasLObjects([
  { type: 'rdf-triple', subject: '...', predicate: '...', object: '...' },
  { type: 'slide', id: 'slide-1', dimension: '0D' },
  { type: 'r5rs-call', function: 'r5rs:church-add', args: [2, 3] }
]);

// Results structure:
// {
//   triples: [...],      // RDF triples added
//   slides: [...],      // Slide objects found
//   objects: Map,       // All objects by ID
//   errors: [...]       // Execution errors
// }
```

**Parameters**:
- `objects: any[]` - Array of CanvasL objects to execute

**Returns**: `Promise<ExecutionResults>` - Batch execution results

---

### Facts and RDF

#### `extractFacts(canvasFile?: string): Fact[]`

Extract facts from loaded canvas.

```typescript
const facts = browser.extractFacts();
```

**Parameters**:
- `canvasFile?: string` - Optional canvas file identifier

**Returns**: `Fact[]` - Array of extracted facts

---

#### `jsonlToRdf(facts?: Fact[]): any[]`

Convert facts to RDF triples.

```typescript
const facts = browser.extractFacts();
const triples = browser.jsonlToRdf(facts);
```

**Parameters**:
- `facts?: Fact[]` - Optional facts array (uses loaded facts if not provided)

**Returns**: `any[]` - Array of RDF triples

---

### Rules and Data Management

#### `addPrologRule(rule: string): void`

Add a ProLog rule.

```typescript
browser.addPrologRule('ancestor(X, Z) :- parent(X, Y), ancestor(Y, Z).');
```

**Parameters**:
- `rule: string` - ProLog rule string

---

#### `addDatalogRule(rule: string): void`

Add a DataLog rule.

```typescript
browser.addDatalogRule('ancestor(X, Z) :- parent(X, Y), ancestor(Y, Z).');
```

**Parameters**:
- `rule: string` - DataLog rule string

---

#### `storeTriples(triples: any[]): void`

Store RDF triples in the triple store.

```typescript
browser.storeTriples([
  { subject: 'http://example.org/s', predicate: 'http://example.org/p', object: 'http://example.org/o' }
]);
```

**Parameters**:
- `triples: any[]` - Array of RDF triples

---

#### `addPrologFacts(facts: Fact[]): void`

Add ProLog facts.

```typescript
browser.addPrologFacts([
  { predicate: 'node', args: ['id1', 'type1'] }
]);
```

**Parameters**:
- `facts: Fact[]` - Array of facts

---

#### `addDatalogFacts(facts: Fact[]): void`

Add DataLog facts.

```typescript
browser.addDatalogFacts([
  { predicate: 'node', args: ['id1', 'type1'] }
]);
```

**Parameters**:
- `facts: Fact[]` - Array of facts

---

### Utility Methods

#### `isInitialized(): boolean`

Check if browser is initialized.

```typescript
if (browser.isInitialized()) {
  // Browser is ready
}
```

**Returns**: `boolean` - True if initialized

---

#### `getDb(): MetaLogDbBrowser | null`

Get the underlying database instance (for advanced usage).

```typescript
const db = browser.getDb();
```

**Returns**: `MetaLogDbBrowser | null` - Database instance or null

---

#### `clear(): Promise<void>`

Clear all cached data.

```typescript
await browser.clear();
```

**Returns**: `Promise<void>`

---

## Type Definitions

### CanvasLExecutionResult

```typescript
interface CanvasLExecutionResult {
  type: string;           // Object type
  result?: any;           // Execution result
  error?: string;         // Error message if execution failed
  object?: any;           // Original object
}
```

### ExecutionResults

```typescript
interface ExecutionResults {
  triples: any[];         // RDF triples added
  slides: any[];         // Slide objects found
  objects: Map<string, any>;  // All objects by ID
  errors: Array<{ object: any; error: string }>;  // Execution errors
}
```

### CanvasLQueryOptions

```typescript
interface CanvasLQueryOptions {
  canvasFile?: string;    // Canvas file identifier
  timeout?: number;       // Query timeout
  facts?: Fact[];        // Additional facts
}
```

---

## Examples

### Complete Workflow

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

// Create and initialize
const browser = new CanvasLMetaverseBrowser({
  indexedDBName: 'my-app',
  cacheStrategy: 'both'
});

await browser.init();

// Load canvas
await browser.loadCanvas('automaton-kernel.jsonl', '/jsonl/automaton-kernel.jsonl');

// Extract and query
const facts = browser.extractFacts();
const triples = browser.jsonlToRdf(facts);

// Execute queries
const prologResults = await browser.prologQuery('(node ?Id ?Type)');
const sparqlResults = await browser.sparqlQuery('SELECT ?s WHERE { ?s ?p ?o }');

// Execute CanvasL objects
const results = await browser.executeCanvasLObjects([
  { type: 'rdf-triple', subject: '...', predicate: '...', object: '...' },
  { type: 'slide', id: 'slide-1', dimension: '0D' }
]);
```

### CanvasL Object Execution

```typescript
// Single object
const result = await browser.executeCanvasLObject({
  type: 'r5rs-call',
  function: 'r5rs:church-add',
  args: [2, 3]
});

// Batch execution
const batchResults = await browser.executeCanvasLObjects([
  { type: 'rdf-triple', subject: 's1', predicate: 'p1', object: 'o1' },
  { type: 'rdf-triple', subject: 's2', predicate: 'p2', object: 'o2' },
  { type: 'slide', id: 'deck-slide-1', dimension: '0D' }
]);

console.log(`Added ${batchResults.triples.length} triples`);
console.log(`Found ${batchResults.slides.length} slides`);
```

---

## Migration from MetaLogBrowserAdapter

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

**Quick Migration**:

```typescript
// Old:
import { MetaLogBrowserAdapter } from './MetaLogBrowserAdapter.js';
const adapter = new MetaLogBrowserAdapter();
await adapter.loadCanvas(url, path);

// New:
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';
const browser = new CanvasLMetaverseBrowser();
await browser.loadCanvas(path, url);  // Note: parameter order changed
```

---

## Related Documentation

- [Meta-Log Database README](../README.md) - Main package documentation
- [Browser Database Documentation](../../docs/27-Meta-Log-Browser-Db/README.md) - Browser implementation details
- [CanvasL Specification](../../docs/04-CanvasL/CANVASL-RFC2119-SPEC.md) - CanvasL format specification
- [Real-World Examples](./EXAMPLES.md) - Practical usage examples

