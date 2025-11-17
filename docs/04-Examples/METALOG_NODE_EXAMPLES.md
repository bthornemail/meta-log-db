---
id: metalog-node-examples
title: "MetaLogNode Examples"
level: intermediate
type: examples
tags: [metalog-node, examples, v1.2.0]
keywords: [metalog-node, examples, cid, signature]
prerequisites: [metalog-node-extension-guide]
enables: []
related: [metalog-node-extension-guide]
readingTime: 15
difficulty: 4
version: "1.2.0"
---

# MetaLogNode Examples

Complete working examples for the MetaLogNode Extension.

## Example 1: Creating a Node

```typescript
import { MetaLogNodeManager } from 'meta-log-db/extensions/metalog-node';

const manager = new MetaLogNodeManager();

const node = await manager.createNode({
  content: {
    topo: {
      type: 'Topology',
      objects: {
        collection: {
          type: 'FeatureCollection',
          features: []
        }
      },
      arcs: []
    },
    geo: {
      type: 'FeatureCollection',
      features: []
    }
  },
  parent: 'genesis',
  path: "m/44'/60'/0'/0/0"
});

console.log(`Node CID: ${node.cid}`);
console.log(`Node URI: ${node.uri}`);
```

## Example 2: Computing CID

```typescript
const content = {
  topo: {
    type: 'Topology',
    objects: {},
    arcs: []
  },
  geo: {
    type: 'FeatureCollection',
    features: []
  }
};

const cid1 = await manager.computeCID(content);
const cid2 = await manager.computeCID(content);

console.log(`CID 1: ${cid1}`);
console.log(`CID 2: ${cid2}`);
console.log(`Deterministic: ${cid1 === cid2}`);  // true
```

## Example 3: Verifying a Node

```typescript
const node = await manager.createNode({
  content: { topo: { type: 'Topology', objects: {}, arcs: [] }, geo: { type: 'FeatureCollection', features: [] } },
  parent: 'genesis',
  path: "m/44'/60'/0'/0/0"
});

const publicKey = '0x...';  // Get from wallet
const isValid = await manager.verifyNode(node, publicKey);

if (isValid) {
  console.log('Node signature is valid');
} else {
  console.error('Node signature verification failed');
}
```

## Example 4: R5RS Functions

```typescript
// Create MetaLogNode
const node = await db.executeR5RS('r5rs:create-metalog-node', [
  {
    topo: { type: 'Topology', objects: {}, arcs: [] },
    geo: { type: 'FeatureCollection', features: [] }
  },
  'genesis',
  "m/44'/60'/0'/0/0"
]);

// Verify MetaLogNode
const isValid = await db.executeR5RS('r5rs:verify-metalog-node', [
  node,
  publicKey
]);

// Compute CID
const cid = await db.executeR5RS('r5rs:compute-cid', [content]);
```

## Example 5: Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableMetaLogNode: true
});

await browser.init();

const manager = new MetaLogNodeManager();
const node = await manager.createNode({
  content: {
    topo: { type: 'Topology', objects: {}, arcs: [] },
    geo: { type: 'FeatureCollection', features: [] }
  },
  parent: 'genesis'
});
```

## Example 6: Creating a Chain of Nodes

```typescript
// Genesis node
const genesis = await manager.createNode({
  content: {
    topo: { type: 'Topology', objects: {}, arcs: [] },
    geo: { type: 'FeatureCollection', features: [] }
  },
  parent: 'genesis',
  path: "m/44'/60'/0'/0/0"
});

// Child node
const child = await manager.createNode({
  content: {
    topo: { type: 'Topology', objects: {}, arcs: [] },
    geo: { type: 'FeatureCollection', features: [] }
  },
  parent: genesis.cid,  // Reference parent
  path: "m/44'/60'/0'/0/1"
});

console.log(`Genesis CID: ${genesis.cid}`);
console.log(`Child CID: ${child.cid}`);
console.log(`Child parent: ${child.parent}`);  // genesis.cid
```

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

