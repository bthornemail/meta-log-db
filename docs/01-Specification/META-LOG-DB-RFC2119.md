---
id: meta-log-db-rfc2119-specification
title: "Meta-Log Database Package Specification (RFC 2119)"
level: foundational
type: specification
tags: [meta-log-db, rfc2119, specification, api, prolog, datalog, r5rs, sparql, shacl]
keywords: [meta-log-db, package-specification, api-contract, prolog-engine, datalog-engine, r5rs-integration, sparql-support, shacl-validation, browser-api, node-api]
prerequisites: []
enables: [meta-log-db-implementation, meta-log-db-integration]
related: [canvasl-metaverse-browser-api, migration-guide, examples]
readingTime: 90
difficulty: 4
version: "1.0.0"
gitTag: "v1.0.0"
immutableTag: "v1.0.0-immutable"
versionDirectory: "versions/v1.0.0/"
blackboard:
  status: active
  assignedAgent: "meta-log-db-specification-agent"
  lastUpdate: "2025-01-17"
  dependencies: []
  watchers: []
---

# Meta-Log Database Package Specification (RFC 2119)

**Status**: Draft  
**Version**: 1.0.0  
**Date**: 2025-01-17  
**Authors**: Meta-Log Database Team

## Abstract

This specification defines the requirements, interfaces, and behavior for the Meta-Log Database package (`meta-log-db`), a native npm package providing core database functionality for ProLog, DataLog, and R5RS integration. This specification uses RFC 2119 keywords to define MUST, SHOULD, and MAY requirements.

## Table of Contents

