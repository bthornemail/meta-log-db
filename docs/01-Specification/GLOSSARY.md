---
id: meta-log-db-glossary
title: "Meta-Log Database Glossary"
level: foundational
type: documentation
tags: [glossary, terminology, definitions, meta-log-db]
keywords: [glossary, terms, definitions, concepts, meta-log, prolog, datalog, r5rs, canvasl, sparql, shacl]
prerequisites: []
enables: [meta-log-db-understanding, api-documentation]
related: [meta-log-db-rfc2119-specification, canvasl-metaverse-browser-api]
readingTime: 30
difficulty: 2
version: "1.0.0"
gitTag: "v1.0.0"
immutableTag: "v1.0.0-immutable"
versionDirectory: "versions/v1.0.0/"
blackboard:
  status: active
  assignedAgent: "meta-log-db-documentation-agent"
  lastUpdate: "2025-01-17"
  dependencies: []
  watchers: []
---

# Meta-Log Database Glossary

**Version**: 1.0.0  
**Last Updated**: 2025-01-17

This glossary defines key terms and concepts used in the Meta-Log Database package and related documentation.

## A

### API (Application Programming Interface)

A set of functions, methods, and protocols that define how software components interact. The Meta-Log Database package provides APIs for Node.js and browser environments.

## B

### Bipartite-BQF

**Bipartite Binary Quadratic Form** - A mathematical structure used in the CanvasL Frontmatter Knowledge Model. It represents dimensional progression through binary quadratic forms with bipartite partitions (topology and system).

### Browser Environment

A JavaScript runtime environment provided by web browsers. The Meta-Log Database package provides browser-specific implementations that use browser APIs like `fetch`, `IndexedDB`, and `window`.

### Browser Bundle

A compiled JavaScript bundle optimized for browser environments. The Meta-Log Database package provides browser bundles in ES module and UMD formats.

## C

### Canvas

A data structure representing a collection of nodes and edges, typically loaded from JSONL or CanvasL files. Canvases contain structured data that can be queried using ProLog, DataLog, or SPARQL.

### CanvasL

A file format extension of JSONL that includes directives and metadata. CanvasL files support frontmatter, versioning, and schema validation.

### CanvasL Object

A structured object in CanvasL format that can be executed by the CanvasL Metaverse Browser. Supported types include `rdf-triple`, `r5rs-call`, `sparql-construct`, `prolog-query`, `datalog-query`, `shacl-validate`, and `slide`.

### CanvasL Metaverse Browser

A unified browser API (`CanvasLMetaverseBrowser`) that provides a complete interface for loading, parsing, querying, and executing CanvasL files in browser environments.

## D

### DataLog

A declarative logic programming language that uses bottom-up evaluation. The Meta-Log Database package includes a DataLog engine that computes fixed-points of rules and facts.

### DataLog Engine

The component of Meta-Log Database that executes DataLog queries. It implements bottom-up evaluation, fact extraction, and program evaluation.

### Dimension

In the context of Bipartite-BQF, a dimensional level from 0D to 7D. Each dimension represents a level of structural complexity and has associated binary quadratic forms.

## E

### ES Modules

ECMAScript modules, the standard module system for JavaScript. The Meta-Log Database package uses ES modules (`"type": "module"`).

### Export

A JavaScript module export that makes functionality available to other modules. The Meta-Log Database package exports classes, interfaces, and types.

## F

### Fact

A basic unit of information in ProLog and DataLog. Facts are represented as tuples with a predicate and arguments, e.g., `(node "id1" "type1")`.

### Fact Extraction

The process of extracting facts from loaded canvas data. Facts are extracted according to the structure of nodes and edges in the canvas.

### Frontmatter

Metadata stored at the beginning of a document, typically in YAML format. The CanvasL Frontmatter Knowledge Model extends Obsidian frontmatter with Bipartite-BQF metadata.

## I

### IndexedDB

