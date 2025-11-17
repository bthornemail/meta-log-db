---
id: meta-log-db-documentation-home
title: "Meta-Log Database Documentation"
level: foundational
type: documentation
tags: [meta-log-db, documentation, home, overview]
keywords: [meta-log-db, documentation, home, getting-started]
prerequisites: []
enables: [meta-log-db-usage, documentation-navigation]
related: [meta-log-db-rfc2119-specification, glossary]
readingTime: 5
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

# Meta-Log Database Documentation

Welcome to the Meta-Log Database documentation. This package provides core database functionality for ProLog, DataLog, and R5RS integration.

## Overview

The Meta-Log Database package (`meta-log-db`) is a native npm package that provides:

- **ProLog Engine** - Logic programming with unification and resolution
- **DataLog Engine** - Fact extraction and bottom-up evaluation
- **R5RS Integration** - Function registry and execution
- **JSONL/CanvasL Parser** - File format parsing and fact extraction
- **RDF/SPARQL Support** - Triple storage and SPARQL queries
- **SHACL Validation** - Shape constraint validation

### Extensions (v1.2.0)

The following extensions are available as optional modules:

- **Chain Complex & Homology** - Algebraic topology validation with ∂² = 0 property checking
- **MetaLogNode** - Atemporal DAG node structure with cryptographic identity
- **Projective/Affine Geometry** - Coordinate system transformations
- **DAG Operations** - Directed Acyclic Graph management
- **Org Mode R5RS Functions** - Org Mode document parsing using `orga` package

## Quick Start

### Installation

```bash
npm install meta-log-db
```

### Basic Usage

```typescript
import { MetaLogDb } from 'meta-log-db';

const db = new MetaLogDb({
  enableProlog: true,
  enableDatalog: true,
  enableRdf: true,
  enableShacl: true
});

await db.loadCanvas('canvas.jsonl');
const facts = db.extractFacts();
const results = await db.prologQuery('(node ?Id ?Type)');
```

## Documentation Sections

### 📋 [Specification](./01-Specification/)

- **[RFC2119 Specification](./01-Specification/META-LOG-DB-RFC2119.md)** - Complete package specification with MUST/SHOULD/MAY requirements
- **[Glossary](./01-Specification/GLOSSARY.md)** - Key terms and concepts

### 📚 [Guides](./03-Guides/)

- **[CanvasL Metaverse Browser API](./03-Guides/CANVASL_METAVERSE_BROWSER_API.md)** - Complete browser API documentation
- **[Migration Guide](./03-Guides/MIGRATION_GUIDE.md)** - Migrating from MetaLogBrowserAdapter
- **[Homology Extension Guide](./03-Guides/HOMOLOGY_EXTENSION.md)** - Chain complex and homology validation
- **[MetaLogNode Extension Guide](./03-Guides/METALOG_NODE_EXTENSION.md)** - Atemporal DAG nodes with cryptographic identity
- **[Geometry Extension Guide](./03-Guides/GEOMETRY_EXTENSION.md)** - Projective/Affine coordinate transformations
- **[DAG Extension Guide](./03-Guides/DAG_EXTENSION.md)** - Directed Acyclic Graph operations
- **[Org Mode Extension Guide](./03-Guides/ORG_MODE_EXTENSION.md)** - Org Mode document parsing

### 💡 [Examples](./04-Examples/)

- **[Real-World Examples](./04-Examples/EXAMPLES.md)** - Practical usage examples
- **[R5RS Examples](./04-Examples/R5RS_EXAMPLES.md)** - R5RS Scheme parser examples
- **[SHACL Examples](./04-Examples/SHACL_EXAMPLES.md)** - SHACL validation examples
- **[SPARQL Examples](./04-Examples/SPARQL_EXAMPLES.md)** - SPARQL query examples
- **[Homology Examples](./04-Examples/HOMOLOGY_EXAMPLES.md)** - Chain complex and homology validation examples
- **[MetaLogNode Examples](./04-Examples/METALOG_NODE_EXAMPLES.md)** - MetaLogNode creation and verification examples
- **[Geometry Examples](./04-Examples/GEOMETRY_EXAMPLES.md)** - Projective/Affine transformation examples
- **[DAG Examples](./04-Examples/DAG_EXAMPLES.md)** - DAG operations examples
- **[Org Mode Examples](./04-Examples/ORG_MODE_EXAMPLES.md)** - Org Mode parsing examples

### 🔧 [Reference](./02-Reference/)

- **[Frontmatter Validation Setup](./02-Reference/FRONTMATTER_VALIDATION_SETUP.md)** - TypeScript configuration for frontmatter validation
- **[Linking Setup](./02-Reference/LINKING_SETUP.md)** - npm link setup guide
- **[Testing Guide](./02-Reference/TESTING.md)** - Testing guide for CanvasL Metaverse Browser

## Package Information

- **Package Name**: `meta-log-db`
- **Version**: 1.2.0
- **License**: MIT
- **Node Version**: >=18.0.0
- **Repository**: [GitHub](https://github.com/bthornemail/meta-log-db)
- **npm**: [meta-log-db](https://www.npmjs.com/package/meta-log-db)

## Browser Usage

For browser environments, use the unified `CanvasLMetaverseBrowser`:

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableProlog: true,
  enableDatalog: true,
  enableRdf: true,
  enableShacl: true,
  cacheStrategy: 'both',
  indexedDBName: 'meta-log-db'
});

await browser.init();
await browser.loadCanvas('canvas.jsonl', '/url/to/canvas.jsonl');
```

## Getting Help

- Check the [Examples](./04-Examples/EXAMPLES.md) for common use cases
- Review the [API Reference](./03-Guides/CANVASL_METAVERSE_BROWSER_API.md) for detailed method documentation
- Consult the [Glossary](./01-Specification/GLOSSARY.md) for term definitions
- Open an issue on [GitHub](https://github.com/bthornemail/meta-log-db/issues)

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

