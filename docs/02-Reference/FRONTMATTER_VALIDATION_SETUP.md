---
id: frontmatter-validation-setup
title: "Frontmatter Validation Setup"
level: practical
type: guide
tags: [frontmatter, validation, typescript, setup, configuration, bipartite-bqf]
keywords: [frontmatter-validation, typescript-config, bipartite-bqf-validation, canvasl-frontmatter, type-definitions]
prerequisites: [meta-log-db-rfc2119-specification]
enables: [frontmatter-validation-implementation]
related: [meta-log-db-rfc2119-specification, canvasl-metaverse-browser-api]
readingTime: 20
difficulty: 3
version: "1.0.0"
gitTag: "v1.0.0"
blackboard:
  status: active
  assignedAgent: "meta-log-db-documentation-agent"
  lastUpdate: "2025-01-17"
  dependencies: []
  watchers: []
---

# Frontmatter Validation Setup

This document describes the TypeScript configuration setup for validating the CanvasL Frontmatter Knowledge Model according to `docs/28-Canvasl-Frontmatter-Knowledge-Model/` specifications.

## Overview

The TypeScript configurations (`tsconfig.json` and `tsconfig.browser.json`) have been updated to support validation of CanvasL Frontmatter Knowledge Model structures, including:

- Bipartite-BQF metadata structures
- Frontmatter schema validation
- CanvasL ↔ Frontmatter synchronization validation
- Dimensional progression validation

## Type Definitions

### Location

Type definitions are located in:
- **`src/types/frontmatter.ts`**: Complete type definitions for frontmatter structures
- **`src/validation/frontmatter-validator.ts`**: Validation utilities

### Exported Types

The following types are exported from `meta-log-db`:

```typescript
import {
  // Core types
  DocumentFrontmatter,
  BipartiteMetadata,
  BQFObject,
  PolynomialObject,
  BipartitePartition,
  Dimension,
  BQFSignature,
  
  // Validation types
  FrontmatterValidationResult,
  FrontmatterValidationError,
  FrontmatterValidationWarning,
  
  // Validation functions
  validateFrontmatter,
  validateBipartite,
  validateBQF,
  validatePolynomial,
  validateDimensionalProgression
} from 'meta-log-db';
```

## TypeScript Configuration

### tsconfig.json (Node.js)

**Key Features**:
- Includes `docs/28-Canvasl-Frontmatter-Knowledge-Model/**/*.md` for type checking
- Path mappings for `@types/frontmatter` and `@types/canvasl`
- Type roots include `./src/types` for custom type definitions

**Configuration**:
```json
{
  "compilerOptions": {
    "paths": {
      "@types/frontmatter": ["./src/types/frontmatter"],
      "@types/canvasl": ["./src/types/index"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": [
    "src/**/*",
    "docs/28-Canvasl-Frontmatter-Knowledge-Model/**/*.md"
  ]
}
```

### tsconfig.browser.json (Browser)

**Key Features**:
- Extends `tsconfig.json` configuration
- Includes browser-specific types (DOM)
- Same path mappings and type roots as Node.js config
- Includes frontmatter documentation for validation

**Configuration**:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM"],
    "paths": {
      "@types/frontmatter": ["./src/types/frontmatter"],
      "@types/canvasl": ["./src/types/index"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": [
    "src/browser/**/*",
    "src/types/**/*",
    "docs/28-Canvasl-Frontmatter-Knowledge-Model/**/*.md"
  ]
}
```

## Usage Examples

### Validating Frontmatter

```typescript
import { validateFrontmatter, DocumentFrontmatter } from 'meta-log-db';

const frontmatter: DocumentFrontmatter = {
  id: 'example-doc',
  title: 'Example Document',
  level: 'foundational',
  type: 'specification',
  bipartite: {
    partition: 'topology',
    dimension: '2D',
    bqf: {
      form: 'Q(x,y) = x² + y²',
      coefficients: [1, 0, 1],
      signature: 'euclidean',
      variables: ['x', 'y']
    }
  }
};

const result = validateFrontmatter(frontmatter);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Type-Safe Frontmatter Creation

```typescript
import { DocumentFrontmatter, BipartiteMetadata } from 'meta-log-db';

const bipartite: BipartiteMetadata = {
  partition: 'topology',
  dimension: '2D',
  bqf: {
    form: 'Q(x,y) = x² + y²',
    coefficients: [1, 0, 1],
    signature: 'euclidean',
    variables: ['x', 'y'],
    polynomial: 'x² + y²',
    symbol: '(Point0D Point1D)',
    procedure: '(lambda (x y) (+ (* x x) (* y y)))'
  }
};

const frontmatter: DocumentFrontmatter = {
  id: '2d-topology',
  title: '2D Topology',
  bipartite
};
```

### Validating BQF Objects

```typescript
import { validateBQF, BQFObject } from 'meta-log-db';

const bqf: BQFObject = {
  form: 'Q(x,y) = x² + y²',
  coefficients: [1, 0, 1],
  signature: 'euclidean',
  variables: ['x', 'y']
};

const errors = validateBQF(bqf);
if (errors.length > 0) {
  console.error('BQF validation errors:', errors);
}
```

## Validation Rules

The validation utilities enforce the following rules from `docs/28-Canvasl-Frontmatter-Knowledge-Model/reference/validation-rules.md`:

### BQF Validation
- Form must be a non-empty string
- Coefficients must be a non-empty array of numbers
- Signature must be 'euclidean', 'lorentz', or 'custom'
- Variables must be a non-empty array of strings

### Polynomial Validation
- Monad, functor, and perceptron must be arrays of exactly 8 numbers
- All components must be valid numbers

### Bipartite Validation
- Partition must be one of: 'topology', 'system', 'topology-system', 'topology-topology', 'system-system'
- Dimension must be one of: '0D', '1D', '2D', '3D', '4D', '5D', '6D', '7D'

### Dimensional Progression Validation
- BQF variables must match dimension count (0D = 0 vars, 1D = 1 var, etc.)

## Integration with Meta-Log-Db

The frontmatter types and validation utilities are integrated into the main `meta-log-db` package:

- **Node.js**: Available via `import { ... } from 'meta-log-db'`
- **Browser**: Available via `import { ... } from 'meta-log-db/browser'`

Both exports include:
- All frontmatter type definitions
- All validation utilities
- Type-safe interfaces for CanvasL and frontmatter structures

## Related Documentation

- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/00-META-SPECIFICATION-RFC2119.md`**: Meta-specification
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/01-BIPARTITE-BQF-EXTENSION-RFC2119.md`**: Bipartite-BQF extension
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/03-FRONTMATTER-INTEGRATION-RFC2119.md`**: Frontmatter integration
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/reference/validation-rules.md`**: Validation rules reference

## Testing

To verify the TypeScript configuration:

```bash
# Check Node.js config
npx tsc --noEmit --project tsconfig.json

# Check browser config
npx tsc --noEmit --project tsconfig.browser.json
```

## Status

✅ **Complete**: TypeScript configurations are ready for validating CanvasL Frontmatter Knowledge Model structures.

- ✅ Type definitions created (`src/types/frontmatter.ts`)
- ✅ Validation utilities created (`src/validation/frontmatter-validator.ts`)
- ✅ TypeScript configs updated (`tsconfig.json`, `tsconfig.browser.json`)
- ✅ Types exported from main and browser entry points
- ✅ Path mappings configured for type resolution

