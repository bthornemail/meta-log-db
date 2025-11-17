---
id: canvasl-metaverse-browser-examples
title: "CanvasL Metaverse Browser - Real-World Examples"
level: practical
type: examples
tags: [examples, usage-examples, real-world, code-samples]
keywords: [canvasl-browser-examples, usage-examples, code-samples, react-integration, error-handling, performance]
prerequisites: [canvasl-metaverse-browser-api]
enables: [implementation-examples, integration-patterns]
related: [canvasl-metaverse-browser-api, migration-guide]
readingTime: 45
difficulty: 2
version: "1.0.0"
gitTag: "v1.0.0"
blackboard:
  status: active
  assignedAgent: "meta-log-db-documentation-agent"
  lastUpdate: "2025-01-17"
  dependencies: []
  watchers: []
---

# CanvasL Metaverse Browser - Real-World Examples

**Version**: 1.0.0  
**Last Updated**: 2025-01-17

This document provides practical, real-world usage examples for `CanvasLMetaverseBrowser`.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Loading and Querying CanvasL Presentations](#loading-and-querying-canvasl-presentations)
3. [Batch CanvasL Object Execution](#batch-canvasl-object-execution)
4. [React Integration](#react-integration)
5. [Template-Projector Integration](#template-projector-integration)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Performance Optimization](#performance-optimization)

## Basic Usage

### Simple Initialization and Loading

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

// Create browser instance
const browser = new CanvasLMetaverseBrowser({
  indexedDBName: 'my-app',
  cacheStrategy: 'both'  // Use both memory and IndexedDB cache
});

// Initialize (required before any operations)
await browser.init();

// Load a canvas file
await browser.loadCanvas('presentation.jsonl', '/jsonl/presentation.jsonl');

// Extract facts
const facts = browser.extractFacts();
console.log(`Loaded ${facts.length} facts`);

// Convert to RDF
const triples = browser.jsonlToRdf(facts);
console.log(`Generated ${triples.length} RDF triples`);
```

### Querying Loaded Data

```typescript
// ProLog query
const prologResults = await browser.prologQuery('(node ?Id ?Type)');
console.log(`Found ${prologResults.bindings.length} nodes`);

// DataLog query
const datalogResults = await browser.datalogQuery('(node ?Id ?Type)');
console.log(`Found ${datalogResults.facts.length} node facts`);

// SPARQL query
const sparqlResults = await browser.sparqlQuery(`
  SELECT ?id ?type WHERE {
    ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type
  } LIMIT 10
`);
console.log(`SPARQL found ${sparqlResults.results.bindings.length} results`);
```

## Loading and Querying CanvasL Presentations

### Complete Presentation Workflow

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

async function loadPresentation(presentationUrl: string) {
  const browser = new CanvasLMetaverseBrowser({
    indexedDBName: 'presentations',
    cacheStrategy: 'both'
  });

  await browser.init();

  // Load presentation deck
  await browser.loadCanvas('presentation.jsonl', presentationUrl);

  // Extract all slides
  const facts = browser.extractFacts();
  const slideFacts = facts.filter(f => f.predicate === 'slide');
  
  console.log(`Presentation has ${slideFacts.length} slides`);

  // Query for slides by dimension
  const dimensionalSlides = await browser.prologQuery(`
    (slide ?Id ?Dimension ?Title)
  `);

  // Group slides by dimension
  const slidesByDimension = dimensionalSlides.bindings.reduce((acc, binding) => {
    const dim = binding.Dimension || '0D';
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push({
      id: binding.Id,
      title: binding.Title,
      dimension: dim
    });
    return acc;
  }, {} as Record<string, any[]>);

  return {
    totalSlides: slideFacts.length,
    slidesByDimension,
    browser
  };
}

// Usage
const presentation = await loadPresentation('/jsonl/my-presentation.jsonl');
console.log(`Loaded presentation with slides in dimensions:`, 
  Object.keys(presentation.slidesByDimension));
```

### Querying Presentation Metadata

```typescript
async function analyzePresentation(browser: CanvasLMetaverseBrowser) {
  // Find all nodes
  const nodes = await browser.prologQuery('(node ?Id ?Type ?X ?Y ?Text)');
  
  // Find all edges
  const edges = await browser.prologQuery('(edge ?Id ?Type ?From ?To)');
  
  // Find vertical relationships (dimensional progression)
  const vertical = await browser.prologQuery('(vertical ?Id ?From ?To)');
  
  // Find horizontal relationships (topology ↔ system)
  const horizontal = await browser.prologQuery('(horizontal ?Id ?From ?To)');

  return {
    nodeCount: nodes.bindings.length,
    edgeCount: edges.bindings.length,
    verticalRelations: vertical.bindings.length,
    horizontalRelations: horizontal.bindings.length,
    structure: {
      nodes: nodes.bindings,
      edges: edges.bindings,
      vertical: vertical.bindings,
      horizontal: horizontal.bindings
    }
  };
}
```

## Batch CanvasL Object Execution

### Executing a Complete CanvasL Deck

```typescript
async function executeCanvasLDeck(canvaslObjects: any[]) {
  const browser = new CanvasLMetaverseBrowser();
  await browser.init();

  // Execute all objects in batch
  const results = await browser.executeCanvasLObjects(canvaslObjects);

  // Process results
  console.log(`Execution complete:`);
  console.log(`  - Added ${results.triples.length} RDF triples`);
  console.log(`  - Found ${results.slides.length} slides`);
  console.log(`  - Processed ${results.objects.size} objects`);
  
  if (results.errors.length > 0) {
    console.warn(`  - ${results.errors.length} errors occurred:`);
    results.errors.forEach(err => {
      console.warn(`    ${err.error}:`, err.object);
    });
  }

  // Access slides by ID
  const slideMap = new Map();
  results.slides.forEach(slide => {
    if (slide.id) {
      slideMap.set(slide.id, slide);
    }
  });

  return {
    results,
    slideMap,
    browser
  };
}

// Usage with CanvasL deck
const deckObjects = [
  { type: 'rdf-triple', subject: 's1', predicate: 'p1', object: 'o1' },
  { type: 'slide', id: 'intro', dimension: '0D', title: 'Introduction' },
  { type: 'slide', id: 'main', dimension: '1D', title: 'Main Content' },
  { type: 'r5rs-call', function: 'r5rs:church-add', args: [2, 3] }
];

const deck = await executeCanvasLDeck(deckObjects);
console.log(`Deck has ${deck.slideMap.size} slides`);
```

### Filtering and Processing Results

```typescript
async function processCanvasLResults(results: any) {
  // Filter slides by dimension
  const slidesByDimension = results.slides.reduce((acc, slide) => {
    const dim = slide.dimension || '0D';
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(slide);
    return acc;
  }, {} as Record<string, any[]>);

  // Extract RDF triples by predicate
  const triplesByPredicate = results.triples.reduce((acc, triple) => {
    const pred = triple.predicate;
    if (!acc[pred]) acc[pred] = [];
    acc[pred].push(triple);
    return acc;
  }, {} as Record<string, any[]>);

  // Group objects by type
  const objectsByType = Array.from(results.objects.values()).reduce((acc, obj) => {
    const type = obj.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(obj);
    return acc;
  }, {} as Record<string, any[]>);

  return {
    slidesByDimension,
    triplesByPredicate,
    objectsByType,
    errorCount: results.errors.length
  };
}
```

## React Integration

### React Hook for CanvasL Browser

```typescript
import { useState, useEffect, useCallback } from 'react';
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

export function useCanvasLBrowser(config?: any) {
  const [browser, setBrowser] = useState<CanvasLMetaverseBrowser | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function initBrowser() {
      try {
        const instance = new CanvasLMetaverseBrowser({
          indexedDBName: 'react-app',
          cacheStrategy: 'both',
          ...config
        });
        
        await instance.init();
        
        if (mounted) {
          setBrowser(instance);
          setInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    initBrowser();

    return () => {
      mounted = false;
    };
  }, [config]);

  const loadCanvas = useCallback(async (path: string, url?: string) => {
    if (!browser) throw new Error('Browser not initialized');
    await browser.loadCanvas(path, url);
  }, [browser]);

  const query = useCallback(async (type: 'prolog' | 'datalog' | 'sparql', query: string) => {
    if (!browser) throw new Error('Browser not initialized');
    
    switch (type) {
      case 'prolog':
        return await browser.prologQuery(query);
      case 'datalog':
        return await browser.datalogQuery(query);
      case 'sparql':
        return await browser.sparqlQuery(query);
    }
  }, [browser]);

  const executeObjects = useCallback(async (objects: any[]) => {
    if (!browser) throw new Error('Browser not initialized');
    return await browser.executeCanvasLObjects(objects);
  }, [browser]);

  return {
    browser,
    initialized,
    error,
    loadCanvas,
    query,
    executeObjects
  };
}

// Usage in component
function PresentationViewer() {
  const { browser, initialized, loadCanvas, query, executeObjects } = useCanvasLBrowser();

  useEffect(() => {
    if (initialized) {
      loadCanvas('presentation.jsonl', '/jsonl/presentation.jsonl');
    }
  }, [initialized, loadCanvas]);

  const handleQuery = async () => {
    const results = await query('prolog', '(node ?Id ?Type)');
    console.log('Query results:', results);
  };

  if (!initialized) {
    return <div>Initializing...</div>;
  }

  return (
    <div>
      <button onClick={handleQuery}>Run Query</button>
    </div>
  );
}
```

### React Component with CanvasL Execution

```typescript
import React, { useState, useEffect } from 'react';
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

interface CanvasLViewerProps {
  canvaslUrl: string;
}

export function CanvasLViewer({ canvaslUrl }: CanvasLViewerProps) {
  const [browser, setBrowser] = useState<CanvasLMetaverseBrowser | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndExecute() {
      try {
        const instance = new CanvasLMetaverseBrowser({
          indexedDBName: 'canvasl-viewer'
        });
        
        await instance.init();
        
        // Load canvas
        await instance.loadCanvas('canvasl.jsonl', canvaslUrl);
        
        // Extract and execute CanvasL objects
        const facts = instance.extractFacts();
        const canvaslObjects = facts
          .filter(f => f.predicate === 'canvasl-object')
          .map(f => f.args[0]); // Assuming object is first arg
        
        // Execute objects
        const results = await instance.executeCanvasLObjects(canvaslObjects);
        
        setBrowser(instance);
        setSlides(results.slides);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }

    loadAndExecute();
  }, [canvaslUrl]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>CanvasL Presentation</h2>
      <p>{slides.length} slides loaded</p>
      {slides.map((slide, idx) => (
        <div key={slide.id || idx}>
          <h3>{slide.title || `Slide ${idx + 1}`}</h3>
          <p>Dimension: {slide.dimension || '0D'}</p>
        </div>
      ))}
    </div>
  );
}
```

## Template-Projector Integration

### Using with Template-Projector

```javascript
// In template-projector/src/projector/Projector.js or similar
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

export class Projector {
  constructor() {
    // Use unified browser module
    this.browser = new CanvasLMetaverseBrowser({
      indexedDBName: 'template-projector',
      cacheStrategy: 'both'
    });
  }

  async loadPresentation(presentationUrl) {
    await this.browser.init();
    
    // Load presentation
    await this.browser.loadCanvas('presentation.jsonl', presentationUrl);
    
    // Execute CanvasL objects
    const facts = this.browser.extractFacts();
    const canvaslObjects = this.extractCanvasLObjects(facts);
    
    const results = await this.browser.executeCanvasLObjects(canvaslObjects);
    
    // Process slides
    this.slides = results.slides;
    this.triples = results.triples;
    
    return results;
  }

  extractCanvasLObjects(facts) {
    // Extract CanvasL objects from facts
    return facts
      .filter(f => f.predicate === 'canvasl-object' || f.predicate === 'slide')
      .map(f => f.args[0]);
  }

  async queryPresentation(queryType, query) {
    switch (queryType) {
      case 'prolog':
        return await this.browser.prologQuery(query);
      case 'datalog':
        return await this.browser.datalogQuery(query);
      case 'sparql':
        return await this.browser.sparqlQuery(query);
    }
  }
}
```

## Error Handling Patterns

### Comprehensive Error Handling

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

async function safeLoadCanvas(
  browser: CanvasLMetaverseBrowser,
  path: string,
  url?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await browser.loadCanvas(path, url);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('fetch')) {
        return { success: false, error: 'Network error: Could not load file' };
      }
      if (error.message.includes('parse')) {
        return { success: false, error: 'Parse error: Invalid file format' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}

async function safeExecuteObjects(
  browser: CanvasLMetaverseBrowser,
  objects: any[]
): Promise<{ results?: any; errors: any[] }> {
  try {
    const results = await browser.executeCanvasLObjects(objects);
    
    // Check for execution errors
    if (results.errors.length > 0) {
      console.warn('Some objects failed to execute:', results.errors);
    }
    
    return { results, errors: results.errors };
  } catch (error) {
    console.error('Batch execution failed:', error);
    return {
      errors: [{
        object: null,
        error: error instanceof Error ? error.message : String(error)
      }]
    };
  }
}

// Usage with retry logic
async function loadWithRetry(
  browser: CanvasLMetaverseBrowser,
  path: string,
  url: string,
  maxRetries = 3
): Promise<void> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await safeLoadCanvas(browser, path, url);
    
    if (result.success) {
      return;
    }
    
    lastError = new Error(result.error);
    console.warn(`Attempt ${attempt} failed: ${result.error}`);
    
    if (attempt < maxRetries) {
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError || new Error('Failed to load canvas after retries');
}
```

### Error Recovery Patterns

```typescript
async function executeWithFallback(
  browser: CanvasLMetaverseBrowser,
  objects: any[]
) {
  const results = await browser.executeCanvasLObjects(objects);
  
  // Handle errors with fallback strategies
  for (const error of results.errors) {
    const obj = error.object;
    
    // Fallback for R5RS call failures
    if (obj?.type === 'r5rs-call') {
      console.warn(`R5RS call failed: ${error.error}, using default value`);
      // Add default result
      results.objects.set(obj.id || 'fallback', {
        type: 'r5rs-result',
        result: null,
        fallback: true
      });
    }
    
    // Fallback for SPARQL query failures
    if (obj?.type === 'sparql-construct') {
      console.warn(`SPARQL query failed: ${error.error}, using empty result`);
      results.objects.set(obj.id || 'fallback', {
        type: 'sparql-result',
        result: { results: { bindings: [] } },
        fallback: true
      });
    }
  }
  
  return results;
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Use IndexedDB cache for large files
const browser = new CanvasLMetaverseBrowser({
  indexedDBName: 'my-app',
  cacheStrategy: 'indexeddb'  // Use IndexedDB for persistence
});

// Pre-load common files
async function preloadCommonFiles(browser: CanvasLMetaverseBrowser) {
  const commonFiles = [
    'automaton-kernel.jsonl',
    'common-slides.jsonl'
  ];
  
  await browser.init();
  
  // Load files in parallel
  await Promise.all(
    commonFiles.map(file => 
      browser.loadCanvas(file, `/jsonl/${file}`)
    )
  );
  
  console.log('Common files preloaded and cached');
}
```

### Batch Operations

```typescript
// Execute multiple queries in parallel
async function batchQueries(
  browser: CanvasLMetaverseBrowser,
  queries: Array<{ type: 'prolog' | 'datalog' | 'sparql'; query: string }>
) {
  const promises = queries.map(q => {
    switch (q.type) {
      case 'prolog':
        return browser.prologQuery(q.query);
      case 'datalog':
        return browser.datalogQuery(q.query);
      case 'sparql':
        return browser.sparqlQuery(q.query);
    }
  });
  
  const results = await Promise.all(promises);
  return results;
}

// Usage
const queryResults = await batchQueries(browser, [
  { type: 'prolog', query: '(node ?Id ?Type)' },
  { type: 'sparql', query: 'SELECT ?s WHERE { ?s ?p ?o } LIMIT 10' },
  { type: 'datalog', query: '(edge ?Id ?Type ?From ?To)' }
]);
```

### Memory Management

```typescript
// Clear cache when memory is low
async function manageMemory(browser: CanvasLMetaverseBrowser) {
  // Check memory usage (if available)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1048576;
    const limitMB = memory.jsHeapSizeLimit / 1048576;
    
    if (usedMB / limitMB > 0.8) {
      console.warn('Memory usage high, clearing cache');
      await browser.clear();
    }
  }
}

// Lazy loading pattern
class LazyCanvasLoader {
  private browser: CanvasLMetaverseBrowser | null = null;
  
  async getBrowser(): Promise<CanvasLMetaverseBrowser> {
    if (!this.browser) {
      this.browser = new CanvasLMetaverseBrowser();
      await this.browser.init();
    }
    return this.browser;
  }
  
  async loadWhenNeeded(path: string, url: string) {
    const browser = await this.getBrowser();
    // Check if already loaded
    const facts = browser.extractFacts();
    if (facts.length === 0) {
      await browser.loadCanvas(path, url);
    }
  }
}
```

## Advanced Patterns

### Custom CanvasL Object Handlers

```typescript
class ExtendedCanvasLBrowser extends CanvasLMetaverseBrowser {
  async executeCanvasLObject(obj: any): Promise<any> {
    // Handle custom object types
    if (obj.type === 'custom-action') {
      return await this.handleCustomAction(obj);
    }
    
    // Fall back to default execution
    return await super.executeCanvasLObject(obj);
  }
  
  private async handleCustomAction(obj: any): Promise<any> {
    // Custom handling logic
    console.log('Executing custom action:', obj.action);
    return { type: 'custom-result', result: 'custom' };
  }
}
```

### Event-Driven Execution

```typescript
class EventDrivenBrowser extends CanvasLMetaverseBrowser {
  private eventListeners: Map<string, Function[]> = new Map();
  
  on(event: string, listener: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  async executeCanvasLObjects(objects: any[]): Promise<any> {
    this.emit('execution:start', { count: objects.length });
    
    const results = await super.executeCanvasLObjects(objects);
    
    this.emit('execution:complete', {
      triples: results.triples.length,
      slides: results.slides.length,
      errors: results.errors.length
    });
    
    return results;
  }
}

// Usage
const browser = new EventDrivenBrowser();
browser.on('execution:start', (data) => {
  console.log(`Starting execution of ${data.count} objects`);
});
browser.on('execution:complete', (data) => {
  console.log(`Execution complete: ${data.slides} slides, ${data.triples} triples`);
});
```

## Related Documentation

- [CanvasL Metaverse Browser API Reference](./CANVASL_METAVERSE_BROWSER_API.md) - Complete API documentation
- [Migration Guide](./MIGRATION_GUIDE.md) - Migrating from MetaLogBrowserAdapter
- [Meta-Log Database README](../README.md) - Main package documentation

