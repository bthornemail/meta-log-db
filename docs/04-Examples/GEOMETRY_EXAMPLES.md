---
id: geometry-examples
title: "Geometry Examples"
level: intermediate
type: examples
tags: [geometry, examples, v1.2.0]
keywords: [geometry, examples, projective, affine]
prerequisites: [geometry-extension-guide]
enables: []
related: [geometry-extension-guide]
readingTime: 5
difficulty: 2
version: "1.2.0"
---

# Geometry Examples

Complete working examples for the Geometry Extension.

## Example 1: Affine to Projective

```typescript
import { ProjectiveAffineConverter } from 'meta-log-db/extensions/geometry';

const converter = new ProjectiveAffineConverter();

const affine = { x: 1, y: 2 };
const projective = converter.affineToProjective(affine);

console.log(projective);
// Output: { x: 1, y: 2, z: 0, w: 1 }
```

## Example 2: Projective to Affine

```typescript
const projective = { x: 2, y: 4, z: 0, w: 2 };
const affine = converter.projectiveToAffine(projective);

console.log(affine);
// Output: { x: 1, y: 2 }  // (2/2, 4/2)
```

## Example 3: R5RS Functions

```typescript
// Affine to projective
const projective = await db.executeR5RS('r5rs:affine-to-projective', [
  { x: 1, y: 2 }
]);
// Returns: { x: 1, y: 2, z: 0, w: 1 }

// Projective to affine
const affine = await db.executeR5RS('r5rs:projective-to-affine', [
  { x: 1, y: 2, z: 0, w: 1 }
]);
// Returns: { x: 1, y: 2 }
```

## Example 4: Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableProjectiveAffine: true
});

await browser.init();

const projective = await browser.executeR5RS('r5rs:affine-to-projective', [
  { x: 1, y: 2 }
]);
```

## Example 5: Batch Conversion

```typescript
const affinePoints = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 }
];

const projectivePoints = affinePoints.map(point =>
  converter.affineToProjective(point)
);

console.log(projectivePoints);
// Output: [
//   { x: 0, y: 0, z: 0, w: 1 },
//   { x: 1, y: 0, z: 0, w: 1 },
//   { x: 0, y: 1, z: 0, w: 1 },
//   { x: 1, y: 1, z: 0, w: 1 }
// ]
```

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

