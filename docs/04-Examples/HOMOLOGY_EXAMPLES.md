---
id: homology-examples
title: "Homology Examples"
level: intermediate
type: examples
tags: [homology, chain-complex, examples, v1.2.0]
keywords: [homology, examples, chain-complex, betti-numbers]
prerequisites: [homology-extension-guide]
enables: []
related: [homology-extension-guide]
readingTime: 10
difficulty: 3
version: "1.2.0"
---

# Homology Examples

Complete working examples for the Homology Extension.

## Example 1: Simple Chain Complex

```typescript
import { MetaLogDb } from 'meta-log-db';

const db = new MetaLogDb({ enableHomology: true });

const complex: ChainComplex = {
  C0: [
    { id: 'v1', dim: 0, boundary: [], data: { label: 'vertex1' } },
    { id: 'v2', dim: 0, boundary: [], data: { label: 'vertex2' } },
    { id: 'v3', dim: 0, boundary: [], data: { label: 'vertex3' } }
  ],
  C1: [
    { id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: { weight: 1 } },
    { id: 'e2', dim: 1, boundary: ['v2', 'v3'], data: { weight: 1 } }
  ],
  C2: [],
  C3: [],
  C4: [],
  boundary: new Map([
    ['e1', ['v1', 'v2']],
    ['e2', ['v2', 'v3']]
  ])
};

const result = db.validateHomology(complex);
console.log(`Valid: ${result.valid}`);
console.log(`Betti numbers: ${result.betti}`);
// Output: Valid: true, Betti numbers: [1, 0, 0, 0, 0]
```

## Example 2: Computing Betti Numbers

```typescript
const beta0 = db.computeBetti(complex, 0);  // Connected components
const beta1 = db.computeBetti(complex, 1);  // Cycles
const beta2 = db.computeBetti(complex, 2);  // Voids

console.log(`β₀ (components): ${beta0}`);
console.log(`β₁ (cycles): ${beta1}`);
console.log(`β₂ (voids): ${beta2}`);
```

## Example 3: Euler Characteristic

```typescript
const result = db.validateHomology(complex);
console.log(`Euler characteristic: ${result.eulerCharacteristic}`);
// χ = |C₀| - |C₁| + |C₂| - |C₃| + |C₄|
//    = 3 - 2 + 0 - 0 + 0 = 1
```

## Example 4: R5RS Functions

```typescript
// Validate homology
const result = await db.executeR5RS('r5rs:validate-homology', [complex]);

// Compute Betti number
const beta = await db.executeR5RS('r5rs:compute-betti', [complex, 0]);

// Compute Euler characteristic
const chi = await db.executeR5RS('r5rs:compute-euler-characteristic', [complex]);

// Get boundary operator
const boundary = await db.executeR5RS('r5rs:boundary-operator', [complex, 'e1']);
console.log(`Boundary of e1: ${boundary}`);  // ['v1', 'v2']
```

## Example 5: Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableHomology: true
});

await browser.init();

const result = browser.validateHomology(complex);
const beta = browser.computeBetti(complex, 0);
```

## Example 6: Detecting Homology Violations

```typescript
// Invalid complex: boundary² ≠ 0
const invalidComplex: ChainComplex = {
  C0: [{ id: 'v1', dim: 0, boundary: [], data: {} }],
  C1: [{ id: 'e1', dim: 1, boundary: ['v1'], data: {} }],  // Invalid: edge needs 2 vertices
  C2: [],
  C3: [],
  C4: [],
  boundary: new Map([['e1', ['v1']]])  // Invalid boundary
};

const result = db.validateHomology(invalidComplex);
if (!result.valid) {
  console.error('Homology violations:', result.violations);
  // Output: ['e1'] - cell where boundary² ≠ 0
}
```

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

