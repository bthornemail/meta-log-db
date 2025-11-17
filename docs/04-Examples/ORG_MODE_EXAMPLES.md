---
id: org-mode-examples
title: "Org Mode Examples"
level: intermediate
type: examples
tags: [org-mode, examples, v1.2.0]
keywords: [org-mode, examples, parsing, headings, source-blocks]
prerequisites: [org-mode-extension-guide]
enables: []
related: [org-mode-extension-guide]
readingTime: 15
difficulty: 2
version: "1.2.0"
---

# Org Mode Examples

Complete working examples for the Org Mode Extension.

## Example 1: Parsing Org Mode Document

```typescript
import { MetaLogDb } from 'meta-log-db';

const db = new MetaLogDb({ enableOrgMode: true });

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

## Example 2: Extracting Headings

```typescript
const headings = await db.executeR5RS('r5rs:extract-headings', [orgContent]);

headings.forEach(heading => {
  console.log(`${'  '.repeat(heading.level)}${heading.title}`);
  console.log(`  Line: ${heading.line}`);
  console.log(`  Properties: ${JSON.stringify(heading.properties)}`);
});

// Output:
// Heading 1
//   Line: 1
//   Properties: {}
//   Subheading 1.1
//     Line: 2
//     Properties: {}
```

## Example 3: Extracting Source Blocks

```typescript
const blocks = await db.executeR5RS('r5rs:extract-source-blocks', [orgContent]);

blocks.forEach(block => {
  console.log(`Language: ${block.language}`);
  console.log(`Content: ${block.content}`);
  console.log(`Header Args: ${JSON.stringify(block.headerArgs)}`);
});

// Output:
// Language: javascript
// Content: console.log('Hello, World!');
// Header Args: {}
```

## Example 4: Extracting Property Drawers

```typescript
const orgWithProperties = `
* Task
:PROPERTIES:
:ID: task-1
:STATUS: TODO
:END:
`;

const drawers = await db.executeR5RS('r5rs:extract-property-drawers', [orgWithProperties]);

drawers.forEach(drawer => {
  console.log(`Properties: ${JSON.stringify(drawer.properties)}`);
});

// Output:
// Properties: { ID: 'task-1', STATUS: 'TODO' }
```

## Example 5: Expanding Noweb References

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

const namedBlocks = new Map([
  ['hello', "console.log('Hello');"]
]);

const expanded = await db.executeR5RS('r5rs:expand-noweb', [
  orgWithNoweb,
  namedBlocks
]);

console.log(expanded);
// Output: Includes expanded Noweb references
```

## Example 6: Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableOrgMode: true
});

await browser.init();

const headings = await browser.executeR5RS('r5rs:extract-headings', [orgContent]);
```

## Example 7: Processing Org Mode File

```typescript
const fs = require('fs');

const orgContent = fs.readFileSync('document.org', 'utf-8');

// Parse document
const ast = await db.executeR5RS('r5rs:parse-org-document', [orgContent]);

// Extract headings
const headings = await db.executeR5RS('r5rs:extract-headings', [orgContent]);

// Extract source blocks
const blocks = await db.executeR5RS('r5rs:extract-source-blocks', [orgContent]);

// Process each block
blocks.forEach(block => {
  if (block.language === 'javascript') {
    // Process JavaScript block
    console.log(`JS Block: ${block.content}`);
  }
});
```

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

