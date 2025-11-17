---
id: dag-extension-guide
title: "DAG Extension Guide"
level: intermediate
type: guide
tags: [dag, graph, lca, ancestors, descendants, extension, v1.2.0]
keywords: [dag, directed-acyclic-graph, lca, lowest-common-ancestor, ancestors, descendants]
prerequisites: [meta-log-db-readme]
enables: [dag-examples]
related: [dag-examples, metalog-node-extension]
readingTime: 15
difficulty: 3
version: "1.2.0"
---

# DAG Extension Guide

The DAG Extension provides Directed Acyclic Graph operations for MetaLogNode structures.

## Overview

The DAG Extension enables graph operations on atemporal DAG structures, including finding lowest common ancestors, querying ancestors/descendants, and cycle detection.

## Features

- **LCA Finding** - Find lowest common ancestor of two nodes
- **Ancestor Queries** - Get all ancestors of a node
- **Descendant Queries** - Get all descendants of a node
- **Children Queries** - Get direct children of a node
- **Depth Calculation** - Calculate node depth from root
- **Cycle Detection** - Detect cycles in DAG structure

## Installation

The DAG Extension is included in `meta-log-db` v1.2.0. Enable it via configuration:

```typescript
import { DAGManager } from 'meta-log-db/extensions/dag';

const manager = new DAGManager(dag);
```

## DAG Structure

```typescript
interface DAG {
  nodes: Map<CID, MetaLogNode>;
  edges: Map<CID, CID[]>;  // child → parents (reverse of parent references)
  roots: Set<CID>;  // Genesis nodes (parent === 'genesis')
  heads: Set<CID>;  // Latest nodes (no children)
}
```

## Basic Usage

### Creating a DAG Manager

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
```

### Adding Nodes

```typescript
const node: MetaLogNode = {
  parent: 'genesis',
  cid: 'cid1',
  // ... other fields
};

manager.addNode(node);
```

### Finding Lowest Common Ancestor

```typescript
const lca = manager.findLCA('cid1', 'cid2');

if (lca) {
  console.log(`LCA: ${lca}`);
} else {
  console.log('No common ancestor (different roots)');
}
```

### Getting Ancestors

```typescript
const ancestors = manager.getAncestors('cid1');
console.log(`Ancestors: ${ancestors.join(', ')}`);
// Returns: ['parent1', 'parent2', ..., 'genesis']
```

### Getting Children

```typescript
const children = manager.getChildren('cid1');
console.log(`Children: ${children.join(', ')}`);
```

### Getting Descendants

```typescript
const descendants = manager.getDescendants('cid1');
console.log(`Descendants: ${descendants.join(', ')}`);
```

### Calculating Depth

```typescript
const depth = manager.getDepth('cid1');
console.log(`Depth: ${depth}`);  // 0 for root nodes
```

### Cycle Detection

```typescript
const hasCycles = manager.hasCycles();

if (hasCycles) {
  console.error('DAG contains cycles!');
} else {
  console.log('DAG is valid (no cycles)');
}
```

## R5RS Functions

The extension provides R5RS functions for DAG operations:

```typescript
// Find LCA
const lca = await db.executeR5RS('r5rs:find-lca', [dag, 'cid1', 'cid2']);

// Get children
const children = await db.executeR5RS('r5rs:get-children', [dag, 'cid1']);

// Get ancestors
const ancestors = await db.executeR5RS('r5rs:get-ancestors', [dag, 'cid1']);
```

## Algorithm Details

### LCA Algorithm

The LCA algorithm finds the first common ancestor by:

1. Collecting all ancestors of `cid1`
2. Collecting all ancestors of `cid2`
3. Finding the first common ancestor (closest to both nodes)

### Ancestor Collection

Ancestors are collected by following parent references:

```typescript
getAncestors(cid: CID): CID[] {
  const ancestors: CID[] = [];
  let current: CID | undefined = cid;
  
  while (current) {
    const node = this.dag.nodes.get(current);
    if (!node || node.parent === 'genesis') break;
    
    ancestors.push(node.parent);
    current = node.parent;
  }
  
  return ancestors;
}
```

### Cycle Detection

Cycles are detected using DFS with recursion stack:

```typescript
hasCycles(): boolean {
  const visited = new Set<CID>();
  const recStack = new Set<CID>();
  
  const hasCycle = (cid: CID): boolean => {
    if (recStack.has(cid)) return true;  // Cycle detected
    if (visited.has(cid)) return false;
    
    visited.add(cid);
    recStack.add(cid);
    
    const node = this.dag.nodes.get(cid);
    if (node && node.parent !== 'genesis') {
      if (hasCycle(node.parent)) return true;
    }
    
    recStack.delete(cid);
    return false;
  };
  
  for (const cid of this.dag.nodes.keys()) {
    if (!visited.has(cid) && hasCycle(cid)) {
      return true;
    }
  }
  
  return false;
}
```

## Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableDAG: true
});

await browser.init();

// Use via R5RS functions
const lca = await browser.executeR5RS('r5rs:find-lca', [dag, 'cid1', 'cid2']);
```

## Examples

See [DAG Examples](../04-Examples/DAG_EXAMPLES.md) for complete working examples.

## Related Documentation

- [MetaLogNode Extension](./METALOG_NODE_EXTENSION.md) - Atemporal DAG nodes
- [Homology Extension](./HOMOLOGY_EXTENSION.md) - Chain complex validation
- [RFC2119 Specification](../01-Specification/META-LOG-DB-RFC2119.md)

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