1. [Introduction](#1-introduction)
2. [Package Structure](#2-package-structure)
3. [API Contracts](#3-api-contracts)
4. [Node.js Environment Requirements](#4-nodejs-environment-requirements)
5. [Browser Environment Requirements](#5-browser-environment-requirements)
6. [Query Engine Requirements](#6-query-engine-requirements)
7. [CanvasL Object Execution](#7-canvasl-object-execution)
8. [Error Handling](#8-error-handling)
9. [Type Definitions](#9-type-definitions)
10. [References](#10-references)

---

## 1. Introduction

### 1.1 Purpose

This specification defines the requirements for the Meta-Log Database package, including:

- Package structure and exports
- API contracts and interfaces
- Browser vs Node.js behavior requirements
- CanvasL object execution requirements
- Query engine requirements (ProLog, DataLog, SPARQL)
- R5RS integration requirements
- SHACL validation requirements
- Error handling requirements

### 1.2 Scope

This specification covers:

- Package exports and module structure
- Core API interfaces and methods
- Browser and Node.js environment differences
- Query engine implementations
- CanvasL object execution protocol
- Error handling and validation

### 1.3 RFC 2119 Keywords

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### 1.4 Related Documentation

- [CanvasL Metaverse Browser API Reference](../03-Guides/CANVASL_METAVERSE_BROWSER_API.md)
- [Migration Guide](../03-Guides/MIGRATION_GUIDE.md)
- [Real-World Examples](../04-Examples/EXAMPLES.md)
- [Glossary](./GLOSSARY.md)

---

## 2. Package Structure

### 2.1 Package Name

The package MUST be published under the name `meta-log-db`.

### 2.2 Package Exports

The package MUST provide the following exports:

#### 2.2.1 Main Export

- **Node.js**: `./dist/index.js` MUST be the main entry point for Node.js environments
- **Browser**: `./dist/browser/index.js` MUST be the main entry point for browser environments
- **Types**: `./dist/index.d.ts` MUST provide TypeScript type definitions

#### 2.2.2 Browser Export

- **Browser-specific**: `./browser` export MUST provide browser-specific functionality
- **UMD Bundle**: `./dist/browser/index.umd.js` MAY be provided for UMD module systems

#### 2.2.3 Package.json Export

- **Package Metadata**: `./package.json` MUST be accessible via the `./package.json` export

### 2.3 Exported Classes and Interfaces

The package MUST export the following:

#### 2.3.1 Core Classes (Node.js)

- `MetaLogDb` - Main database class for Node.js
- `PrologEngine` - ProLog query engine
- `DatalogEngine` - DataLog query engine
- `R5RSRegistry` - R5RS function registry
- `JsonlParser` - JSONL/CanvasL parser
- `TripleStore` - RDF triple store
- `ShaclValidator` - SHACL validator

#### 2.3.2 Browser Classes

- `MetaLogDbBrowser` - Browser-native database class
- `CanvasLMetaverseBrowser` - Unified browser API
- `BrowserFileIO` - Browser file I/O utilities
- `IndexedDBStorage` - IndexedDB storage implementation

#### 2.3.3 Configuration Interfaces

- `MetaLogDbConfig` - Configuration for Node.js database
- `BrowserConfig` - Configuration for browser database
- `CanvasLBrowserConfig` - Configuration for CanvasL browser

#### 2.3.4 Type Exports

- All types from `./types/index.js` MUST be exported
- Validation utilities from `./validation/frontmatter-validator.js` MUST be exported

---

## 3. API Contracts

### 3.1 MetaLogDb (Node.js)

#### 3.1.1 Constructor

```typescript
constructor(config?: MetaLogDbConfig)
```

- The constructor MUST accept an optional `MetaLogDbConfig` parameter
- Default values MUST be applied if configuration is not provided:
  - `enableProlog: true`
  - `enableDatalog: true`
  - `enableRdf: true`
  - `enableShacl: true`

#### 3.1.2 Core Methods

**`loadCanvas(path: string): Promise<void>`**

- MUST load and parse a canvas file (JSONL or CanvasL format)
- MUST extract facts from the loaded canvas
- MUST add facts to enabled engines (ProLog, DataLog, RDF)
- MUST throw an error if the file cannot be loaded or parsed

**`prologQuery(query: string): Promise<PrologQueryResult>`**

- MUST execute a ProLog query if ProLog engine is enabled
- MUST return a `PrologQueryResult` with bindings
- MUST throw an error if ProLog engine is not enabled
- MUST throw an error if query syntax is invalid

**`datalogQuery(query: string, program?: any): Promise<DatalogQueryResult>`**

- MUST execute a DataLog query if DataLog engine is enabled
- MAY accept an optional DataLog program
- MUST return a `DatalogQueryResult` with bindings
- MUST throw an error if DataLog engine is not enabled

**`sparqlQuery(query: string): Promise<SparqlQueryResult>`**

- MUST execute a SPARQL query if RDF engine is enabled
- MUST return a `SparqlQueryResult` with bindings
- MUST throw an error if RDF engine is not enabled
- MUST throw an error if query syntax is invalid

**`validateShacl(triples?: any[]): Promise<ShaclValidationReport>`**

- MUST validate RDF triples against SHACL shapes if SHACL validator is enabled
- MAY accept optional triples (uses loaded triples if not provided)
- MUST return a `ShaclValidationReport`
- MUST throw an error if SHACL validator is not enabled

**`extractFacts(): Fact[]`**

- MUST return all facts extracted from loaded canvas
- MUST return an empty array if no canvas has been loaded

### 3.2 CanvasLMetaverseBrowser (Browser)

#### 3.2.1 Constructor

```typescript
constructor(config?: CanvasLBrowserConfig)
```

- The constructor MUST accept an optional `CanvasLBrowserConfig` parameter
- Default values MUST be applied if configuration is not provided

#### 3.2.2 Initialization

**`init(): Promise<void>`**

- MUST initialize the browser database before any operations
- MUST set up IndexedDB, file I/O, and engines
- MUST use lazy initialization with promise-based pattern to prevent race conditions
- MUST be idempotent (multiple calls MUST not cause errors)

#### 3.2.3 Canvas Loading

**`loadCanvas(path: string, url?: string): Promise<void>`**

- MUST load a canvas file from the provided path and URL
- `path` MUST be the file identifier
- `url` MUST be the fetch location (uses path if not provided)
- MUST parse JSONL or CanvasL format
- MUST extract facts and add to enabled engines
- MUST throw an error if initialization has not been called
- MUST throw an error if file cannot be loaded

#### 3.2.4 Query Methods

All query methods (`prologQuery`, `datalogQuery`, `sparqlQuery`) MUST:

- Require initialization before use
- Support the same query syntax as Node.js version
- Return the same result types as Node.js version
- Handle errors consistently

#### 3.2.5 CanvasL Object Execution

**`executeCanvasLObject(object: any): Promise<CanvasLExecutionResult>`**

- MUST execute a CanvasL object based on its type
- MUST support the following object types:
  - `rdf-triple` - Add RDF triple to store
  - `r5rs-call` - Execute R5RS function
  - `sparql-construct` - Execute SPARQL CONSTRUCT query
  - `prolog-query` - Execute ProLog query
  - `datalog-query` - Execute DataLog query
  - `shacl-validate` - Validate with SHACL
  - `slide` - Return slide object as-is
- MUST return a `CanvasLExecutionResult` with type, result, and optional error
- MUST throw an error for unknown object types

**`executeCanvasLObjects(objects: any[]): Promise<CanvasLExecutionResult[]>`**

- MUST execute multiple CanvasL objects in sequence
- MUST return an array of `CanvasLExecutionResult`
- MUST continue execution even if individual objects fail (errors MUST be captured in results)

---

## 4. Node.js Environment Requirements

### 4.1 File System Access

- The Node.js implementation MUST use Node.js file system APIs for file I/O
- File paths MUST be resolved relative to the current working directory
- File reading MUST be asynchronous using `fs/promises`

### 4.2 R5RS Engine Loading

- `loadR5RSEngine(path: string)` MUST load R5RS engine from file system
- The path MUST be a file system path (not a URL)
- Loading MUST be asynchronous

### 4.3 Module System

- The package MUST use ES modules (`"type": "module"` in package.json)
- Exports MUST use `.js` extensions in import statements
- TypeScript source MUST be compiled to JavaScript before publishing

---

## 5. Browser Environment Requirements

### 5.1 Initialization

- Browser implementations MUST require explicit initialization via `init()` method
- Initialization MUST set up IndexedDB, file I/O, and engines
- Initialization MUST be idempotent

### 5.2 File I/O

- Browser implementations MUST use `fetch` API for file loading
- File paths MUST be treated as identifiers
- URLs MUST be provided separately for fetch operations
- File content MUST be cached according to `cacheStrategy` configuration

### 5.3 IndexedDB Storage

- Browser implementations MUST use IndexedDB for persistent storage
- Database name MUST be configurable via `indexedDBName` option
- Storage operations MUST be asynchronous
- Storage MUST support encryption if `enableEncryption` is true

### 5.4 R5RS Engine Loading

- Browser implementations MUST load R5RS engine via URL (`r5rsEngineURL`)
- Loading MUST use `fetch` API
- Engine MUST be cached according to cache strategy

### 5.5 Bundle Requirements

- Browser bundle MUST be self-contained (no Node.js dependencies)
- Bundle MUST work in modern browsers (ES2020+)
- UMD bundle MAY be provided for compatibility

---

## 6. Query Engine Requirements

### 6.1 ProLog Engine

#### 6.1.1 Unification

- The ProLog engine MUST implement unification algorithm
- Unification MUST handle variables, constants, and compound terms
- Variable bindings MUST be tracked and returned in query results

#### 6.1.2 Resolution

- The ProLog engine MUST implement SLD resolution
- Resolution MUST support backtracking
- All solutions MUST be returned in query results

#### 6.1.3 Fact Management

- Facts MUST be addable via `addFacts(facts: Fact[])`
- Facts MUST be queryable via `query(query: string)`
- Fact format MUST match the `Fact` interface

### 6.2 DataLog Engine

#### 6.2.1 Bottom-Up Evaluation

- The DataLog engine MUST implement bottom-up evaluation
- Evaluation MUST compute fixed-point of rules
- Evaluation MUST handle recursive rules correctly

#### 6.2.2 Fact Extraction

- Facts MUST be extractable from loaded canvas
- Fact extraction MUST follow DataLog fact format
- Extracted facts MUST be addable to the engine

#### 6.2.3 Program Management

- DataLog programs MAY be provided with queries
- Programs MUST be evaluated before query execution
- Program rules MUST be applied to compute derived facts

### 6.3 SPARQL Engine

#### 6.3.1 Triple Store

- The SPARQL engine MUST maintain a triple store
- Triples MUST be addable via `addTriples(triples: Triple[])`
- Triple format MUST follow RDF specification

#### 6.3.2 Query Execution

- SPARQL queries MUST be parsed and executed
- Query execution MUST support SELECT, CONSTRUCT, ASK, and DESCRIBE
- Query results MUST follow SPARQL result format
- Query execution MUST handle OPTIONAL, FILTER, and other SPARQL features

### 6.4 R5RS Integration

#### 6.4.1 Function Registry

- R5RS functions MUST be registered in a function registry
- Functions MUST be callable by name with arguments
- Function execution MUST return results or throw errors

#### 6.4.2 Engine Loading

- R5RS engine MUST be loadable from file (Node.js) or URL (browser)
- Engine loading MUST parse Scheme code
- Functions MUST be registered after loading

#### 6.4.3 Function Execution

- Functions MUST be executable via `executeFunction(name: string, args: any[])`
- Function arguments MUST be validated
- Function errors MUST be caught and returned appropriately

### 6.5 SHACL Validation

#### 6.5.1 Shape Validation

- SHACL shapes MUST be parseable from Turtle format
- Validation MUST check triples against shapes
- Validation results MUST include conformant status and violations

#### 6.5.2 Validation Report

- Validation MUST return a `ShaclValidationReport`
- Report MUST include validation results for each shape
- Violations MUST be detailed with property paths and values

---

## 7. CanvasL Object Execution

### 7.1 Supported Object Types

The following CanvasL object types MUST be supported:

- `rdf-triple` - Add RDF triple to store
- `r5rs-call` - Execute R5RS function
- `sparql-construct` - Execute SPARQL CONSTRUCT query
- `prolog-query` - Execute ProLog query
- `datalog-query` - Execute DataLog query
- `shacl-validate` - Validate with SHACL
- `slide` - Return slide object as-is

### 7.2 Object Structure

CanvasL objects MUST have a `type` field indicating the object type. Object-specific fields MUST be validated according to object type.

### 7.3 Execution Semantics

- Objects MUST be executed in the order provided
- Execution MUST be asynchronous
- Errors MUST be captured in results, not thrown
- Execution MUST continue even if individual objects fail

### 7.4 Result Format

Execution results MUST follow the `CanvasLExecutionResult` interface:

```typescript
interface CanvasLExecutionResult {
  type: string;
  result?: any;
  error?: string;
  object?: any;
}
```

---

## 8. Error Handling

### 8.1 Error Types

The package MUST define and use appropriate error types:

- `InitializationError` - For initialization failures
- `FileLoadError` - For file loading failures
- `ParseError` - For parsing failures
- `QueryError` - For query execution failures
- `ValidationError` - For validation failures

### 8.2 Error Messages

- Error messages MUST be descriptive and actionable
- Error messages MUST include context (file path, query, etc.)
- Error messages SHOULD suggest solutions when possible

### 8.3 Error Propagation

- Synchronous methods MUST throw errors
- Asynchronous methods MUST reject promises with errors
- Errors MUST not be silently ignored

### 8.4 Browser Error Handling

- Browser implementations MUST handle network errors gracefully
- IndexedDB errors MUST be caught and reported
- Fetch errors MUST be caught and reported with appropriate context

---

## 9. Type Definitions

### 9.1 Core Types

The following types MUST be exported and defined:

- `Fact` - Fact structure for ProLog/DataLog
- `Canvas` - Canvas structure from JSONL/CanvasL
- `PrologQueryResult` - ProLog query result
- `DatalogQueryResult` - DataLog query result
- `SparqlQueryResult` - SPARQL query result
- `ShaclValidationReport` - SHACL validation report
- `CanvasLExecutionResult` - CanvasL object execution result

### 9.2 Configuration Types

- `MetaLogDbConfig` - Node.js configuration
- `BrowserConfig` - Browser configuration
- `CanvasLBrowserConfig` - CanvasL browser configuration

### 9.3 Frontmatter Types

- `DocumentFrontmatter` - Document frontmatter structure
- `BipartiteMetadata` - Bipartite-BQF metadata
- `BQFObject` - Binary Quadratic Form object
- `PolynomialObject` - Polynomial object

---

## 10. References

- [RFC 2119 - Key words for use in RFCs](https://tools.ietf.org/html/rfc2119)
- [CanvasL Metaverse Browser API Reference](../03-Guides/CANVASL_METAVERSE_BROWSER_API.md)
- [Migration Guide](../03-Guides/MIGRATION_GUIDE.md)
- [Real-World Examples](../04-Examples/EXAMPLES.md)
- [Glossary](./GLOSSARY.md)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [SHACL - Shapes Constraint Language](https://www.w3.org/TR/shacl/)
- [R5RS Scheme Specification](https://schemers.org/Documents/Standards/R5RS/)

---

**Status**: Draft  
**Version**: 1.0.0  
**Last Updated**: 2025-01-17

