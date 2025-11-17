---
id: geometry-extension-guide
title: "Geometry Extension Guide"
level: intermediate
type: guide
tags: [geometry, projective, affine, coordinate-transformation, extension, v1.2.0]
keywords: [geometry, projective, affine, coordinates, transformation]
prerequisites: [meta-log-db-readme]
enables: [geometry-examples]
related: [geometry-examples]
readingTime: 10
difficulty: 2
version: "1.2.0"
---

# Geometry Extension Guide

The Geometry Extension provides coordinate system transformations between projective and affine spaces.

## Overview

The Geometry Extension enables conversion between projective and affine coordinate systems, supporting transformations for geometric operations in CanvasL.

## Features

- **Affine to Projective** - Convert affine coordinates to projective coordinates
- **Projective to Affine** - Convert projective coordinates to affine coordinates
- **Coordinate Validation** - Validate coordinate formats

## Installation

The Geometry Extension is included in `meta-log-db` v1.2.0. Enable it via configuration:

```typescript
import { ProjectiveAffineConverter } from 'meta-log-db/extensions/geometry';

const converter = new ProjectiveAffineConverter();
```

## Coordinate Types

### Affine Coordinates

```typescript
interface AffineCoordinates {
  x: number;
  y: number;
}
```

### Projective Coordinates

```typescript
interface ProjectiveCoordinates {
  x: number;
  y: number;
  z: number;
  w: number;  // Homogeneous coordinate
}
```

## Basic Usage

### Affine to Projective

```typescript
import { ProjectiveAffineConverter } from 'meta-log-db/extensions/geometry';

const converter = new ProjectiveAffineConverter();

const affine = { x: 1, y: 2 };
const projective = converter.affineToProjective(affine);

console.log(projective);
// { x: 1, y: 2, z: 0, w: 1 }
```

### Projective to Affine

```typescript
const projective = { x: 1, y: 2, z: 0, w: 1 };
const affine = converter.projectiveToAffine(projective);

console.log(affine);
// { x: 1, y: 2 }
```

## R5RS Functions

The extension provides R5RS functions for geometry operations:

```typescript
// Affine to projective
const projective = await db.executeR5RS('r5rs:affine-to-projective', [
  { x: 1, y: 2 }
]);

// Projective to affine
const affine = await db.executeR5RS('r5rs:projective-to-affine', [
  { x: 1, y: 2, z: 0, w: 1 }
]);
```

## Mathematical Background

### Projective Space

Projective coordinates use homogeneous coordinates where:

- Points are represented as `(x, y, z, w)`
- `w` is the homogeneous coordinate (usually 1)
- Points are equivalent up to scaling: `(x, y, z, w) ≡ (kx, ky, kz, kw)`

### Affine Space

Affine coordinates are Cartesian coordinates:

- Points are represented as `(x, y)`
- Direct mapping to 2D space

### Conversion

**Affine → Projective**:
```
(x, y) → (x, y, 0, 1)
```

**Projective → Affine**:
```
(x, y, z, w) → (x/w, y/w)  (if w ≠ 0)
```

## Browser Usage

```typescript
import { CanvasLMetaverseBrowser } from 'meta-log-db/browser';

const browser = new CanvasLMetaverseBrowser({
  enableProjectiveAffine: true
});

await browser.init();

// Use via R5RS functions
const projective = await browser.executeR5RS('r5rs:affine-to-projective', [
  { x: 1, y: 2 }
]);
```

## Examples

See [Geometry Examples](../04-Examples/GEOMETRY_EXAMPLES.md) for complete working examples.

## Related Documentation

- [RFC2119 Specification](../01-Specification/META-LOG-DB-RFC2119.md)

---

**Last Updated**: 2025-01-17  
**Version**: 1.2.0

