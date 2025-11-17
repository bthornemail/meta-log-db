---
id: dag-examples
title: "DAG Examples"
level: intermediate
type: examples
tags: [dag, examples, v1.2.0]
keywords: [dag, examples, lca, ancestors, descendants]
prerequisites: [dag-extension-guide]
enables: []
related: [dag-extension-guide]
readingTime: 15
difficulty: 3
version: "1.2.0"
---

# DAG Examples

Complete working examples for the DAG Extension.

## Example 1: Creating a DAG

```typescript
import { DAGManager } from 'meta-log-db/extensions/dag';
import { MetaLogNode } from 'meta-log-db/extensions/metalog-node';

const dag: DAG = {
  nodes: new Map(),
  edges: new Map(),
  roots: new Set(),
  heads: new Set()
};

const manager = new DAGManager(dag);

// Genesis node
const genesis: MetaLogNode = {
  parent: 'genesis',
  cid: 'genesis',
  auth: '',
  path: "m/44'/60'/0'/0/0",
  sig: '',
  uri: 'canvasl://genesis',
  topo: { type: 'Topology', objects: {}, arcs: [] },
  geo: { type: 'FeatureCollection', features: [] }
};

manager.addNode(genesis);

// Child nodes
const child1: MetaLogNode = {
  parent: 'genesis',
  cid: 'cid1',
  auth: '',
  path: "m/44'/60'/0'/0/1",
  sig: '',
  uri: 'canvasl://cid1',
  topo: { type: 'Topology', objects: {}, arcs: [] },
  geo: { type: 'FeatureCollection', features: [] }
};

const child2: MetaLogNode = {
  parent: 'genesis',
  cid: 'cid2',
  auth: '',
  path: "m/44'/60'/0'/0/2",
  sig: '',
  uri: 'canvasl://cid2',
  topo: { type: 'Topology', objects: {}, arcs: [] },
  geo: { type: 'FeatureCollection', features: [] }
};

manager.addNode(child1);
manager.addNode(child2);
```

## Example 2: Finding LCA

```typescript
const lca = manager.findLCA('cid1', 'cid2');
console.log(`LCA: ${lca}`);  // 'genesis'
```

## Example 3: Getting Ancestors

```typescript
const ancestors = manager.getAncestors('cid1');
console.log(`Ancestors: ${ancestors.join(', ')}`);
// Output: ['genesis']
```

## Example 4: Getting Children

```typescript
const children = manager.getChildren('genesis');
console.log(`Children: ${children.join(', ')}`);
// Output: ['cid1', 'cid2']
```

## Example 5: Getting Descendants

```typescript
const descendants = manager.getDescendants('genesis');
console.log(`Descendants: ${descendants.join(', ')}`);
// Output: ['cid1', 'cid2']
```

## Example 6: Calculating Depth

```typescript
const depth0 = manager.getDepth('genesis');  // 0
const depth1 = manager.getDepth('cid1');     // 1

console.log(`Genesis depth: ${depth0}`);
console.log(`Child depth: ${depth1}`);
```

## Example 7: Cycle Detection

```typescript
const hasCycles = manager.hasCycles();

if (hasCycles) {
  console.error('DAG contains cycles!');
} else {
  console.log('DAG is valid (no cycles)');
}
```

## Example 8: R5RS Functions

```typescript
// Find LCA
const lca = await db.executeR5RS('r5rs:find-lca', [dag, 'cid1', 'cid2']);

// Get children
const children = await db.executeR5RS('r5rs:get-children', [dag, 'genesis']);

// Get ancestors
const ancestors = await db.executeR5RS('r5rs:get-ancestors', [dag, 'cid1']);
```

## Example 9: Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableDAG: true
});

await browser.init();

const lca = await browser.executeR5RS('r5rs:find-lca', [dag, 'cid1', 'cid2']);
```

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

