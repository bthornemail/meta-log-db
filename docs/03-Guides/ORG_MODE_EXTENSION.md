---
id: org-mode-extension-guide
title: "Org Mode Extension Guide"
level: intermediate
type: guide
tags: [org-mode, parsing, headings, source-blocks, extension, v1.2.0]
keywords: [org-mode, orga, parsing, headings, source-blocks, property-drawers, noweb]
prerequisites: [meta-log-db-readme]
enables: [org-mode-examples]
related: [org-mode-examples]
readingTime: 15
difficulty: 2
version: "1.2.0"
---

# Org Mode Extension Guide

The Org Mode Extension provides Org Mode document parsing using the `orga` package.

## Overview

The Org Mode Extension enables parsing and processing of Org Mode documents, including heading extraction, source block extraction, property drawer extraction, and Noweb reference expansion.

## Features

- **Document Parsing** - Parse Org Mode documents to AST
- **Heading Extraction** - Extract headings with hierarchy
- **Source Block Extraction** - Extract code blocks with metadata
- **Property Drawer Extraction** - Extract property drawers
- **Noweb Expansion** - Expand Noweb references in source blocks

## Installation

The Org Mode Extension is included in `meta-log-db` v1.2.0. Enable it via configuration:

```typescript
const db = new MetaLogDb({
  enableOrgMode: true  // Enable Org Mode extension
});
```

**Note**: The extension requires the `orga` package to be installed:

```bash
npm install orga
```

## Basic Usage

### Parsing Org Mode Documents

```typescript
const orgContent = `
* Heading 1
** Subheading 1.1
Some text here.

#+BEGIN_SRC javascript
console.log('Hello, World!');
#+END_SRC
`;

const ast = await db.executeR5RS('r5rs:parse-org-document', [orgContent]);
console.log(ast);
```

### Extracting Headings

```typescript
const headings = await db.executeR5RS('r5rs:extract-headings', [orgContent]);

headings.forEach(heading => {
  console.log(`${'  '.repeat(heading.level)}${heading.title}`);
  console.log(`  Line: ${heading.line}`);
  console.log(`  Properties: ${JSON.stringify(heading.properties)}`);
});
```

### Extracting Source Blocks

```typescript
const blocks = await db.executeR5RS('r5rs:extract-source-blocks', [orgContent]);

blocks.forEach(block => {
  console.log(`Language: ${block.language}`);
  console.log(`Content: ${block.content}`);
  console.log(`Header Args: ${JSON.stringify(block.headerArgs)}`);
});
```

### Extracting Property Drawers

```typescript
const drawers = await db.executeR5RS('r5rs:extract-property-drawers', [orgContent]);

drawers.forEach(drawer => {
  console.log(`Properties: ${JSON.stringify(drawer.properties)}`);
});
```

### Expanding Noweb References

```typescript
const orgWithNoweb = `
#+NAME: hello
#+BEGIN_SRC javascript
console.log('Hello');
#+END_SRC

#+BEGIN_SRC javascript
<<hello>>
console.log('World');
#+END_SRC
`;

const expanded = await db.executeR5RS('r5rs:expand-noweb', [
  orgWithNoweb,
  namedBlocks  // Map of block names to content
]);
```

## R5RS Functions

The extension provides the following R5RS functions:

### `r5rs:parse-org-document`

Parse Org Mode document to AST:

```typescript
const ast = await db.executeR5RS('r5rs:parse-org-document', [orgContent]);
```

### `r5rs:extract-headings`

Extract headings with hierarchy:

```typescript
const headings = await db.executeR5RS('r5rs:extract-headings', [orgContent]);
// Returns: [{ level: 1, title: 'Heading 1', line: 1, properties: {} }, ...]
```

### `r5rs:extract-source-blocks`

Extract source blocks with metadata:

```typescript
const blocks = await db.executeR5RS('r5rs:extract-source-blocks', [orgContent]);
// Returns: [{ language: 'javascript', content: '...', headerArgs: {}, ... }, ...]
```

### `r5rs:extract-property-drawers`

Extract property drawers:

```typescript
const drawers = await db.executeR5RS('r5rs:extract-property-drawers', [orgContent]);
// Returns: [{ properties: { key: 'value', ... }, ... }, ...]
```

### `r5rs:expand-noweb`

Expand Noweb references:

```typescript
const expanded = await db.executeR5RS('r5rs:expand-noweb', [
  orgContent,
  namedBlocks  // Map<string, string>
]);
```

## Org Mode Structure

### Headings

Org Mode headings use asterisks for hierarchy:

```
* Level 1 Heading
** Level 2 Subheading
*** Level 3 Sub-subheading
```

### Source Blocks

Source blocks are delimited by `#+BEGIN_SRC` and `#+END_SRC`:

```
#+BEGIN_SRC javascript :tangle file.js
console.log('Hello, World!');
#+END_SRC
```

### Property Drawers

Property drawers contain key-value pairs:

```
:PROPERTIES:
:ID: unique-id
:KEY: value
:END:
```

### Noweb References

Noweb references allow code block inclusion:

```
#+NAME: block-name
#+BEGIN_SRC javascript
const x = 1;
#+END_SRC

#+BEGIN_SRC javascript
<<block-name>>
console.log(x);
#+END_SRC
```

## Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableOrgMode: true
});

await browser.init();

const headings = await browser.executeR5RS('r5rs:extract-headings', [orgContent]);
```

## Examples

See [Org Mode Examples](../04-Examples/ORG_MODE_EXAMPLES.md) for complete working examples.

## Related Documentation

- [RFC2119 Specification](../01-Specification/META-LOG-DB-RFC2119.md)
- [orga Package](https://www.npmjs.com/package/orga) - Org Mode parser

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

