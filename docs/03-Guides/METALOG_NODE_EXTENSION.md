---
id: metalog-node-extension-guide
title: "MetaLogNode Extension Guide"
level: intermediate
type: guide
tags: [metalog-node, dag, cryptographic-identity, extension, v1.2.0]
keywords: [metalog-node, cid, webauthn, bip32, signature, dag]
prerequisites: [meta-log-db-readme]
enables: [metalog-node-examples]
related: [metalog-node-examples, dag-extension, homology-extension]
readingTime: 20
difficulty: 4
version: "1.2.0"
---

# MetaLogNode Extension Guide

The MetaLogNode Extension provides atemporal DAG node structure with cryptographic identity for self-sovereign data structures.

## Overview

MetaLogNode is the core primitive for atemporal DAG (Directed Acyclic Graph) nodes. Every file is a node in a global hypergraph, where:

- **Every node is signed** and content-addressed
- **Time is observer-dependent** with causality via DAG parents
- **Cryptographic identity** via WebAuthn + BIP-32 + signatures

## Features

- **CID Computation** - Content-addressed identifiers from node content
- **Node Signing** - ECDSA signatures for node authentication
- **BIP-32 Derivation** - Hierarchical deterministic key paths
- **Node Verification** - Verify node signatures and integrity
- **Atemporal DAG** - Causality via parent CIDs (no timestamps)

## Installation

The MetaLogNode Extension is included in `meta-log-db` v1.2.0. Enable it via configuration:

```typescript
import { MetaLogNodeManager } from 'meta-log-db/extensions/metalog-node';

const manager = new MetaLogNodeManager();
```

## MetaLogNode Structure

```typescript
interface MetaLogNode {
  // Causality (atemporal DAG)
  parent: CID;  // Parent CID (or "genesis")
  cid: CID;     // This node's content hash
  
  // Identity
  auth: string;      // WebAuthn credential ID
  path: BIP32Path;   // Hierarchical deterministic path (e.g., "m/44'/60'/0'/0/42")
  sig: Signature;    // Sign(privateKey, cid)
  
  // Addressing
  uri: string;  // canvasl://{address}/{path}
  
  // Content
  topo: TopoJSON;  // Topological structure
  geo: GeoJSONPatch;    // Geometric patch
  
  // Optional metadata (not signed)
  meta?: {
    size: number;
    mimeType: string;
  };
}

type CID = string;  // Content ID (SHA-256 hash)
type Signature = string;  // ECDSA signature
type BIP32Path = string;  // e.g., "m/44'/60'/0'/0/42"
```

## Basic Usage

### Creating a Node

```typescript
import { MetaLogNodeManager } from 'meta-log-db/extensions/metalog-node';

const manager = new MetaLogNodeManager();

const node = await manager.createNode({
  content: {
    topo: {
      type: 'Topology',
      objects: {},
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

### Computing CID

```typescript
const content = {
  topo: { type: 'Topology', objects: {}, arcs: [] },
  geo: { type: 'FeatureCollection', features: [] }
};

const cid = await manager.computeCID(content);
console.log(`CID: ${cid}`);  // Deterministic hash
```

### Verifying a Node

```typescript
const isValid = await manager.verifyNode(node, publicKey);

if (isValid) {
  console.log('Node signature is valid');
} else {
  console.error('Node signature verification failed');
}
```

## R5RS Functions

The extension provides R5RS functions for MetaLogNode operations:

```typescript
// Create MetaLogNode
const node = await db.executeR5RS('r5rs:create-metalog-node', [
  content,
  'genesis',  // parent
  "m/44'/60'/0'/0/0"  // BIP32 path
]);

// Verify MetaLogNode
const isValid = await db.executeR5RS('r5rs:verify-metalog-node', [
  node,
  publicKey
]);

// Compute CID
const cid = await db.executeR5RS('r5rs:compute-cid', [content]);
```

## Cryptographic Identity

### WebAuthn Integration

MetaLogNode uses WebAuthn for biometric authentication:

```typescript
// Register WebAuthn credential
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    rp: { name: "CANVASL", id: window.location.hostname },
    user: {
      id: crypto.getRandomValues(new Uint8Array(16)),
      name: "user",
      displayName: "CANVASL User"
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },  // ES256
      { type: "public-key", alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});

// Store credential ID in node.auth
node.auth = credential.id;
```

### BIP-32 Derivation

MetaLogNode uses BIP-32 for hierarchical deterministic key derivation:

```typescript
import { HDNodeWallet, Mnemonic } from 'ethers';

// Generate mnemonic
const mnemonic = Mnemonic.fromEntropy(
  crypto.getRandomValues(new Uint8Array(16))
);

// Derive wallet (BIP-44: m/44'/60'/0'/0)
const wallet = HDNodeWallet.fromMnemonic(
  mnemonic,
  "m/44'/60'/0'/0"
);

// Derive child for specific file
function deriveChild(index: number): HDNodeWallet {
  return wallet.deriveChild(index);
}

// Use in node.path
node.path = `m/44'/60'/0'/0/${index}`;
```

### Signature Scheme

Nodes are signed using ECDSA:

```typescript
async function signNode(
  node: Omit<MetaLogNode, 'sig'>,
  wallet: HDNodeWallet
): Promise<MetaLogNode> {
  const message = JSON.stringify({
    parent: node.parent,
    cid: node.cid,
    uri: node.uri,
    topo: node.topo,
    geo: node.geo
  });
  
  const signature = await wallet.signMessage(message);
  
  return { ...node, sig: signature };
}
```

## Content Addressing

CIDs are computed from canonical JSON:

```typescript
async function computeCID(content: any): Promise<CID> {
  const canonical = JSON.stringify(content, Object.keys(content).sort());
  const buffer = new TextEncoder().encode(canonical);
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  
  // Convert to base58 (or multibase)
  return 'bafybei' + toBase58(new Uint8Array(hash));
}
```

## Atemporal DAG

MetaLogNode uses parent-based causality instead of timestamps:

```typescript
// Genesis node
const genesis: MetaLogNode = {
  parent: 'genesis',
  cid: await computeCID({ type: 'genesis' }),
  // ... other fields
};

// Child node
const child: MetaLogNode = {
  parent: genesis.cid,  // Reference parent, not timestamp
  cid: await computeCID({ type: 'child', parent: genesis.cid }),
  // ... other fields
};
```

## Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableMetaLogNode: true
});

await browser.init();

const manager = new MetaLogNodeManager();
const node = await manager.createNode({ content, parent: 'genesis' });
```

## Examples

See [MetaLogNode Examples](../04-Examples/METALOG_NODE_EXAMPLES.md) for complete working examples.

## Related Documentation

- [DAG Extension](./DAG_EXTENSION.md) - DAG operations (LCA, ancestors, descendants)
- [Homology Extension](./HOMOLOGY_EXTENSION.md) - Chain complex validation
- [RFC2119 Specification](../01-Specification/META-LOG-DB-RFC2119.md)

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