A browser API for client-side storage of large amounts of structured data. The Meta-Log Database browser implementation uses IndexedDB for persistent storage and caching.

### Initialization

The process of setting up the database instance, engines, and storage. Browser implementations require explicit initialization via the `init()` method.

## J

### JSONL (JSON Lines)

A file format where each line is a valid JSON object. CanvasL files use JSONL as their base format, with additional directives and metadata.

### JSONL Parser

The component that parses JSONL and CanvasL files, extracting canvas structures and facts.

## M

### Meta-Log

A system that combines multiple logic programming paradigms (ProLog, DataLog) with functional programming (R5RS) and semantic web technologies (RDF, SPARQL, SHACL).

### Meta-Log Database

The npm package (`meta-log-db`) that provides core database functionality for Meta-Log, including ProLog, DataLog, R5RS, RDF/SPARQL, and SHACL support.

## N

### Node.js Environment

A JavaScript runtime environment built on Chrome's V8 engine. The Meta-Log Database package provides Node.js-specific implementations that use Node.js file system APIs.

## P

### Partition

In Bipartite-BQF, a partition represents either the "topology" (mathematical structure) or "system" (computational implementation) side of a bipartite structure.

### ProLog

A logic programming language based on formal logic. The Meta-Log Database package includes a ProLog engine that implements unification and SLD resolution.

### ProLog Engine

The component of Meta-Log Database that executes ProLog queries. It implements unification, resolution, backtracking, and fact management.

## Q

### Query

A request for information from the database. The Meta-Log Database package supports ProLog queries, DataLog queries, and SPARQL queries.

### Query Result

The result of executing a query. Results include bindings (variable assignments) and metadata about the query execution.

## R

### R5RS

The Revised^5 Report on the Algorithmic Language Scheme, a functional programming language specification. The Meta-Log Database package includes R5RS function execution capabilities.

### R5RS Registry

A registry that stores and executes R5RS functions. Functions are loaded from Scheme files and can be called by name with arguments.

### RDF (Resource Description Framework)

A standard model for data interchange on the web. The Meta-Log Database package includes RDF triple storage and SPARQL query capabilities.

### Resolution

In ProLog, the process of finding solutions to queries by applying rules and facts. SLD (Selective Linear Definite) resolution is the standard resolution strategy.

## S

### SHACL (Shapes Constraint Language)

A language for validating RDF data against shapes. The Meta-Log Database package includes SHACL validation capabilities.

### SPARQL

SPARQL Protocol and RDF Query Language, a query language for RDF data. The Meta-Log Database package includes SPARQL query execution.

### SPARQL Engine

The component that executes SPARQL queries against RDF triple stores. It supports SELECT, CONSTRUCT, ASK, and DESCRIBE queries.

## T

### Triple

In RDF, a statement consisting of a subject, predicate, and object. Triples are stored in triple stores and queried using SPARQL.

### Triple Store

A database for storing RDF triples. The Meta-Log Database package includes a triple store implementation.

### Type Definition

TypeScript type definitions that describe the structure of data and interfaces. The Meta-Log Database package includes comprehensive type definitions.

## U

### Unification

In ProLog, the process of finding variable bindings that make two terms identical. Unification is fundamental to ProLog query execution.

### UMD (Universal Module Definition)

A module format that works in multiple environments (AMD, CommonJS, global variables). The Meta-Log Database package MAY provide UMD bundles for browser compatibility.

## V

### Validation

The process of checking data against rules or schemas. The Meta-Log Database package supports SHACL validation for RDF data and frontmatter validation for CanvasL documents.

---

## Related Documentation

- [Meta-Log Database RFC2119 Specification](./META-LOG-DB-RFC2119.md)
- [CanvasL Metaverse Browser API Reference](../03-Guides/CANVASL_METAVERSE_BROWSER_API.md)
- [Migration Guide](../03-Guides/MIGRATION_GUIDE.md)
- [Real-World Examples](../04-Examples/EXAMPLES.md)

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-17

